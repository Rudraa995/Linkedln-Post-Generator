/**
 * OpenRouter AI service — server-side only.
 *
 * All text-generation features route through OpenRouter. API key is kept
 * server-side in environment variables and never exposed to the browser.
 *
 * System prompts are designed to produce natural, human-sounding LinkedIn
 * content that avoids generic AI phrasing and never invents achievements,
 * experience, or statistics.
 */

import { OpenAI } from 'openai'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b'
const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
const NEXT_PUBLIC_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

if (!OPENROUTER_API_KEY) {
  // Only warn at module load time; individual functions throw a clear error.
  console.warn(
    '[openrouter] OPENROUTER_API_KEY is not set. Text generation will fail until configured.',
  )
}

/**
 * Lazily create the OpenAI client only when actually needed.
 * This avoids build-time crashes when the API key is not configured.
 */
function getClient() {
  if (!OPENROUTER_API_KEY) {
    throw new Error(
      'OpenRouter API key is not configured. Set OPENROUTER_API_KEY in your .env file.',
    )
  }
  return new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: {
      'HTTP-Referer': NEXT_PUBLIC_APP_URL,
      'X-Title': 'LinkedIn Content Creator',
    },
  })
}

export type GeneratePostInput = {
  topic: string
  postType: string
  tone: string
  targetAudience: string
  length: string
  language: string
  emojiPreference: string
  hashtagsEnabled: boolean
  useProfileContext: boolean
  profile?: any
}

export type GeneratedPost = {
  hook: string
  mainContent: string
  conclusion: string
  hashtags: string[]
  cta: string
  fullContent: string
}

/**
 * Build a structured system prompt for LinkedIn post generation.
 */
function buildSystemPrompt(input: GeneratePostInput): string {
  const lengthGuide: Record<string, string> = {
    short: '1 to 3 paragraphs, under 100 words',
    medium: '3 to 5 paragraphs, 100 to 250 words',
    long: '5 to 8 paragraphs, 250 to 450 words',
  }

  const profileSection = input.useProfileContext && input.profile
    ? `
USER PROFILE (use ONLY this information — never invent details):
- Name: ${input.profile.fullName || 'Not provided'}
- Headline: ${input.profile.headline || 'Not provided'}
- Current Role: ${input.profile.currentRole || 'Not provided'}
- Education: ${input.profile.education || 'Not provided'}
- College/University: ${input.profile.collegeUniversity || 'Not provided'}
- Skills: ${input.profile.skills?.join(', ') || 'None provided'}
- Work Experience: ${JSON.stringify(input.profile.workExperience || [])}
- Internship Experience: ${JSON.stringify(input.profile.internshipExperience || [])}
- Projects: ${JSON.stringify(input.profile.projects || [])}
- Certifications: ${JSON.stringify(input.profile.certifications || [])}
- Achievements: ${JSON.stringify(input.profile.achievements || [])}
- Professional Interests: ${input.profile.professionalInterests?.join(', ') || 'None provided'}

Rules for profile-based generation:
- Only mention skills, projects, experience, and achievements listed above.
- Never invent achievements, experience, or project results.
- Reference real projects by name when relevant.
- If profile information is insufficient for the topic, acknowledge that honestly.
`
    : ''

  return `You are an expert LinkedIn copywriter who writes natural, human-sounding posts that avoid generic AI phrasing.

TASK: Write a LinkedIn post about "${input.topic}".

CONSTRAINTS:
- Post Type: ${input.postType}
- Tone: ${input.tone}
- Target Audience: ${input.targetAudience}
- Length: ${lengthGuide[input.length] || lengthGuide.medium}
- Language: ${input.language}
- Emoji Preference: ${input.emojiPreference}
- Include Hashtags: ${input.hashtagsEnabled ? 'Yes' : 'No'}
${profileSection}

WRITING RULES:
1. Sound natural and human-written — avoid phrases like "In today's fast-paced world", "Unlock your potential", "Game-changer", "Revolutionary", "Delve", "Tapestry", "Testament", "Moreover", "Furthermore", "In conclusion".
2. Match the selected tone exactly.
3. Address the selected audience directly.
4. Start with a strong, specific hook — no generic openings.
5. Include meaningful content with a clear ending CTA where appropriate.
6. Generate relevant hashtags (3-5) only if enabled.
7. Never invent statistics, achievements, or experience.
8. Use readable formatting with short paragraphs and line breaks.
9. If language is Hindi or Gujarati, write in that language using English script (Hinglish / Gujarati-English mix).
10. If emoji preference is "No Emojis", use zero emojis. If "Minimal", use 1-2. If "Creative", use sparingly for emphasis only.

OUTPUT FORMAT: Return ONLY a valid JSON object with exactly these keys:
{
  "hook": "string (opening line)",
  "mainContent": "string (body of the post)",
  "conclusion": "string (closing thoughts)",
  "hashtags": ["string", "string"],
  "cta": "string (call to action)"
}
`
}

