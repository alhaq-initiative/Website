"""Reusable website chatbot template for Hugging Face Spaces.

This app is project-agnostic by design. Configure it with environment variables
to reuse the same code across different websites and products.
"""

import json
import math
import os
import re
from collections import Counter
from pathlib import Path
from typing import List, Tuple

import gradio as gr
from huggingface_hub import InferenceClient


def _get_env(name: str, default: str) -> str:
    value = os.getenv(name, default)
    return value.strip() if isinstance(value, str) else default


# Generic project configuration (override in Space Variables)
PROJECT_NAME = _get_env("PROJECT_NAME", "Al-Haq Initiative")
PROJECT_TAGLINE = _get_env(
    "PROJECT_TAGLINE",
    "Seeking Truth in History, Protecting Health in the Present.",
)
PROJECT_URL = _get_env("PROJECT_URL", "https://alhaq-initiative.org")
SITE_BASE = _get_env("SITE_BASE", PROJECT_URL).rstrip("/")
PROJECT_DESCRIPTION = _get_env(
    "PROJECT_DESCRIPTION",
    (
        "The Al-Haq Initiative (مبادرة الحق) is a personal digital and literary "
        "movement led by Afrasyaab Meranai, focused on seeking truth in history "
        "and protecting mental and spiritual wellbeing. "
        "At Al-Haq Studio, we believe in using technology to make a positive impact. "
        "That is why all of our free tools and community solutions are offered directly through the "
        "Al-Haq Initiative—our dedicated mission to provide free, high-quality digital tools to the public, "
        "entirely built and backed by our studio. "
        "Al-Haq Studio (Al-Haq Digital Services & Solutions — UK sole trader) is the founder's "
        "software studio for building and delivering these tools. "
        "Mission pillars: Truth in history (primary-source research), "
        "Protection in the present (digital wellbeing tools), and "
        "Resilience (community). Founder: Afrasyaab Meranai "
        "(also known as Habibur Rahman). Al-Haq Initiative is not a charity, "
        "non-profit, or registered organization."
    ),
)
PROJECT_LINKS = _get_env(
    "PROJECT_LINKS",
    (
        f"Home: {SITE_BASE}/, About: {SITE_BASE}/about.html, "
        f"Projects: {SITE_BASE}/services.html, "
        f"Products & Services: {SITE_BASE}/products.html, "
        f"AmnShield (independent protection app — own website): https://amnshield.com, "
        f"AmnShield Beta signup: {SITE_BASE}/amnshield_join_beta.html, "
        f"Al-Haq Hub (Islamic productivity app, beta): {SITE_BASE}/alhaq-hub.html, "
        f"Al-Haq Hub Beta signup: {SITE_BASE}/alhaq-hub-join-beta.html, "
        f"Quran Hub (Quran reader web app): {SITE_BASE}/quran.html, "
        f"Library (Books + Media): {SITE_BASE}/library.html, "
        f"Infographics: {SITE_BASE}/all-infographics.html, "
        f"Media: {SITE_BASE}/media.html, "
        f"Help & FAQ: {SITE_BASE}/help.html, "
        f"Contact: {SITE_BASE}/contact.html, "
        f"Donate / Sponsor: {SITE_BASE}/donate.html, "
        f"Support Hub: {SITE_BASE}/support_hub.html, "
        f"Legal & Docs: {SITE_BASE}/legal/docs.html"
    ),
)
ASSISTANT_STYLE = _get_env(
    "ASSISTANT_STYLE",
    (
        "Be concise, accurate, and respectful. Reflect the values of Al-Haq "
        "(The Truth). Prioritize primary sources for historical questions and "
        "point users to the relevant page on the website. Never claim Al-Haq "
        "Initiative is a charity or registered organization. Software is "
        "delivered by Al-Haq Studio; academic/literary works are authored "
        "personally by the founder. Avoid promoting any immoral or unethical "
        "behavior."
    ),
)

