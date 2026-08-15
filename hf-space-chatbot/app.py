import os
import json
from datetime import datetime, timezone
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Google GenAI SDK
try:
    from google import genai
    from google.genai import types
    GENAI_SDK_AVAILABLE = True
except ImportError:
    genai = None
    types = None
    GENAI_SDK_AVAILABLE = False

# Optional: Local model imports (Qwen / Transformers fallback)
try:
    from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
    import torch
    LOCAL_MODEL_ID = os.environ.get("LOCAL_MODEL_ID", "Qwen/Qwen2.5-0.5B-Instruct")
    tokenizer = AutoTokenizer.from_pretrained(LOCAL_MODEL_ID)
    model = AutoModelForCausalLM.from_pretrained(
        LOCAL_MODEL_ID,
        torch_dtype="auto",
        device_map="auto" if torch.cuda.is_available() else "cpu"
    )
    local_pipe = pipeline("text-generation", model=model, tokenizer=tokenizer)
    LOCAL_MODEL_AVAILABLE = True
except Exception as e:
    print(f"[Local Model Notice] Running in lightweight fallback mode: {e}")
    local_pipe = None
    LOCAL_MODEL_AVAILABLE = False

app = FastAPI(title="Al-Haq Multi-Tenant Knowledge Assistant")

# CORS Setup
ALLOWED_ORIGINS = [
    "https://alhaq.uk",
    "https://www.alhaq.uk",
    "https://alhaq-initiative.org",
    "https://www.alhaq-initiative.org",
    "https://amnishield.com",
    "https://www.amnishield.com",
    "https://app.amnishield.com",
    "https://habiburrahmanmeranai.github.io",
    "https://afrasyaab-gh.github.io",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:5500",
    "http://127.0.0.1:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type"],
)

# Load compiled workspace knowledge
INDEX_PATH = Path(__file__).parent / "site_index.json"
try:
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        SITE_KNOWLEDGE = json.load(f)
except Exception:
    SITE_KNOWLEDGE = {}

# Initialize Gemini Client
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
gemini_client = genai.Client(api_key=GEMINI_KEY) if (GEMINI_KEY and GENAI_SDK_AVAILABLE) else None

class PageContext(BaseModel):
    domain: str = Field(..., max_length=255)
    path: str = Field(..., max_length=255)
    pageTitle: str = Field(..., max_length=500)
    pageContent: str = Field(..., max_length=8000)

class ChatPayload(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    context: PageContext

def build_system_prompt(ctx: PageContext) -> str:
    now_utc = datetime.now(timezone.utc).strftime("%A, %d %B %Y %H:%M UTC")
    
    # Retrieve indexed workspace content matching current path if available
    indexed_page = SITE_KNOWLEDGE.get(ctx.path, {})
    indexed_content = indexed_page.get("content", "")

    return f"""You are the official digital assistant for the website the user is currently browsing.
Current Timestamp: {now_utc} (United Kingdom jurisdiction).

IDENTITY & GOVERNANCE:
- Founder & Sole Legal Operator: Habibur Rahman Meranai (UK Sole Trader).
- Al-Haq Studio (alhaq.uk): Commercial software studio (AmnShield, AmniHaze, bespoke engineering, zero telemetry).
- Al-Haq Initiative (alhaq-initiative.org): Non-profit digital welfare & research wing (Faith Sellers/بائعو الإيمان, Reference Library, 100% free access).
- Developer Portfolio (habiburrahmanmeranai.github.io): Systems engineering, PohLang compiler, and CLI toolchains.

LIVE CLIENT BROWSER LOCATION:
- Website Domain: {ctx.domain}
- Current Page Path: {ctx.path}
- Current Page Title: {ctx.pageTitle}

LIVE SCRAPED PAGE CONTENT (WHAT THE USER SEES NOW):
\"\"\"
{ctx.pageContent}
\"\"\"

WORKSPACE INDEXED CONTEXT (FILE ARCHIVE):
\"\"\"
{indexed_content[:2000]}
\"\"\"

RESPONSE INSTRUCTIONS:
1. Context Priority: When the user asks about "this page", "what does this do", or terms visible on screen, answer directly from the LIVE SCRAPED PAGE CONTENT.
2. Tone & British English: Professional, concise, candid, and direct. Always use British English (e.g. specialise, prioritise, minimisation, programme, well-being).
3. Zero Contradictions: Never call the Initiative a registered charity or separate corporate company; it is the non-profit welfare wing operated by Habibur Rahman Meranai under Al-Haq Studio.
4. Grounded Facts: Do not hallucinate features. If details are not found in the live text or brand facts, state clearly: "I do not have enough verified data on this."
"""

def execute_local_fallback(prompt: str, system_prompt: str) -> str:
    """Executes local Qwen / Transformers model when Gemini API is unavailable."""
    if LOCAL_MODEL_AVAILABLE and local_pipe:
        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
            outputs = local_pipe(messages, max_new_tokens=250, temperature=0.6, do_sample=True)
            return outputs[0]["generated_text"][-1]["content"].strip()
        except Exception as err:
            print(f"[Local Model Inference Error] {err}")

    return (
        "Operating in lightweight offline mode. Al-Haq Studio and Initiative tools maintain an "
        "offline-first, zero-telemetry architecture. For direct enquiries, please contact contact@alhaq.uk."
    )

@app.post("/api/chat")
async def chat_endpoint(payload: ChatPayload):
    user_prompt = payload.message.strip()
    system_instruction = build_system_prompt(payload.context)

    # 1. Primary Engine: Google Gemini API (Free tier / AI Studio)
    if gemini_client and types:
        try:
            response = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    max_output_tokens=400,
                    temperature=0.6,
                )
            )
            if response and response.text:
                return {
                    "reply": response.text.strip(),
                    "engine": "gemini-cloud",
                    "status": "success"
                }
        except Exception as api_err:
            print(f"[Engine Fallback Triggered] Gemini API error: {api_err}")

    # 2. Fallback Engine: Local Qwen / Model pipeline
    fallback_reply = execute_local_fallback(user_prompt, system_instruction)
    return {
        "reply": fallback_reply,
        "engine": "local-qwen-fallback",
        "status": "fallback"
    }

@app.get("/health")
async def health():
    return {
        "status": "online",
        "gemini_active": bool(gemini_client),
        "local_model_active": LOCAL_MODEL_AVAILABLE,
        "indexed_pages": len(SITE_KNOWLEDGE)
    }
