"""
OpenRouter AI Service - Python equivalent of openrouter.ts
"""

import os
import json
import re
from openai import OpenAI

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def _is_configured():
    key = OPENROUTER_API_KEY
    if not key:
        return False
    if key.strip().lower().startswith("your_") or "your_openrouter_api_key" in key.lower():
        return False
    return True

def _mock_post(input_data):
    topic = input_data.get("topic", "my recent work")
    tone = input_data.get("tone", "professional")
    hashtags_enabled = input_data.get("hashtagsEnabled", True)
    tags = ["linkedin", "growth", "career"] if hashtags_enabled else []
    hook = f"I recently worked on {topic} and learned a lot along the way."
    main = (
        f"Over the past few weeks, I focused on {topic}. "
        "It pushed me to think differently, collaborate closely, and ship something I'm proud of. "
        "The biggest takeaway: consistent effort and feedback loops make all the difference."
    )
    conclusion = "Grateful for the journey and excited about what's next. Always open to connecting and learning from others."
    cta = "What has been your biggest learning recently? Let me know in the comments."
    full = "\n\n".join(filter(None, [hook, main, conclusion, " ".join(f"#{t}" for t in tags) if tags else None, cta]))
    return {
        "hook": hook,
        "mainContent": main,
        "conclusion": conclusion,
        "hashtags": tags,
        "cta": cta,
        "content": full.strip(),
        "fullContent": full.strip(),
    }
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-120b")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
NEXT_PUBLIC_APP_URL = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")


def get_client():
    if not OPENROUTER_API_KEY:
        raise ValueError("OpenRouter API key is not configured. Set OPENROUTER_API_KEY in your .env file.")
    return OpenAI(
        api_key=OPENROUTER_API_KEY,
        base_url=OPENROUTER_BASE_URL,
        default_headers={
            "HTTP-Referer": NEXT_PUBLIC_APP_URL,
            "X-Title": "LinkedIn Content Creator",
        },
    )


def build_system_prompt(input_data: dict) -> str:
    length_guide = {
        "short": "1 to 3 paragraphs, under 100 words",
        "medium": "3 to 5 paragraphs, 100 to 250 words",
        "long": "5 to 8 paragraphs, 250 to 450 words",
    }

    profile = input_data.get("profile")
    profile_section = ""
    if input_data.get("useProfileContext") and profile:
        profile_section = f"""
USER PROFILE (use ONLY this information — never invent details):
- Name: {profile.get('fullName', 'Not provided')}
- Headline: {profile.get('headline', 'Not provided')}
- Current Role: {profile.get('currentRole', 'Not provided')}
- Education: {profile.get('education', 'Not provided')}
- College/University: {profile.get('collegeUniversity', 'Not provided')}
- Skills: {', '.join(profile.get('skills', [])) if isinstance(profile.get('skills'), list) else profile.get('skills', 'None provided')}
- Work Experience: {profile.get('workExperience', [])}
- Internship Experience: {profile.get('internshipExperience', [])}
- Projects: {profile.get('projects', [])}
- Certifications: {profile.get('certifications', [])}
- Achievements: {profile.get('achievements', [])}
- Professional Interests: {', '.join(profile.get('professionalInterests', []))}

Rules for profile-based generation:
- Only mention skills, projects, experience, and achievements listed above.
- Never invent achievements, experience, or project results.
- Reference real projects by name when relevant.
"""

    return f"""You are an expert LinkedIn copywriter who writes natural, human-sounding posts that avoid generic AI phrasing.

TASK: Write a LinkedIn post about "{input_data['topic']}".

CONSTRAINTS:
- Post Type: {input_data.get('postType', 'project-announcement')}
- Tone: {input_data.get('tone', 'professional')}
- Target Audience: {input_data.get('targetAudience', 'general-audience')}
- Length: {length_guide.get(input_data.get('length', 'medium'), length_guide['medium'])}
- Language: {input_data.get('language', 'english')}
- Emoji Preference: {input_data.get('emojiPreference', 'minimal')}
- Include Hashtags: {'Yes' if input_data.get('hashtagsEnabled', True) else 'No'}
{profile_section}

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
{{
  "hook": "string (opening line)",
  "mainContent": "string (body of the post)",
  "conclusion": "string (closing thoughts)",
  "hashtags": ["string", "string"],
  "cta": "string (call to action)"
}}
"""