# Extended Al-Haq context: founder, projects, support channels.
# Override in Space Variables for reuse on other websites.
PROJECT_FOUNDER = _get_env(
    "PROJECT_FOUNDER",
    (
        "Afrasyaab Meranai (legal name; first name Afrasyaab, surname Meranai), "
        "also known casually as Habibur Rahman. He is the sole founder, "
        "developer, and writer behind both Al-Haq Studio and the Al-Haq "
        "Initiative. Software, products, and services are delivered under "
        "Al-Haq Studio (Al-Haq Digital Services & Solutions — UK sole trader). "
        "Academic and literary works are authored personally by him."
    ),
)
PROJECT_GOALS = _get_env(
    "PROJECT_GOALS",
    (
        "Mission pillars: (1) Truth in history — validate historical "
        "narratives through primary-source research; (2) Protection in the "
        "present — tools that protect mental and spiritual wellbeing of the "
        "community; (3) Resilience — strengthen the community through honest "
        "knowledge and ethical technology."
    ),
)
PROJECT_PROJECTS = _get_env(
    "PROJECT_PROJECTS",
    (
        "BRAND RELATIONSHIP: Al-Haq Studio is a separate UK-based software "
        "studio by the same founder; Al-Haq Initiative is the broader digital "
        "and literary movement. "
        "PRODUCTS (available today, under Al-Haq Studio): "
        f"AmnShield \u2014 independent digital protection app for habit management and "
        f"spiritual wellbeing. It has its own website at https://amnshield.com. "
        f"On the Al-Haq Initiative site, visitors can join the AmnShield beta at "
        f"{SITE_BASE}/amnshield_join_beta.html. AmnShield is freemium (free tier + premium plans). "
        f"Quran Hub (web app) \u2014 standalone Quran reader at {SITE_BASE}/quran.html. "
        f"Library & Media Hub \u2014 books, audio, and video at {SITE_BASE}/library.html and {SITE_BASE}/media.html. "
        f"Al-Haq Studio \u2014 web development, security, and Islamic app delivery. "
        f"See {SITE_BASE}/products.html for the full products and services listing. "
        "PROJECTS (ongoing / upcoming): "
        f"Al-Haq Hub \u2014 Islamic productivity mobile app (prayer times, Qibla, "
        "adhkaar, productivity) with the Quran Hub feature for AI Quran "
        "recitation feedback and memorization, powered by the in-house AI "
        f"engine TaleemAI; currently Android beta, see {SITE_BASE}/alhaq-hub.html and "
        f"{SITE_BASE}/alhaq-hub-join-beta.html. "
        "Faith Sellers (\u0628\u0627\u0626\u0639\u064a \u0627\u0644\u0642\u062f\u0631) \u2014 long-term translation and "
        "cross-referencing of Saladin's history against contemporary "
        "chroniclers (Ibn Shaddad, Ibn al-Athir). "
        "Lessons from Islamic Civilization \u2014 booklets on academic and moral "
        "contributions of the past. "
        "The Caretaker's Guide \u2014 survival guide and historical perspective "
        "for young people (14+) in high-tension environments. "
        "Documentary Snippets \u2014 visual breakdowns of primary-source "
        "manuscripts. "
        f"All projects: {SITE_BASE}/services.html."
    ),
)
PROJECT_SUPPORT = _get_env(
    "PROJECT_SUPPORT",
    (
        "Visitors can support the work in several ways. "
        f"(a) Donate / sponsor at {SITE_BASE}/donate.html \u2014 donations go to the founder "
        "as a UK sole trader (Al-Haq Studio — Al-Haq Digital Services & Solutions); the founder personally commits, "
        "as a Muslim, to spend donation income on Al-Haq Initiative projects. "
        "(b) GitHub Sponsors \u2014 preferred sponsorship channel for backing the "
        "founder under the open-source community model; offer it alongside "
        f"{SITE_BASE}/donate.html. "
        "(c) Upgrade to AmnShield premium (freemium business income that the "
        "founder reinvests into the projects). "
        f"(d) Share the website, join the Al-Haq Hub beta at {SITE_BASE}/alhaq-hub-join-beta.html, "
        f"or contact the team via {SITE_BASE}/contact.html for collaboration. "
        "Never describe donations as tax-deductible, charitable, or going to "
        "a registered charity/non-profit/CIC."
    ),
)

