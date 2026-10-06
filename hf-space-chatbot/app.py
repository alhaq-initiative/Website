import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None

try:
    from huggingface_hub import InferenceClient
except ImportError:
    InferenceClient = None

app = FastAPI(title="Al-Haq Multi-Site Assistant")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://alhaq.uk", "https://www.alhaq.uk",
        "https://alhaq-initiative.org", "https://www.alhaq-initiative.org",
        "https://amnishield.com", "https://www.amnishield.com",
        "https://habibmukhlis.github.io",
        "https://app.amnishield.com", "http://localhost:3000",
        "http://localhost:8080", "http://127.0.0.1:5500",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

ALLOWED_HOSTS = {
    "alhaq.uk", "www.alhaq.uk", "alhaq-initiative.org",
    "www.alhaq-initiative.org", "amnishield.com", "www.amnishield.com",
    "habibmukhlis.github.io",
}
LIVE_SITE_URLS = tuple(
    value.strip() for value in os.getenv(
        "LIVE_SITE_URLS",
        "https://alhaq-initiative.org/,https://alhaq.uk/,https://amnishield.com/,https://habibmukhlis.github.io/",
    ).split(",") if value.strip()
)
LIVE_REFRESH_SECONDS = int(os.getenv("LIVE_REFRESH_SECONDS", "300"))
LIVE_CACHE = {}
INDEX_PATH = Path(__file__).parent / "site_index.json"
try:
    SITE_INDEX = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
except (OSError, json.JSONDecodeError):
    SITE_INDEX = {"chunks": []}

GEMINI_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_CLIENT = genai.Client(api_key=GEMINI_KEY) if genai and GEMINI_KEY else None
HF_TOKEN = os.getenv("HF_TOKEN", "").strip()
HF_MODEL = os.getenv("HF_MODEL", "Qwen/Qwen2.5-7B-Instruct")
HF_PROVIDER = os.getenv("HF_PROVIDER", "featherless-ai")
HF_CLIENT = (
    InferenceClient(provider=HF_PROVIDER, token=HF_TOKEN)
    if InferenceClient and HF_TOKEN
    else None
)
HF_LAST_ERROR = None


class PageContext(BaseModel):
    domain: str = Field(default="", max_length=255)
    path: str = Field(default="/", max_length=255)
    pageTitle: str = Field(default="", max_length=500)
    pageContent: str = Field(default="", max_length=8000)