def generate_linkedin_post(input_data: dict) -> dict:
    if not _is_configured():
        return _mock_post(input_data)
    try:
        client = get_client()
    except ValueError:
        return _mock_post(input_data)
    system_prompt = build_system_prompt(input_data)

    try:
        completion = client.chat.completions.create(
            model=OPENROUTER_MODEL,
            temperature=0.7,
            max_tokens=1000,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Generate the LinkedIn post now. Return only valid JSON."},
            ],
        )
    except Exception:
        return _mock_post(input_data)

    raw = completion.choices[0].message.content
    if not raw:
        raise ValueError("OpenRouter returned an empty response.")

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r'\{[\s\S]*\}', raw)
        if not match:
            raise ValueError("OpenRouter returned malformed JSON that could not be parsed.")
        try:
            parsed = json.loads(match.group(0))
        except json.JSONDecodeError:
            raise ValueError("OpenRouter returned malformed JSON that could not be parsed.")

    full_content = "\n\n".join(filter(None, [
        parsed.get("hook", ""),
        parsed.get("mainContent", ""),
        parsed.get("conclusion", ""),
        "\n\n" + " ".join(f"#{t}" for t in parsed.get("hashtags", [])) if input_data.get("hashtagsEnabled", True) and parsed.get("hashtags") else None,
        parsed.get("cta", ""),
    ]))

    return {
        "hook": parsed.get("hook", ""),
        "mainContent": parsed.get("mainContent", ""),
        "conclusion": parsed.get("conclusion", ""),
        "hashtags": parsed.get("hashtags", []),
        "cta": parsed.get("cta", ""),
        "content": full_content.strip(),
        "fullContent": full_content.strip(),
    }


def improve_post(content: str, action: str, tone: str = None) -> str:
    if not _is_configured():
        return content
    try:
        client = get_client()
    except ValueError:
        return content

    action_prompts = {
        "improve": "Improve the writing flow and clarity of this LinkedIn post while keeping the voice authentic.",
        "professional": "Make this LinkedIn post more professional and polished.",
        "engaging": "Make this LinkedIn post more engaging and conversation-starting.",
        "shorten": "Shorten this LinkedIn post while keeping the key message intact.",
        "expand": "Expand this LinkedIn post with more detail and depth.",
        "grammar": "Fix grammar and spelling issues in this LinkedIn post.",
        "tone": f"Rewrite this LinkedIn post in a {tone} tone." if tone else "Rewrite this LinkedIn post.",
    }

    try:
        completion = client.chat.completions.create(
            model=OPENROUTER_MODEL,
            temperature=0.7,
            max_tokens=1000,
            messages=[
                {"role": "system", "content": f"You are a LinkedIn editor. {action_prompts.get(action, 'Improve this post.')}. Return only the revised post content, no preamble, no explanation."},
                {"role": "user", "content": content},
            ],
        )
        return completion.choices[0].message.content or content
    except Exception:
        return content


def regenerate_section(content: str, section: str, context: dict) -> str:
    if not _is_configured():
        return content
    try:
        client = get_client()
    except ValueError:
        return content

    section_prompts = {
        "hook": "Write a strong, specific opening hook for a LinkedIn post.",
        "main": "Write the main body content for a LinkedIn post.",
        "conclusion": "Write a conclusion/closing for a LinkedIn post.",
        "hashtags": "Generate 3-5 relevant hashtags for a LinkedIn post. Return only hashtags separated by spaces.",
        "cta": "Write a call-to-action for a LinkedIn post.",
    }

    try:
        completion = client.chat.completions.create(
            model=OPENROUTER_MODEL,
            temperature=0.7,
            max_tokens=500,
            messages=[
                {"role": "system", "content": f"""
TASK: Regenerate only the "{section}" section of a LinkedIn post.
CONTEXT: Topic: {context.get('topic', '')} | Tone: {context.get('tone', '')} | Length: {context.get('length', '')} | Language: {context.get('language', '')}
CURRENT POST: {content}
INSTRUCTION: {section_prompts.get(section, 'Regenerate this section.')}
Return only the new section content, no preamble, no explanation. Preserve the tone and style.
"""},
                {"role": "user", "content": "Regenerate the section now."},
            ],
        )
        return completion.choices[0].message.content or ""
    except Exception:
        return content


def generate_hashtags(topic: str, content: str = "", count: int = 5) -> list:
    if not _is_configured():
        return ["linkedin", "growth", "career", "networking", "professional"]
    try:
        client = get_client()
    except ValueError:
        return ["linkedin", "growth", "career", "networking", "professional"]

    try:
        completion = client.chat.completions.create(
            model=OPENROUTER_MODEL,
            temperature=0.5,
            max_tokens=200,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": f"Generate {count} relevant LinkedIn hashtags for the following topic and post content. Return valid JSON with key \"hashtags\" as an array of strings without the # symbol."},
                {"role": "user", "content": f"Topic: {topic}\nContent: {content}"},
            ],
        )
        raw = completion.choices[0].message.content or "{}"
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            return ["linkedin", "growth", "career", "networking", "professional"]
        return parsed.get("hashtags", []) if isinstance(parsed.get("hashtags"), list) else ["linkedin", "growth", "career", "networking", "professional"]
    except Exception:
        return ["linkedin", "growth", "career", "networking", "professional"]