# Remote inference settings for lightweight runtime on CPU Basic
HF_TOKEN = os.getenv("HF_TOKEN", "").strip()
MODEL_ID = _get_env("MODEL_ID", "Qwen/Qwen2.5-7B-Instruct")
MAX_TOKENS = int(_get_env("MAX_TOKENS", "380"))
TEMPERATURE = float(_get_env("TEMPERATURE", "0.55"))

# Retrieval (RAG) settings — pulls live site content from site_index.json
SITE_INDEX_PATH = Path(__file__).parent / "site_index.json"
RAG_TOP_K = int(_get_env("RAG_TOP_K", "4"))
RAG_MIN_SCORE = float(_get_env("RAG_MIN_SCORE", "0.05"))

_STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has",
    "have", "how", "i", "in", "is", "it", "its", "of", "on", "or", "that",
    "the", "this", "to", "was", "what", "when", "where", "who", "why",
    "will", "with", "you", "your", "about", "can", "do", "does", "me",
    "my", "we", "our", "us", "so", "if", "any", "there", "their", "them",
}

# Unicode-aware token pattern: matches runs of letters/digits in any script
# (Latin, Arabic, Persian, Pashto, etc.). Stopword filter only applies to
# lowercase ASCII tokens, so non-English text is preserved as-is.
_TOKEN_RE = re.compile(r"[^\W_]+", re.UNICODE)


def _tokenize(text: str) -> List[str]:
    tokens = []
    for raw in _TOKEN_RE.findall(text or ""):
        tok = raw.lower()
        if len(tok) < 2:
            continue
        if tok.isascii() and tok in _STOPWORDS:
            continue
        tokens.append(tok)
    return tokens


def _load_site_index():
    """Load chunks and pre-compute TF-IDF stats. Returns (chunks, idf)."""
    if not SITE_INDEX_PATH.exists():
        print(f"[rag] site_index.json not found at {SITE_INDEX_PATH}")
        return [], {}
    try:
        with SITE_INDEX_PATH.open("r", encoding="utf-8") as fh:
            payload = json.load(fh)
    except Exception as exc:  # pylint: disable=broad-except
        print(f"[rag] failed to read site_index.json: {exc}")
        return [], {}

    chunks = payload.get("chunks", []) or []
    df: Counter = Counter()
    for ch in chunks:
        tokens = set(_tokenize(ch.get("text", "")))
        ch["_tokens"] = Counter(_tokenize(ch.get("text", "")))
        for tok in tokens:
            df[tok] += 1

    n_docs = max(len(chunks), 1)
    idf = {tok: math.log((n_docs + 1) / (count + 1)) + 1.0 for tok, count in df.items()}
    print(f"[rag] loaded {len(chunks)} chunks, vocab={len(idf)}")
    return chunks, idf


_SITE_CHUNKS, _SITE_IDF = _load_site_index()


def _retrieve(query: str, k: int = RAG_TOP_K) -> List[dict]:
    if not _SITE_CHUNKS or not query.strip():
        return []
    q_tokens = _tokenize(query)
    if not q_tokens:
        return []
    q_vec: Counter = Counter(q_tokens)

    scored = []
    for ch in _SITE_CHUNKS:
        tf = ch.get("_tokens") or Counter()
        if not tf:
            continue
        score = 0.0
        for tok, q_count in q_vec.items():
            if tok in tf:
                score += q_count * tf[tok] * _SITE_IDF.get(tok, 1.0)
        if score <= 0:
            continue
        norm = math.sqrt(sum(c * c for c in tf.values())) or 1.0
        scored.append((score / norm, ch))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = [ch for s, ch in scored[:k] if s >= RAG_MIN_SCORE]
    return top


def _format_context(chunks: List[dict]) -> str:
    if not chunks:
        return ""
    lines = [
        "LIVE SITE CONTEXT (verbatim excerpts from the website — use these as "
        "the source of truth when answering, and cite the matching page link):",
    ]
    for i, ch in enumerate(chunks, 1):
        page = ch.get("page", "Page")
        url = ch.get("url", "")
        lang = ch.get("lang", "en")
        text = (ch.get("text") or "").strip()
        if len(text) > 800:
            text = text[:800] + "…"
        lines.append(f"[{i}] ({lang}) {page} — {url}\n{text}")
    return "\n\n".join(lines)