class ChatPayload(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    context: PageContext = Field(default_factory=PageContext)


# ==============================================================================
# Strict Content Moderation & Scope Guardrails
# ==============================================================================
PROFANITY_PATTERN = re.compile(
    r"\b(fuck\w*|shit\w*|bitch\w*|bastard\w*|cunt\w*|motherfuck\w*|whore\w*|slut\w*|asshole\w*|"
    r"dick\w*|cock\w*|pussy\w*|vagina\w*|vulva\w*|clitoris\w*|penis\w*|boobs\w*|tits\w*|"
    r"orgasm\w*|masturbat\w*|intercourse\w*|dildo\w*|blowjob\w*|hentai\w*|porn\w*|erotic\w*|"
    r"nsfw\w*|nude\w*|naked\w*|underage\w*|incest\w*|fetish\w*)\b",
    re.IGNORECASE,
)

OFF_TOPIC_EXPLICIT_PATTERN = re.compile(
    r"\b(sex\b|sexy\w*|sexual\w*|dating\b|hookup\w*|age\s+of\s+consent|pornography\b|anatomy\b|genital\w*|onlyfans\b|stripper\w*|xxx\b)",
    re.IGNORECASE,
)

GUARDRAIL_REFUSAL = (
    "I am the Al-Haq Assistant, dedicated exclusively to assisting with Habib Mukhlis's "
    "software portfolio, Al-Haq Studio, the Al-Haq Initiative, and AmniShield products. "
    "I cannot assist with explicit, sensitive, inappropriate, or off-topic requests. "
    "Please feel free to ask about our digital privacy tools, software architecture, "
    "or community platforms."
)

def check_guardrails(message: str) -> str | None:
    text = message.strip().lower()
    if PROFANITY_PATTERN.search(text):
        return GUARDRAIL_REFUSAL

    if OFF_TOPIC_EXPLICIT_PATTERN.search(text):
        # Only allow security inquiries specifically about blocker/firewall features
        is_security_query = any(k in text for k in ("amnishield", "amniguard", "block", "filter", "shield", "sinkhole", "firewall", "protect"))
        if not is_security_query:
            return GUARDRAIL_REFUSAL
        # If query asks to generate explicit content or discusses anatomy/laws, refuse
        if any(term in text for term in ("sexy page", "sexy girl", "what is porn", "pussy pink", "underage sex", "vulva")):
            return GUARDRAIL_REFUSAL

    return None


def clean_text(value: str, limit: int = 6000) -> str:
    if BeautifulSoup:
        value = BeautifulSoup(value, "html.parser").get_text(" ", strip=True)
    else:
        value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", value).strip()[:limit]


def safe_url(value: str):
    parsed = urllib.parse.urlparse(value)
    if parsed.scheme not in {"http", "https"} or parsed.hostname not in ALLOWED_HOSTS:
        return None
    return value


def fetch_live(url: str) -> str:
    url = safe_url(url)
    if not url:
        return ""
    now = time.monotonic()
    cached = LIVE_CACHE.get(url)
    if cached and now - cached[0] < LIVE_REFRESH_SECONDS:
        return cached[1]
    request = urllib.request.Request(
        url, headers={"User-Agent": "Al-Haq-Assistant/1.0 (+https://alhaq.uk/)"}
    )
    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            if "text/html" not in response.headers.get("content-type", ""):
                return ""
            text = clean_text(response.read(500_000).decode("utf-8", "ignore"))
    except (urllib.error.URLError, TimeoutError, UnicodeError):
        return ""
    LIVE_CACHE[url] = (now, text)
    return text


def live_context(context: PageContext) -> str:
    sections = []
    current_url = safe_url(
        f"https://{context.domain}{context.path}" if context.domain else ""
    )
    if current_url:
        sections.append(f"CURRENT LIVE PAGE ({current_url}):\n{fetch_live(current_url)}")
    if context.pageContent:
        sections.append(
            f"BROWSER CONTENT VISIBLE TO VISITOR ({context.pageTitle}):\n{context.pageContent}"
        )
    for url in LIVE_SITE_URLS:
        if url != current_url:
            text = fetch_live(url)
            if text:
                sections.append(f"LIVE SITE ({url}):\n{text}")
    return "\n\n".join(sections)[:18000]


def indexed_context(query: str) -> str:
    words = {word.lower() for word in re.findall(r"[^\W_]+", query) if len(word) > 2}
    scored = []
    for chunk in SITE_INDEX.get("chunks", []):
        text = chunk.get("text", "")
        score = sum(text.lower().count(word) for word in words)
        if score:
            scored.append((score, chunk))
    scored.sort(key=lambda item: item[0], reverse=True)
    return "\n\n".join(
        f"{chunk.get('page', 'Page')} ({chunk.get('url', '')}): {chunk.get('text', '')}"
        for _, chunk in scored[:4]
    )


LINKS = """WORKING ABSOLUTE LINKS:
- Al-Haq Initiative: https://alhaq-initiative.org/
- Initiative Projects: https://alhaq-initiative.org/services.html
- Initiative Products: https://alhaq-initiative.org/products.html
- Initiative Library: https://alhaq-initiative.org/library.html
- Quran reader: https://alhaq-initiative.org/quran.html
- Al-Haq Hub: https://alhaq-initiative.org/alhaq-hub.html
- Al-Haq Hub beta: https://alhaq-initiative.org/alhaq-hub-join-beta.html
- Initiative Contact: https://alhaq-initiative.org/contact.html
- Initiative Support: https://alhaq-initiative.org/donate.html
- Al-Haq Studio: https://alhaq.uk/
- Studio Products: https://alhaq.uk/products.html
- Platen: https://alhaq.uk/platen.html
- AmniBlur: https://alhaq.uk/amniblur.html
- AmniSpace: https://alhaq.uk/AmniSpace.html
- AmniGuard: https://alhaq.uk/amniguard.html
- AmniShield: https://amnishield.com/
- Personal portfolio: https://habibmukhlis.github.io/
- Portfolio projects: https://habibmukhlis.github.io/#projects
- Portfolio contact: https://habibmukhlis.github.io/#contact"""


def system_prompt(payload: ChatPayload, live: str, indexed: str) -> str:
    timestamp = datetime.now(timezone.utc).strftime("%d %B %Y %H:%M UTC")
    return f"""You are the official Al-Haq Assistant, representing Habib Mukhlis (Habibur Rahman), Al-Haq Studio, Al-Haq Initiative, and AmniShield.
The founder and sole trader is Habibur Rahman Mukhlis. Al-Haq Studio delivers software and digital tools; the Al-Haq Initiative is the community digital welfare mission. Do not describe it as a registered charity, NGO, or corporate trust.

Current time: {timestamp}
Visitor page: {payload.context.domain}{payload.context.path} ({payload.context.pageTitle})

{LINKS}

LIVE MULTI-SITE CONTEXT:
{live}

INDEXED CONTEXT:
{indexed}

CRITICAL RULES & STRICT GUARDRAILS (MANDATORY):
1. STRICT TOPIC LIMITATION: You are strictly and exclusively an assistant for the portfolio, products, research, and documentation of Habib Mukhlis, Al-Haq Studio, Al-Haq Initiative, and AmniShield. You must ONLY answer questions directly related to these websites, apps, and documented tools.
2. REFUSAL OF OFF-TOPIC QUERIES: If the visitor asks about topics unrelated to these sites (such as general knowledge, laws of foreign countries, general programming tasks, creative writing, health, dating, world trivia, or philosophical debates), you MUST POLITELY REFUSE:
   "I am the Al-Haq Assistant, dedicated exclusively to assisting with Habib Mukhlis's software, Al-Haq Studio, the Al-Haq Initiative, and AmniShield products. I cannot assist with topics outside of these sites and tools. Please ask about our products, research, or apps."
3. ZERO TOLERANCE FOR ADULT, SEXUAL, OR EXPLICIT CONTENT: You must NEVER define, explain, discuss, or generate adult content, pornography, sexual anatomy, age of consent, sexual acts, or vulgarity under any circumstances. If prompted, refuse immediately with the standard refusal.
4. NO UNRELATED CODE GENERATION: Never write HTML, JavaScript, Python, or CSS for unrelated third-party websites or concepts (such as "sexy pages", dating sites, games, or general web apps). You may only explain code concepts specifically relevant to our documented open-source projects (PohLang, Platen, AmniGuard, Quran Reels).
5. TONE AND ETHICS: Maintain a humble, professional, modest, and helpful demeanor. Never invent features, pricing, or legal statuses. Use clickable Markdown links with the working absolute URLs above.
6. PRIVACY: Never ask users to provide passwords, API keys, payment details, identity documents, precise location, or sensitive personal data."""


def fallback(payload: ChatPayload) -> str:
    query = payload.message.lower()
    if "amnshield" in query or "protection" in query:
        return "AmniShield is the independent digital protection app delivered by Al-Haq Studio. Visit [AmniShield](https://amnishield.com/) for current product information."
    if any(term in query for term in ("studio", "platen", "amniblur", "amniguard")):
        return "Al-Haq Studio is the software studio behind these digital products and services. Explore [Al-Haq Studio](https://alhaq.uk/)."
    if any(term in query for term in ("quran", "library", "initiative")):
        return "The Al-Haq Initiative site contains the research, library, Quran reader, and community projects. Start at [Al-Haq Initiative](https://alhaq-initiative.org/)."
    return "I can help with Habib's portfolio, the Al-Haq Initiative, Al-Haq Studio, and AmniShield. Start at [Habib's Portfolio](https://habibmukhlis.github.io/) or [Al-Haq Initiative](https://alhaq-initiative.org/)."


@app.post("/api/chat")
async def chat(payload: ChatPayload):
    global HF_LAST_ERROR

    # 1. Pre-flight Guardrail Check
    refusal = check_guardrails(payload.message)
    if refusal:
        return {"reply": refusal, "engine": "guardrail-enforced", "status": "refused"}

    live = live_context(payload.context)
    indexed = indexed_context(payload.message)
    prompt = system_prompt(payload, live, indexed)

    if GEMINI_CLIENT and types:
        try:
            response = GEMINI_CLIENT.models.generate_content(
                model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
                contents=payload.message,
                config=types.GenerateContentConfig(
                    system_instruction=prompt,
                    max_output_tokens=500,
                    temperature=0.3,
                ),
            )
            if response and response.text:
                return {"reply": response.text.strip(), "engine": "gemini", "status": "success"}
        except Exception as error:
            print(f"[assistant] model fallback: {type(error).__name__}: {error}")

    if HF_CLIENT:
        try:
            response = HF_CLIENT.chat.completions.create(
                model=HF_MODEL,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": payload.message},
                ],
                max_tokens=500,
                temperature=0.3,
            )
            text = response.choices[0].message.content.strip()
            if text:
                return {"reply": text, "engine": "huggingface-inference", "status": "success"}
        except Exception as error:
            HF_LAST_ERROR = type(error).__name__
            print(f"[assistant] HF model fallback: {type(error).__name__}: {error}")

    return {"reply": fallback(payload), "engine": "verified-fallback", "status": "fallback"}