def generate_post_from_url(input_data: dict) -> dict:
    if not _is_configured():
        return _mock_post(input_data)
    try:
        client = get_client()
    except ValueError:
        return _mock_post(input_data)

    length_guide = {
        "short": "1 to 3 paragraphs, under 100 words",
        "medium": "3 to 5 paragraphs, 100 to 250 words",
        "long": "5 to 8 paragraphs, 250 to 450 words",
    }

    profile = input_data.get("profile")
    profile_section = ""
    if profile:
        profile_section = f"""
USER PROFILE (use ONLY this information — never invent details):
- Name: {profile.get('fullName', 'Not provided')}
- Headline: {profile.get('headline', 'Not provided')}
- Current Role: {profile.get('currentRole', 'Not provided')}
- Skills: {', '.join(profile.get('skills', [])) if isinstance(profile.get('skills'), list) else profile.get('skills', 'None provided')}
- Projects: {profile.get('projects', [])}
"""

    system_prompt = f"""You are an expert LinkedIn copywriter who writes natural, human-sounding posts that avoid generic AI phrasing.

TASK: Convert the following online content into a LinkedIn post.

SOURCE CONTENT (from {input_data.get('sourceUrl', '')}):
Title: {input_data.get('sourceTitle', '')}
Topic: {input_data.get('topic', 'Not specified')}
Content: {input_data.get('sourceContent', '')[:6000]}

CONSTRAINTS:
- Post Type: {input_data.get('postType', 'project-announcement')}
- Tone: {input_data.get('tone', 'professional')}
- Target Audience: {input_data.get('targetAudience', 'general-audience')}
- Length: {length_guide.get(input_data.get('length', 'medium'), length_guide['medium'])}
- Language: {input_data.get('language', 'english')}
- Emoji Preference: {input_data.get('emojiPreference', 'minimal')}
- Include Hashtags: {'Yes' if input_data.get('hashtagsEnabled', True) else 'No'}
{profile_section}

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
{{
  "hook": "string",
  "mainContent": "string",
  "conclusion": "string",
  "hashtags": ["string", "string"],
  "cta": "string"
}}"""

    try:
        completion = client.chat.completions.create(
            model=OPENROUTER_MODEL,
            temperature=0.7,
            max_tokens=1200,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Generate the LinkedIn post now. Return only valid JSON."},
            ],
        )
    except Exception:
        return _mock_post(input_data)

    raw = completion.choices[0].message.content
    if not raw:
        raise ValueError("OpenRouter returned an empty response.")

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r'\{[\s\S]*\}', raw)
        if not match:
            raise ValueError("OpenRouter returned malformed JSON that could not be parsed.")
        try:
            parsed = json.loads(match.group(0))
        except json.JSONDecodeError:
            raise ValueError("OpenRouter returned malformed JSON that could not be parsed.")

    full_content = "\n\n".join(filter(None, [
        parsed.get("hook", ""),
        parsed.get("mainContent", ""),
        parsed.get("conclusion", ""),
        "\n\n" + " ".join(f"#{t}" for t in parsed.get("hashtags", [])) if input_data.get("hashtagsEnabled", True) and parsed.get("hashtags") else None,
        parsed.get("cta", ""),
        f"\n\nSource: {input_data.get('sourceUrl', '')}" if input_data.get("sourceUrl") else None,
    ]))

    return {
        "hook": parsed.get("hook", ""),
        "mainContent": parsed.get("mainContent", ""),
        "conclusion": parsed.get("conclusion", ""),
        "hashtags": parsed.get("hashtags", []),
        "cta": parsed.get("cta", ""),
        "content": full_content.strip(),
        "fullContent": full_content.strip(),
    }


def generate_image_prompt(post_content: str, style: str) -> str:
    client = get_client()

    completion = client.chat.completions.create(
        model=OPENROUTER_MODEL,
        temperature=0.7,
        max_tokens=300,
        messages=[
            {"role": "system", "content": "You are an AI image prompt engineer. Given a LinkedIn post and a style, write a detailed image-generation prompt (2-3 sentences) suitable for Flux/DALL-E/Midjourney. The prompt should describe the visual subject, composition, lighting, color palette, and mood. Return only the prompt text, no preamble."},
            {"role": "user", "content": f"Post: {post_content}\nStyle: {style}"},
        ],
    )

    return completion.choices[0].message.content or ""