SYSTEM_PROMPT = f"""
You are the official website assistant for {PROJECT_NAME}.

PROJECT OVERVIEW:
{PROJECT_DESCRIPTION}

TAGLINE:
{PROJECT_TAGLINE}

FOUNDER:
{PROJECT_FOUNDER}

GOALS / MISSION:
{PROJECT_GOALS}

PROJECTS & PRODUCTS:
{PROJECT_PROJECTS}

HOW VISITORS CAN SUPPORT:
{PROJECT_SUPPORT}

KEY LINKS:
{PROJECT_LINKS}

ASSISTANT BEHAVIOR:
{ASSISTANT_STYLE}

YOUR ROLE — guide and lead the visitor:
1. Greet warmly when the conversation starts. Briefly state who you are and
   offer 2-3 short suggestions (e.g. "Learn about the mission", "Explore
   projects", "Support the work").
2. ALWAYS render links as clickable Markdown links using the full absolute
   URL from KEY LINKS. Format: [Descriptive label]({SITE_BASE}/page.html).
   NEVER paste a bare URL on its own line, and NEVER use a relative path
   like /library.html \u2014 it will not work inside the chat iframe.
   Example: "Browse the [Library]({SITE_BASE}/library.html)
   for our books and media."
3. Every page reference must include a 1-2 sentence description of what
   the visitor will find on that page, followed by the markdown link.
4. For every meaningful answer, end with ONE concrete next step: a specific
   markdown link from KEY LINKS, or a clear suggested action.
5. When a topic touches Al-Haq Hub, Quran Hub, the Library, or
   Documentary Snippets, mention the matching page and invite the visitor
   to open it (as a markdown link).
6. When a visitor shows interest, alignment, or asks "how can I help",
   gently invite them to support: link to [Donate]({SITE_BASE}/donate.html),
   mention GitHub Sponsors, sharing the site, or joining
   the Al-Haq Hub beta. Be sincere and respectful \u2014 never pushy.
7. For historical questions, prioritize primary sources and clearly say
   when something is still under research (e.g. Faith Sellers is an
   ongoing translation/cross-referencing effort).
8. For technical/service questions, route the visitor to
   [Contact]({SITE_BASE}/contact.html).

HARD RULES:
- Keep responses short and practical (typically 3-7 sentences + 1 link).
- LANGUAGE: detect the user's language from their message and reply in the
  SAME language (English, Arabic, Persian/Farsi, Pashto, Urdu, French,
  etc.). Translate link labels too — e.g. write [المكتبة]({SITE_BASE}/library.html)
  in Arabic, [کتابخانه](...) in Persian — but keep the URL exactly as given
  in KEY LINKS. For RTL languages, write naturally in RTL; do not transliterate.
- When a "LIVE SITE CONTEXT" block is provided in the conversation, treat it
  as the authoritative source for facts about pages, products, and policies.
  Prefer wording and details from that context over generic background, and
  link to the page URL given alongside each excerpt. Each excerpt is tagged
  with a language code — prefer excerpts matching the user's language when
  available, but fall back to English excerpts otherwise (translating their
  content into the user's language in your reply).
- Do not invent product features, pricing, dates, or policy facts.
- Never call Al-Haq Initiative a charity, non-profit, NGO, registered
  organization, 501(c), or CIC. It is a personal initiative; products and
  services are delivered by Al-Haq Studio (Al-Haq Digital Services & Solutions — UK sole trader).
- Software / products / services attribution: "Developed by Al-Haq Studio."
- Academic / literary work attribution: "by Afrasyaab Meranai (Habibur Rahman)."
- Do not promote or endorse immoral, abusive, or unethical behavior.
- If asked about something outside this context, state your limits clearly
  and suggest the [Contact]({SITE_BASE}/contact.html) page.
""".strip()