/**
 * Generate a LinkedIn post via OpenRouter.
 */
export async function generateLinkedInPost(
  input: GeneratePostInput,
): Promise<GeneratedPost> {
  if (!OPENROUTER_API_KEY) {
    throw new Error(
      'OpenRouter API key is not configured. Set OPENROUTER_API_KEY in your .env file.',
    )
  }

  const systemPrompt = buildSystemPrompt(input)

  const completion = await getClient().chat.completions.create({
    model: OPENROUTER_MODEL,
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: 'Generate the LinkedIn post now. Return only valid JSON.',
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) {
    throw new Error('OpenRouter returned an empty response.')
  }

  let parsed: any
  try {
    parsed = JSON.parse(raw)
  } catch {
    // Fallback: try to extract JSON from within markdown fences or text
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) {
      throw new Error('OpenRouter returned malformed JSON that could not be parsed.')
    }
    try {
      parsed = JSON.parse(match[0])
    } catch {
      throw new Error('OpenRouter returned malformed JSON that could not be parsed.')
    }
  }

  const fullContent = [
    parsed.hook || '',
    parsed.mainContent || '',
    parsed.conclusion || '',
    input.hashtagsEnabled && parsed.hashtags?.length
      ? '\n\n' + (parsed.hashtags as string[]).map((t) => `#${t}`).join(' ')
      : '',
    parsed.cta || '',
  ]
    .filter(Boolean)
    .join('\n\n')
    .trim()

  return {
    hook: parsed.hook || '',
    mainContent: parsed.mainContent || '',
    conclusion: parsed.conclusion || '',
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
    cta: parsed.cta || '',
    fullContent,
  }
}

/**
 * Generate post variations (alternative hooks/angles).
 */
export async function generatePostVariations(
  input: GeneratePostInput,
  count: number = 3,
): Promise<GeneratedPost[]> {
  const results: GeneratedPost[] = []
  for (let i = 0; i < count; i++) {
    results.push(await generateLinkedInPost(input))
  }
  return results
}

/**
 * Improve / rewrite existing post content.
 */
export async function improvePost(
  content: string,
  action: 'improve' | 'professional' | 'engaging' | 'shorten' | 'expand' | 'grammar' | 'tone',
  tone?: string,
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured.')
  }

  const actionPrompts: Record<string, string> = {
    improve: 'Improve the writing flow and clarity of this LinkedIn post while keeping the voice authentic.',
    professional: 'Make this LinkedIn post more professional and polished.',
    engaging: 'Make this LinkedIn post more engaging and conversation-starting.',
    shorten: 'Shorten this LinkedIn post while keeping the key message intact.',
    expand: 'Expand this LinkedIn post with more detail and depth.',
    grammar: 'Fix grammar and spelling issues in this LinkedIn post.',
    tone: tone ? `Rewrite this LinkedIn post in a ${tone} tone.` : 'Rewrite this LinkedIn post.',
  }

  const completion = await getClient().chat.completions.create({
    model: OPENROUTER_MODEL,
    temperature: 0.7,
    max_tokens: 1000,
    messages: [
      {
        role: 'system',
        content: `You are a LinkedIn editor. ${actionPrompts[action]}. Return only the revised post content, no preamble, no explanation.`,
      },
      { role: 'user', content: content },
    ],
  })

  return completion.choices[0]?.message?.content || content
}

