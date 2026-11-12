"""
URL Fetching Service - Python equivalent of fetcher.ts
SSRF-safe URL content extraction.
"""

import re
import httpx
from urllib.parse import urlparse

MAX_CONTENT_SIZE = 10 * 1024 * 1024  # 10 MB
REQUEST_TIMEOUT = 15.0  # seconds

LOCALHOST_HOSTNAMES = {"localhost", "localhost.localdomain", "local"}


def is_private_or_local(hostname: str) -> bool:
    lower = hostname.lower()
    if lower in LOCALHOST_HOSTNAMES:
        return True
    if lower.endswith(".local") or lower.endswith(".invalid"):
        return True

    parts = lower.split(".")
    if len(parts) == 4 and all(p.isdigit() for p in parts):
        first, second = int(parts[0]), int(parts[1])
        if first == 10:
            return True
        if first == 172 and 16 <= second <= 31:
            return True
        if first == 192 and second == 168:
            return True
        if first == 127:
            return True
        if first == 0:
            return True
        if first == 169 and second == 254:
            return True
        if first in (224, 240):
            return True

    return False


def validate_url(url_string: str) -> tuple[bool, str, str]:
    """Returns (valid, reason, parsed_url)"""
    if not url_string or not isinstance(url_string, str):
        return False, "URL is required.", ""

    try:
        parsed = urlparse(url_string)
    except Exception:
        return False, "Invalid URL format.", ""

    if parsed.scheme not in ("http", "https"):
        return False, "Only HTTP and HTTPS URLs are allowed.", ""

    if not parsed.hostname:
        return False, "URL must include a hostname.", ""

    if is_private_or_local(parsed.hostname):
        return False, "Access to localhost, private IP ranges, and local network addresses is not allowed.", ""

    return True, "", url_string


def extract_text_from_html(html: str) -> str:
    text = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', ' ', html, flags=re.IGNORECASE)
    text = re.sub(r'<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>', ' ', text, flags=re.IGNORECASE)
    text = re.sub(r'</[^>]+>', ' ', text)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&#39;', "'")
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:20000]


def extract_title(html: str) -> str:
    match = re.search(r'<title\b[^>]*>([\s\S]*?)<\/title>', html, re.IGNORECASE)
    if match:
        return match.group(1).strip()[:200]
    h1_match = re.search(r'<h1\b[^>]*>([\s\S]*?)<\/h1>', html, re.IGNORECASE)
    if h1_match:
        return re.sub(r'<[^>]+>', ' ', h1_match.group(1)).strip()[:200]
    return ""


def extract_description(html: str) -> str:
    match = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']*)["\']', html, re.IGNORECASE)
    if match:
        return match.group(1).strip()[:500]
    return ""


async def fetch_and_extract(url_string: str) -> dict:
    valid, reason, _ = validate_url(url_string)
    if not valid:
        raise ValueError(reason)

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT, follow_redirects=True) as client:
        response = await client.get(
            url_string,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; LinkedInContentCreator/1.0)",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            },
        )

    if response.status_code != 200:
        raise ValueError(f"Unable to access URL (HTTP {response.status_code}). Please check the link and try again.")

    content_type = response.headers.get("content-type", "")
    if not any(ct in content_type for ct in ["text/html", "text/plain", "application/xhtml"]):
        raise ValueError("The URL does not point to a readable webpage (HTML or plain text).")

    final_url = str(response.url)
    # Re-validate final URL for SSRF after redirects
    parsed_final = __import__("urllib.parse", fromlist=["urlparse"]).urlparse(final_url)
    if is_private_or_local(parsed_final.hostname or ""):
        raise ValueError("Redirect leads to a private or local address, which is not allowed.")

    html = response.text
    if len(html.encode("utf-8")) > MAX_CONTENT_SIZE:
        raise ValueError("The page content is too large to process. Please paste the content manually instead.")

    title = extract_title(html) or urlparse(url_string).hostname
    description = extract_description(html)
    content = extract_text_from_html(html)

    if not content or len(content) < 50:
        raise ValueError("Could not extract meaningful content from this URL. Try pasting the content manually.")

    return {
        "title": title,
        "description": description,
        "content": content,
        "sourceUrl": final_url,
        "extractedAt": __import__("datetime").datetime.utcnow().isoformat(),
    }