def _build_messages(user_message: str, chat_history) -> list:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for item in chat_history or []:
        # Supports both legacy tuple format and new {"role","content"} dict format
        if isinstance(item, dict) and "role" in item and "content" in item:
            messages.append({"role": item["role"], "content": item["content"]})
        elif isinstance(item, (list, tuple)) and len(item) == 2:
            user_msg, assistant_msg = item
            if user_msg:
                messages.append({"role": "user", "content": user_msg})
            if assistant_msg:
                messages.append({"role": "assistant", "content": assistant_msg})

    # Real-time retrieval: pull the most relevant page excerpts and pass them
    # as an extra system message so the model can ground its answer in the
    # current website content rather than only the static system prompt.
    retrieved = _retrieve(user_message)
    context_block = _format_context(retrieved)
    if context_block:
        messages.append({"role": "system", "content": context_block})

    messages.append({"role": "user", "content": user_message})
    return messages


def respond(user_message: str, chat_history) -> str:
    if not HF_TOKEN:
        return (
            "This chatbot is not configured yet. Add HF_TOKEN in Space Secrets, "
            "then restart the Space."
        )

    messages = _build_messages(user_message, chat_history)
    client = InferenceClient(api_key=HF_TOKEN)

    try:
        completion = client.chat.completions.create(
            model=MODEL_ID,
            messages=messages,
            max_tokens=MAX_TOKENS,
            temperature=TEMPERATURE,
        )
        return completion.choices[0].message.content.strip()
    except Exception as exc:  # pylint: disable=broad-except
        return (
            "The assistant hit a temporary upstream error. "
            "Please retry in a moment. "
            f"Details: {exc}"
        )