/**
 * Regenerate a specific section of a post.
 */
export async function regeneratePostSection(
  input: {
    content: string
    section: 'hook' | 'main' | 'conclusion' | 'hashtags' | 'cta'
    context: {
      topic: string
      tone: string
      length: string
      language: string
    }
  },
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured.')
  }

  const sectionPrompts: Record<string, string> = {
    hook: 'Write a strong, specific opening hook for a LinkedIn post.',
    main: 'Write the main body content for a LinkedIn post.',
    conclusion: 'Write a conclusion/closing for a LinkedIn post.',
    hashtags: 'Generate 3-5 relevant hashtags for a LinkedIn post. Return only hashtags separated by spaces.',
    cta: 'Write a call-to-action for a LinkedIn post.',
  }

  const completion = await getClient().chat.completions.create({
    model: OPENROUTER_MODEL,
    temperature: 0.7,
    max_tokens: 500,
    messages: [
      {
        role: 'system',
        content: `
TASK: Regenerate only the "${input.section}" section of a LinkedIn post.
CONTEXT: Topic: ${input.context.topic} | Tone: ${input.context.tone} | Length: ${input.context.length} | Language: ${input.context.language}
CURRENT POST: ${input.content}
INSTRUCTION: ${sectionPrompts[input.section]}
Return only the new section content, no preamble, no explanation. Preserve the tone and style.
`,
      },
      { role: 'user', content: 'Regenerate the section now.' },
    ],
  })

  return completion.choices[0]?.message?.content || ''
}

/**
 * Generate hashtags for a post.
 */
export async function generateHashtags(
  topic: string,
  content: string,
  count: number = 5,
): Promise<string[]> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured.')
  }

  const completion = await getClient().chat.completions.create({
    model: OPENROUTER_MODEL,
    temperature: 0.5,
    max_tokens: 200,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Generate ${count} relevant LinkedIn hashtags for the following topic and post content. Return valid JSON with key "hashtags" as an array of strings without the # symbol.`,
      },
      { role: 'user', content: `Topic: ${topic}\nContent: ${content}` },
    ],
  })

  const raw = completion.choices[0]?.message?.content || '{}'
  let parsed: any
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  return Array.isArray(parsed.hashtags) ? parsed.hashtags : []
}

/**
 * Generate a LinkedIn post from extracted URL content.
 */