@app.get("/health")
async def health():
    return {
        "status": "online",
        "model_configured": bool(GEMINI_CLIENT),
        "hf_model_configured": bool(HF_CLIENT),
        "hf_provider": HF_PROVIDER,
        "hf_last_error": HF_LAST_ERROR,
        "indexed_chunks": len(SITE_INDEX.get("chunks", [])),
        "live_sites": list(LIVE_SITE_URLS),
    }


@app.get("/", response_class=HTMLResponse)
async def chat_page():
    return r"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Al-Haq Assistant</title>
<style>
body{margin:0;background:#f8fafc;color:#0f172a;font:15px/1.5 system-ui,sans-serif;height:100vh;display:flex;flex-direction:column}
main{flex:1;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:10px}.msg{max-width:88%;padding:10px 13px;border-radius:14px;white-space:pre-wrap}.bot{background:#fff;border:1px solid #e2e8f0;align-self:flex-start}.user{background:#1d4ed8;color:#fff;align-self:flex-end}
form{display:flex;gap:8px;padding:10px;border-top:1px solid #e2e8f0;background:#fff}textarea{flex:1;resize:none;border:1px solid #cbd5e1;border-radius:10px;padding:10px;font:inherit}button{border:0;border-radius:10px;padding:0 16px;background:#1d4ed8;color:#fff;font-weight:700}
a{color:#1d4ed8;font-weight:700}
</style></head><body><main id="messages"><div class="msg bot"><strong>Privacy notice:</strong> Please do not share personal or sensitive information, passwords, API keys, payment details, identity documents, or precise location in this chat.<br><br>I am the Al-Haq Assistant. Ask about Habib's portfolio, the Initiative, Al-Haq Studio, or AmniShield.</div></main>
<form id="form"><textarea id="input" rows="2" placeholder="Ask a question..."></textarea><button>Send</button></form>
<script>
const box=document.getElementById('messages'),input=document.getElementById('input');
function add(text,kind){const el=document.createElement('div');el.className='msg '+kind;el.innerHTML=text.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,'<a href="$2" target="_top" rel="noopener">$1</a>');box.appendChild(el);box.scrollTop=box.scrollHeight;}
document.getElementById('form').addEventListener('submit',async e=>{e.preventDefault();const message=input.value.trim();if(!message)return;input.value='';add(message,'user');add('Thinking...','bot');const pending=box.lastElementChild;try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,context:{domain:'habibmukhlis.github.io',path:'/',pageTitle:'Habib Mukhlis Portfolio',pageContent:''}})});const data=await r.json();pending.remove();add(data.reply||'Please try again.','bot')}catch(err){pending.textContent='The assistant is temporarily unavailable. Please try again.'}});
</script></body></html>"""