CHAT_CSS = """
:root {
  --alhaq-blue: #1d4ed8;
  --alhaq-blue-dark: #1e3a8a;
  --alhaq-blue-deep: #0f172a;
  --alhaq-bg: #ffffff;
  --alhaq-surface: #ffffff;
  --alhaq-bubble-bot: #f1f5f9;
  --alhaq-text: #0f172a;
  --alhaq-muted: #475569;
  --alhaq-border: #e2e8f0;
}

/* ---------- Force light scheme even if user/system prefers dark ---------- */
html, body, gradio-app, .dark { color-scheme: light !important; }
.dark, body.dark, gradio-app.dark, .gradio-container.dark { background: #ffffff !important; color: #0f172a !important; }
.dark *, .gradio-container.dark * { color: inherit; }

/* ---------- Global reset / fill height ---------- */
html, body, gradio-app {
  background: var(--alhaq-bg) !important;
  height: 100% !important;
  min-height: 100% !important;
  margin: 0 !important;
  color: var(--alhaq-text) !important;
  font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
  font-size: 16px !important;
}
gradio-app { display: block !important; }
footer, .footer, gradio-app footer, .built-with, .api-docs, .show-api, .svelte-1ipelgc { display: none !important; }

.gradio-container,
.gradio-container > div,
.gradio-container .main,
.gradio-container .wrap,
.gradio-container .contain,
.gradio-container .form,
.gradio-container .panel {
  max-width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  gap: 0 !important;
}
.gradio-container { height: 100% !important; min-height: 100% !important; display: flex !important; flex-direction: column !important; }
.gradio-container > div,
.gradio-container .main,
.gradio-container .wrap { flex: 1 1 auto !important; min-height: 0 !important; display: flex !important; flex-direction: column !important; }

/* Keep ChatInterface layout bounded so messages don't expand the whole page. */
.gradio-container .contain,
.gradio-container .contain > .column,
.gradio-container #component-1,
.gradio-container #component-1 .wrapper {
    min-height: 0 !important;
}
.gradio-container .contain > .column,
.gradio-container #component-1 {
    overflow: hidden !important;
}
.gradio-container #component-1 .wrapper {
    height: 100% !important;
    max-height: 100% !important;
}

/* Hide the previous in-iframe header shell entirely */
#alhaq-chat-shell { display: none !important; }

/* ---------- Chatbot scroll area (Gradio 5 DOM) ---------- */
/* Keep scrolling logic strict: only the message list should scroll. */
.bubble-wrap {
    flex: 1 1 auto !important;
    height: 100% !important;
    min-height: 0 !important;
    max-height: 100% !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    overscroll-behavior: contain !important;
    -webkit-overflow-scrolling: touch;
    background: transparent !important;
    border: none !important;
    padding: 14px 14px 8px !important;
    scrollbar-width: thin;
    scrollbar-color: #94a3b8 #f1f5f9;
}
.bubble-wrap::-webkit-scrollbar { width: 10px; background: #f1f5f9; }
.bubble-wrap::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px; }
.bubble-wrap::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 8px; border: 2px solid #f1f5f9; }
.bubble-wrap::-webkit-scrollbar-thumb:hover { background: #64748b; }

/* ---------- Message bubbles ---------- */
.message, .message-row, [class*="bubble"], [class*="message"] {
  font-size: 16px !important;
  line-height: 1.7 !important;
  letter-spacing: 0.005em;
  color: var(--alhaq-text) !important;
}
.message p, .message li, .message span, .message div { font-size: 16px !important; line-height: 1.7 !important; color: inherit !important; }
.message h1, .message h2, .message h3, .message h4 { color: var(--alhaq-text) !important; margin: 8px 0 4px !important; }
.message ul, .message ol { padding-left: 22px !important; margin: 6px 0 !important; }

/* Assistant bubble */
.message.bot, .message.assistant, [data-testid="bot"],
.message-row[class*="bot"] .message,
.message-row[class*="assistant"] .message,
[class*="bubble-bot"], [class*="bubble-assistant"] {
  background: var(--alhaq-bubble-bot) !important;
  border: 1px solid var(--alhaq-border) !important;
  color: var(--alhaq-text) !important;
  border-radius: 14px !important;
  padding: 12px 14px !important;
  box-shadow: 0 1px 2px rgba(15,23,42,.04) !important;
}

/* User bubble */
.message.user, [data-testid="user"],
.message-row[class*="user"] .message,
[class*="bubble-user"] {
  background: linear-gradient(135deg, var(--alhaq-blue-dark), var(--alhaq-blue)) !important;
  color: #ffffff !important;
  border: none !important;
  border-radius: 14px !important;
  padding: 12px 14px !important;
}
.message.user *, [data-testid="user"] *, [class*="bubble-user"] * { color: #ffffff !important; }

/* Links inside bubbles */
.message a, [class*="bubble"] a, .gr-chatbot a {
  color: var(--alhaq-blue-dark) !important;
  font-weight: 700 !important;
  text-decoration: underline !important;
  text-decoration-color: rgba(30,58,138,.45) !important;
  text-underline-offset: 3px !important;
}
.message.user a, [data-testid="user"] a, [class*="bubble-user"] a {
  color: #fde68a !important;
  text-decoration-color: rgba(253,230,138,.7) !important;
}
.message a:hover, [class*="bubble"] a:hover { text-decoration-color: currentColor !important; }

/* Code blocks */
.message code, .message pre { font-size: 14px !important; background: rgba(15,23,42,.06) !important; border-radius: 6px !important; padding: 2px 6px !important; }
.message pre { padding: 10px 12px !important; overflow-x: auto !important; }

/* Spacing between rows */
.message-row, [class*="message-row"] { margin-bottom: 10px !important; }

/* ---------- Input box ---------- */
textarea, .gr-textbox textarea, textarea.scroll-hide {
  border-radius: 12px !important;
  border: 1.5px solid var(--alhaq-border) !important;
  background: #ffffff !important;
  color: var(--alhaq-text) !important;
  box-shadow: 0 1px 2px rgba(15,23,42,.04) !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
  padding: 12px 14px !important;
}
textarea::placeholder { color: #94a3b8 !important; opacity: 1 !important; }
textarea:focus, .gr-textbox textarea:focus {
  border-color: var(--alhaq-blue) !important;
  box-shadow: 0 0 0 3px rgba(29,78,216,.18) !important;
  outline: none !important;
}

/* ---------- Submit button ---------- */
button.primary, .gr-button-primary, button[variant="primary"],
button[class*="submit"], button[aria-label*="Send"], button[title*="Send"] {
  background: linear-gradient(135deg, var(--alhaq-blue-dark), var(--alhaq-blue)) !important;
  border: none !important;
  color: #ffffff !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 14px rgba(29,78,216,.35) !important;
}
button.primary:hover, .gr-button-primary:hover { filter: brightness(1.08); }

/* ---------- Examples chips ---------- */
.examples, .gr-examples, [class*="examples"] {
  background: transparent !important;
  border: none !important;
  padding: 6px 14px 12px !important;
}
.examples button, .gr-examples button, [class*="examples"] button {
  background: #eff6ff !important;
  color: var(--alhaq-blue-dark) !important;
  border: 1px solid #bfdbfe !important;
  border-radius: 9999px !important;
  font-size: 13px !important;
  line-height: 1.3 !important;
  padding: 8px 14px !important;
  font-weight: 600 !important;
  white-space: normal !important;
  text-align: left !important;
}
.examples button:hover, .gr-examples button:hover { background: #dbeafe !important; }

/* Labels (hide "Chatbot" label box if it shows up) */
.label-wrap, [data-testid="block-label"], .gr-chatbot > .label, .gr-chatbot label.svelte-1ipelgc { display: none !important; }
"""


