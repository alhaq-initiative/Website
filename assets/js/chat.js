/**
 * Al-Haq Live Context-Aware Chat Client
 * Sends DOM text and location context to the backend without client-side API keys.
 */

const BACKEND_ENDPOINT = "https://alhaq-hf-alhaq-website-chatbot.hf.space/api/chat";

function getLiveBrowserContext() {
  const contentNode = document.querySelector("main") || document.querySelector("article") || document.body;
  if (!contentNode) {
    return {
      domain: window.location.hostname || "local",
      path: window.location.pathname || "/",
      pageTitle: document.title || "Al-Haq Ecosystem",
      pageContent: ""
    };
  }

  const clone = contentNode.cloneNode(true);

  // Strip layout, scripts, and non-content elements
  const tagsToStrip = ["script", "style", "nav", "noscript", "svg", "iframe", "header", "footer", ".chat-widget", "#alhaq-chatbot-panel", "#alhaq-chatbot-launcher"];
  tagsToStrip.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove());
  });

  let rawText = (clone.innerText || clone.textContent || "")
    .replace(/\s+/g, " ")
    .trim();

  // Clamp extracted text to keep token usage within limits
  if (rawText.length > 6000) {
    rawText = rawText.substring(0, 6000) + "... [truncated]";
  }

  return {
    domain: window.location.hostname || "local",
    path: window.location.pathname || "/",
    pageTitle: document.title || "Al-Haq Ecosystem",
    pageContent: rawText
  };
}

async function sendChatMessage(userMessage) {
  if (!userMessage || !userMessage.trim()) {
    return { error: "Message cannot be empty." };
  }

  const payload = {
    message: userMessage.trim(),
    context: getLiveBrowserContext()
  };

  try {
    const res = await fetch(BACKEND_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      if (res.status === 429) {
        return { reply: "The assistant is experiencing high traffic. Please try again shortly." };
      }
      throw new Error(`HTTP Error ${res.status}`);
    }

    const data = await res.json();
    return { reply: data.reply, engine: data.engine };
  } catch (err) {
    console.error("[Chat Client Error]", err);
    return { reply: "The assistant is currently unreachable. Please verify your connection." };
  }
}

if (typeof window !== "undefined") {
  window.getLiveBrowserContext = getLiveBrowserContext;
  window.sendChatMessage = sendChatMessage;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getLiveBrowserContext, sendChatMessage };
}
