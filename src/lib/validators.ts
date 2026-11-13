/**
 * URL validation and SSRF protection utilities.
 *
 * Security requirements:
 * - Allow only HTTP and HTTPS
 * * Prevent SSRF attacks - block localhost and private IP addresses
 * - Validate redirects
 * - Apply request timeouts
 * - Limit downloaded content size
 */

import { URL } from 'url'

const MAX_CONTENT_SIZE = 10 * 1024 * 1024 // 10 MB
const REQUEST_TIMEOUT_MS = 15000 // 15 seconds
const MAX_REDIRECTS = 5

// Private IP ranges per RFC 1918, RFC 5737, RFC 6598, etc.
const PRIVATE_IP_PREFIXES = [
 '10.',
 '172.16.',
 '172.17.',
 '172.18.',
 '172.19.',
 '172.20.',
 '172.21.',
 '172.22.',
 '172.23.',
 '172.24.',
 '172.25.',
 '172.26.',
 '172.27.',
 '172.28.',
 '172.29.',
 '172.30.',
 '172.31.',
 '192.168.',
 '127.',
 '0.',
 '169.254.', // link-local
 '224.', // multicast
 '240.', // reserved
]

const LOCALHOST_HOSTNAMES = [
 'localhost',
 'localhost.localdomain',
 'local',
]

/**
 * Validates that a URL string is well-formed and uses http/https.
 */
export function isValidUrl(urlString: string): boolean {
 try {
 const url = new URL(urlString)
 return url.protocol === 'http:' || url.protocol === 'https:'
 } catch {
 return false
 }
}

/**
 * Checks whether a hostname resolves to a private/localhost address.
 * This is a heuristic hostname check (defense-in-depth). For production,
 * combine with DNS resolution inspection.
 */
export function isPrivateOrLocalHostname(hostname: string): boolean {
 const lower = hostname.toLowerCase()

 if (LOCALHOST_HOSTNAMES.includes(lower)) return true
 if (lower.endsWith('.local') || lower.endsWith('.invalid')) return true

 // IPv4 literal check
 const parts = lower.split('.')
 if (parts.length === 4 && parts.every((p) => /^\d+$/.test(p))) {
 const first = parts[0]
 const second = parts[1]

 if (first === '10') return true
 if (first === '172') {
 const secondNum = parseInt(second, 10)
 if (!isNaN(secondNum) && secondNum >= 16 && secondNum <= 31) return true
 }
 if (first === '192' && second === '168') return true
 if (first === '127') return true
 if (first === '0') return true
 if (first === '169' && second === '254') return true
 if (first === '224' || first === '240') return true
 }

 return false
}

/**
 * Validates a URL for SSRF safety. Returns { valid: true } or { valid: false, reason }.
 */
export function validateUrlForFetch(urlString: string): {
 valid: boolean
 reason?: string
 url?: URL
} {
 if (!urlString || typeof urlString !== 'string') {
 return { valid: false, reason: 'URL is required.' }
 }

 let url: URL
 try {
 url = new URL(urlString)
 } catch {
 return { valid: false, reason: 'Invalid URL format.' }
 }

 if (url.protocol !== 'http:' && url.protocol !== 'https:') {
 return {
 valid: false,
 reason: 'Only HTTP and HTTPS URLs are allowed.',
 }
 }

 if (!url.hostname) {
 return { valid: false, reason: 'URL must include a hostname.' }
 }

 if (isPrivateOrLocalHostname(url.hostname)) {
 return {
 valid: false,
 reason:
 'Access to localhost, private IP ranges, and local network addresses is not allowed.',
 }
 }

 return { valid: true, url }
}

/**
 * Extracts readable text content from HTML by stripping scripts, styles, and tags.
 * Falls back to raw text if cheerio is not available.
 */
export function extractTextFromHtml(html: string): string {
 let text = html
 .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
 .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
 .replace(/<\/[^>]+>/g, ' ')
 .replace(/<[^>]+>/g, ' ')
 .replace(/&nbsp;/gi, ' ')
 .replace(/&amp;/gi, '&')
 .replace(/&lt;/gi, '<')
 .replace(/&gt;/gi, '>')
 .replace(/&quot;/gi, '"')
 .replace(/&#39;/gi, "'")
 .replace(/\s+/g, ' ')
 .trim()

 return text.slice(0, 20000) // cap extracted text
}

/**
 * Attempts to extract a title from HTML.
 */
export function extractTitleFromHtml(html: string): string {
 const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
 if (match) return match[1].trim().slice(0, 200)

 // Fallback: first h1
 const h1Match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)
 if (h1Match) return h1Match[1].replace(/<[^>]+>/g, ' ').trim().slice(0, 200)

 return ''
}

/**
 * Extracts a description meta tag.
 */
export function extractDescriptionFromHtml(html: string): string {
 const match = html.match(
 /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
 )
 if (match) return match[1].trim().slice(0, 500)
 return ''
}

export { MAX_CONTENT_SIZE, REQUEST_TIMEOUT_MS, MAX_REDIRECTS }