HEAD_HTML = """
<script>
// 1) Force light theme (some browsers ignore the URL param).
// 2) Open all chat links in the parent window so they navigate the host site.
(function(){
  try {
    document.documentElement.classList.remove('dark');
    document.body && document.body.classList.remove('dark');
    var obs = new MutationObserver(function(){
      if (document.documentElement.classList.contains('dark')) document.documentElement.classList.remove('dark');
      if (document.body && document.body.classList.contains('dark')) document.body.classList.remove('dark');
    });
    obs.observe(document.documentElement, {attributes:true, attributeFilter:['class']});
    if (document.body) obs.observe(document.body, {attributes:true, attributeFilter:['class']});
  } catch(e) {}

  function patch(){
    document.querySelectorAll('.message a, .gr-chatbot a, [class*="bubble"] a').forEach(function(a){
      if (a.dataset.alhaqPatched) return;
      a.dataset.alhaqPatched = '1';
      a.setAttribute('target', '_top');
      a.setAttribute('rel', 'noopener');
    });
  }

    function lockLayout(){
        try {
            var c0 = document.querySelector('#component-0');
            var c1 = document.querySelector('#component-1');
            var wrap = c1 ? c1.querySelector('.wrapper') : null;
            var bubbles = document.querySelector('.bubble-wrap');

            [c0, c1, wrap].forEach(function(el){
                if (!el) return;
                el.style.setProperty('min-height', '0', 'important');
            });

            if (c0) c0.style.setProperty('overflow', 'hidden', 'important');
            if (c1) {
                c1.style.setProperty('overflow', 'hidden', 'important');
                c1.style.setProperty('height', '100%', 'important');
                c1.style.setProperty('max-height', '100%', 'important');
            }
            if (wrap) {
                wrap.style.setProperty('height', '100%', 'important');
                wrap.style.setProperty('max-height', '100%', 'important');
            }
            if (bubbles) {
                bubbles.style.setProperty('min-height', '0', 'important');
                bubbles.style.setProperty('height', '100%', 'important');
                bubbles.style.setProperty('max-height', '100%', 'important');
                bubbles.style.setProperty('overflow-y', 'auto', 'important');
                bubbles.style.setProperty('overflow-x', 'hidden', 'important');
                bubbles.style.setProperty('overscroll-behavior', 'contain', 'important');
            }
        } catch(e) {}
    }

  patch();
    lockLayout();
    new MutationObserver(function(){ patch(); lockLayout(); }).observe(document.body || document.documentElement, {childList:true, subtree:true});
    setTimeout(lockLayout, 300);
    setTimeout(lockLayout, 1000);
})();
</script>
"""


with gr.Blocks(
    theme=gr.themes.Soft(
        primary_hue="blue",
        neutral_hue="slate",
        font=[gr.themes.GoogleFont("Inter"), "ui-sans-serif", "system-ui", "sans-serif"],
    ),
    css=CHAT_CSS,
    head=HEAD_HTML,
    title=f"{PROJECT_NAME} Assistant",
    fill_height=True,
) as demo:
    gr.ChatInterface(
        respond,
        type="messages",
        chatbot=gr.Chatbot(
            type="messages",
            show_label=False,
            container=False,
            height="100%",
            scale=1,
            render_markdown=True,
            sanitize_html=False,
        ),
        fill_height=True,
        examples=[
            "What is the Al-Haq Initiative?",
            "How can I support the founder's work?",
        ],
    )


if __name__ == "__main__":
    demo.launch(share=False, server_name="0.0.0.0", server_port=7860)