export async function generatePostFromUrl(input: {
  topic?: string
  postType: string
  tone: string
  targetAudience: string
  length: string
  language: string
  emojiPreference: string
  hashtagsEnabled: boolean
  sourceContent: string
  sourceTitle: string
  sourceUrl: string
  profile?: any
}): Promise<GeneratedPost> {
  if (!OPENROUTER_API_KEY) {
    throw new Error(
      'OpenRouter API key is not configured. Set OPENROUTER_API_KEY in your .env file.',
    )
  }

  const lengthGuide: Record<string, string> = {
    short: '1 to 3 paragraphs, under 100 words',
    medium: '3 to 5 paragraphs, 100 to 250 words',
    long: '5 to 8 paragraphs, 250 to 450 words',
  }

  const profileSection = input.profile
    ? `
USER PROFILE (use ONLY this information — never invent details):
- Name: ${input.profile.fullName || 'Not provided'}
- Headline: ${input.profile.headline || 'Not provided'}
- Current Role: ${input.profile.currentRole || 'Not provided'}
- Skills: ${input.profile.skills?.join(', ') || 'None provided'}
- Projects: ${JSON.stringify(input.profile.projects || [])}
`
    : ''

  const systemPrompt = `You are an expert LinkedIn copywriter who writes natural, human-sounding posts that avoid generic AI phrasing.

TASK: Convert the following online content into a LinkedIn post.

SOURCE CONTENT (from ${input.sourceUrl}):
Title: ${input.sourceTitle}
Topic: ${input.topic || 'Not specified'}
Content: ${input.sourceContent.slice(0, 6000)}

CONSTRAINTS:
- Post Type: ${input.postType}
- Tone: ${input.tone}
- Target Audience: ${input.targetAudience}
- Length: ${lengthGuide[input.length] || lengthGuide.medium}
- Language: ${input.language}
- Emoji Preference: ${input.emojiPreference}
- Include Hashtags: ${input.hashtagsEnabled ? 'Yes' : 'No'}
${profileSection}

WRITING RULES:
1. Sound natural and human-written — avoid generic AI phrases.
2. Understand the original content and extract the important information.
3. Identify the main topic and convert technical content into readable LinkedIn content.
4. Preserve factual accuracy — never invent statistics, achievements, or experience.
5. Do not copy content word for word — rewrite it in your own voice.
6. Start with a strong, specific hook.
7. Include meaningful content and end with a suitable CTA where appropriate.
8. Generate relevant hashtags (3-5) only if enabled.
9. Include source attribution when appropriate (mention the source URL or publication).
10. If language is Hindi or Gujarati, write in that language using English script.

OUTPUT FORMAT: Return ONLY a valid JSON object with exactly these keys:
{
  "hook": "string",
  "mainContent": "string",
  "conclusion": "string",
  "hashtags": ["string", "string"],
  "cta": "string"
}`

  const completion = await getClient().chat.completions.create({
    model: OPENROUTER_MODEL,
    temperature: 0.7,
    max_tokens: 1200,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: 'Generate the LinkedIn post now. Return only valid JSON.',
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) {
    throw new Error('OpenRouter returned an empty response.')
  }

  let parsed: any
  try {
    parsed = JSON.parse(raw)
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) {
      throw new Error('OpenRouter returned malformed JSON that could not be parsed.')
    }
    try {
      parsed = JSON.parse(match[0])
    } catch {
      throw new Error('OpenRouter returned malformed JSON that could not be parsed.')
    }
  }

  const fullContent = [
    parsed.hook || '',
    parsed.mainContent || '',
    parsed.conclusion || '',
    input.hashtagsEnabled && parsed.hashtags?.length
      ? '\n\n' + (parsed.hashtags as string[]).map((t: string) => `#${t}`).join(' ')
      : '',
    parsed.cta || '',
    input.sourceUrl ? `\n\nSource: ${input.sourceUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
    .trim()

  return {
    hook: parsed.hook || '',
    mainContent: parsed.mainContent || '',
    conclusion: parsed.conclusion || '',
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
    cta: parsed.cta || '',
    fullContent,
  }
}

/**
 * Generate an image-generation prompt from a LinkedIn post.
 */
export async function generateImagePrompt(
  postContent: string,
  style: string,
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured.')
  }

  const completion = await getClient().chat.completions.create({
    model: OPENROUTER_MODEL,
    temperature: 0.7,
    max_tokens: 300,
    messages: [
      {
        role: 'system',
        content: `You are an AI image prompt engineer. Given a LinkedIn post and a style, write a detailed image-generation prompt (2-3 sentences) suitable for Flux/DALL-E/Midjourney. The prompt should describe the visual subject, composition, lighting, color palette, and mood. Return only the prompt text, no preamble.`,
      },
      { role: 'user', content: `Post: ${postContent}\nStyle: ${style}` },
    ],
  })

  return completion.choices[0]?.message?.content || ''
}
