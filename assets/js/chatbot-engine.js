/**
 * Al-Haq Native In-Browser RAG Engine
 * (c) 2026 Al-Haq Studio — Developed by Al-Haq Studio.
 *
 * Runs lightweight TF-IDF RAG retrieval directly in the client's browser using
 * the live site_index.json payload. Zero Docker, zero Hugging Face Space needed.
 */
(function (global) {
  'use strict';

  const SITE_BASE = 'https://alhaq-initiative.org';
  const INDEX_URL = '/hf-space-chatbot/site_index.json';

  const CANONICAL_ROUTES = {
    '/': `${SITE_BASE}/`,
    '/index.html': `${SITE_BASE}/index.html`,
    '/about': `${SITE_BASE}/about.html`,
    '/about.html': `${SITE_BASE}/about.html`,
    '/services': `${SITE_BASE}/services.html`,
    '/services.html': `${SITE_BASE}/services.html`,
    '/projects': `${SITE_BASE}/services.html`,
    '/projects.html': `${SITE_BASE}/services.html`,
    '/products': `${SITE_BASE}/products.html`,
    '/products.html': `${SITE_BASE}/products.html`,
    '/library': `${SITE_BASE}/library.html`,
    '/library.html': `${SITE_BASE}/library.html`,
    '/books': `${SITE_BASE}/library.html`,
    '/all-infographics': `${SITE_BASE}/all-infographics.html`,
    '/all-infographics.html': `${SITE_BASE}/all-infographics.html`,
    '/infographics': `${SITE_BASE}/all-infographics.html`,
    '/media': `${SITE_BASE}/media.html`,
    '/media.html': `${SITE_BASE}/media.html`,
    '/quran': `${SITE_BASE}/quran.html`,
    '/quran.html': `${SITE_BASE}/quran.html`,
    '/quranhub': `${SITE_BASE}/quranhub.html`,
    '/quranhub.html': `${SITE_BASE}/quranhub.html`,
    '/alhaq-hub': `${SITE_BASE}/alhaq-hub.html`,
    '/alhaq-hub.html': `${SITE_BASE}/alhaq-hub.html`,
    '/alhaq-hub-join-beta': `${SITE_BASE}/alhaq-hub-join-beta.html`,
    '/alhaq-hub-join-beta.html': `${SITE_BASE}/alhaq-hub-join-beta.html`,
    '/help': `${SITE_BASE}/help.html`,
    '/help.html': `${SITE_BASE}/help.html`,
    '/faq': `${SITE_BASE}/help.html`,
    '/contact': `${SITE_BASE}/contact.html`,
    '/contact.html': `${SITE_BASE}/contact.html`,
    '/donate': `${SITE_BASE}/donate.html`,
    '/donate.html': `${SITE_BASE}/donate.html`,
    '/support': `${SITE_BASE}/help.html`,
    '/support_hub': `${SITE_BASE}/help.html`,
    '/support_hub.html': `${SITE_BASE}/help.html`,
    '/docs': `${SITE_BASE}/legal/docs.html`,
    '/docs.html': `${SITE_BASE}/docs.html`,
    '/golden-speech': `${SITE_BASE}/golden-speech.html`,
    '/golden-speech.html': `${SITE_BASE}/golden-speech.html`,
    '/amnshield_join_beta': `${SITE_BASE}/amnshield_join_beta.html`,
    '/amnshield_join_beta.html': `${SITE_BASE}/amnshield_join_beta.html`,
    '/publications': `${SITE_BASE}/publications.html`,
    '/publications.html': `${SITE_BASE}/publications.html`,
    '/legal/docs': `${SITE_BASE}/legal/docs.html`,
    '/legal/docs.html': `${SITE_BASE}/legal/docs.html`,
    '/legal/privacy': `${SITE_BASE}/legal/privacy_hub.html`,
    '/legal/privacy_hub': `${SITE_BASE}/legal/privacy_hub.html`,
    '/legal/privacy_hub.html': `${SITE_BASE}/legal/privacy_hub.html`,
    '/legal/terms': `${SITE_BASE}/legal/terms_hub.html`,
    '/legal/terms_hub': `${SITE_BASE}/legal/terms_hub.html`,
    '/legal/terms_hub.html': `${SITE_BASE}/legal/terms_hub.html`,
  };

  const STOPWORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has',
    'have', 'how', 'i', 'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that',
    'the', 'this', 'to', 'was', 'what', 'when', 'where', 'who', 'why',
    'will', 'with', 'you', 'your', 'about', 'can', 'do', 'does', 'me',
    'my', 'we', 'our', 'us', 'so', 'if', 'any', 'there', 'their', 'them',
  ]);

  let _indexData = null;
  let _indexPromise = null;

  async function getIndex() {
    if (_indexData) return _indexData;
    if (_indexPromise) return _indexPromise;
    _indexPromise = (async () => {
      try {
        const res = await fetch(INDEX_URL);
        if (res.ok) {
          _indexData = await res.json();
          return _indexData;
        }
      } catch (err) {
        console.debug('[rag] Index fetch error:', err);
      }
      return null;
    })();
    return _indexPromise;
  }

  function tokenize(text) {
    if (!text) return [];
    const raw = text.match(/[^\s.,!?;:()"'\-\[\]{}]+/g) || [];
    const tokens = [];
    for (const r of raw) {
      const tok = r.toLowerCase();
      if (tok.length >= 2 && !STOPWORDS.has(tok)) {
        tokens.push(tok);
      }
    }
    return tokens;
  }

  function search(indexData, query, topK = 3) {
    if (!indexData || !indexData.chunks) return [];
    const qTokens = tokenize(query);
    if (!qTokens.length) return [];

    const qCounts = {};
    for (const t of qTokens) qCounts[t] = (qCounts[t] || 0) + 1;

    const scored = [];
    for (const ch of indexData.chunks) {
      const cTokens = tokenize(ch.text);
      if (!cTokens.length) continue;
      let score = 0;
      const cCounts = {};
      for (const t of cTokens) cCounts[t] = (cCounts[t] || 0) + 1;

      for (const [t, count] of Object.entries(qCounts)) {
        if (cCounts[t]) {
          score += count * cCounts[t];
        }
      }
      if (score > 0) {
        scored.push({ score: score / Math.sqrt(cTokens.length), chunk: ch });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map((s) => s.chunk);
  }

  function formatLinks(text) {
    if (!text) return '';
    let html = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
      let cleanUrl = url.trim().replace(/^['"]|['"]$/g, '');
      if (cleanUrl.startsWith('/')) {
        const cleanPath = cleanUrl.split('?')[0].split('#')[0];
        cleanUrl = CANONICAL_ROUTES[cleanPath] || (SITE_BASE + cleanPath);
      } else if (cleanUrl.includes('alhaq-initiative.org')) {
        try {
          const u = new URL(cleanUrl);
          cleanUrl = CANONICAL_ROUTES[u.pathname] || cleanUrl;
        } catch (_) {}
      } else if (cleanUrl.includes('amnishield.com')) {
        if (cleanUrl.includes('/download')) cleanUrl = 'https://amnishield.com/download/';
        else if (cleanUrl.includes('/faq')) cleanUrl = 'https://amnishield.com/faq/';
        else if (cleanUrl.includes('/support')) cleanUrl = 'https://amnishield.com/support/';
        else if (cleanUrl.includes('/docs')) cleanUrl = 'https://amnishield.com/docs/';
        else cleanUrl = 'https://amnishield.com';
      }
      return `<a href="${cleanUrl}" target="_top" rel="noopener" class="alhaq-chat-link">${label}</a>`;
    });
    return html.split(/\n\n+/).map(p => `<p style="margin:6px 0;line-height:1.6;">${p.replace(/\n/g, '<br>')}</p>`).join('');
  }

  // Smart fallback responder when API token is unavailable
  function generateFallbackAnswer(query, retrievedChunks) {
    const qLower = query.toLowerCase();
    let text = '';
    let targetLink = `${SITE_BASE}/about.html`;
    let targetLabel = 'About Al-Haq Initiative';

    if (qLower.includes('amnshield') || qLower.includes('shield') || qLower.includes('habit') || qLower.includes('protection')) {
      text = 'AmniShield is an independent digital protection app for habit management and spiritual wellbeing delivered by Al-Haq Studio. It has its own dedicated website at amnishield.com.';
      targetLink = 'https://amnishield.com';
      targetLabel = 'AmniShield Website';
    } else if (qLower.includes('alhaq hub') || qLower.includes('hub') || qLower.includes('app') || qLower.includes('prayer') || qLower.includes('beta')) {
      text = 'Al-Haq Hub is an all-in-one Islamic productivity app (prayer times, Qibla, adhkaar, and TaleemAI Quran feedback). Join the beta to test early Android releases.';
      targetLink = `${SITE_BASE}/alhaq-hub-join-beta.html`;
      targetLabel = 'Join Al-Haq Hub Beta';
    } else if (qLower.includes('quran') || qLower.includes('reader')) {
      text = 'Quran Hub is our standalone Quran reader web app with clean typography and recitation features.';
      targetLink = `${SITE_BASE}/quran.html`;
      targetLabel = 'Open Quran Hub';
    } else if (qLower.includes('library') || qLower.includes('book') || qLower.includes('faith sellers') || qLower.includes('nawadir')) {
      text = 'The Library & Media Hub contains our original authored books, translations against primary Arabic sources, booklets, and documentary snippets.';
      targetLink = `${SITE_BASE}/library.html`;
      targetLabel = 'Explore the Library';
    } else if (qLower.includes('donate') || qLower.includes('support') || qLower.includes('sponsor') || qLower.includes('help')) {
      text = 'You can support our work through direct sponsorship or GitHub Sponsors. All software is developed by Al-Haq Studio and offered to the public through the Al-Haq Initiative.';
      targetLink = `${SITE_BASE}/donate.html`;
      targetLabel = 'Support & Donate';
    } else if (retrievedChunks && retrievedChunks.length > 0) {
      text = retrievedChunks[0].text;
      targetLink = retrievedChunks[0].url || `${SITE_BASE}/services.html`;
      targetLabel = retrievedChunks[0].page || 'Learn More';
    } else {
      text = 'The Al-Haq Initiative is a personal digital and literary movement led by Habibur Rahman Mukhlis focused on truth in history and digital wellbeing.';
      targetLink = `${SITE_BASE}/services.html`;
      targetLabel = 'Explore Our Projects';
    }

    return `${text}\n\n[${targetLabel}](${targetLink})`;
  }

  function getLiveBrowserContext() {
    if (typeof document === 'undefined') {
      return {
        domain: 'alhaq-initiative.org',
        path: '/',
        pageTitle: 'Al-Haq Initiative',
        pageContent: ''
      };
    }
    const contentNode = document.querySelector('main') || document.querySelector('article') || document.body;
    if (!contentNode) {
      return {
        domain: window.location.hostname || 'alhaq-initiative.org',
        path: window.location.pathname || '/',
        pageTitle: document.title || 'Al-Haq Initiative',
        pageContent: ''
      };
    }
    const clone = contentNode.cloneNode(true);
    const tagsToStrip = ['script', 'style', 'nav', 'noscript', 'svg', 'iframe', 'header', 'footer', '.chat-widget', '#alhaq-chatbot-panel', '#alhaq-chatbot-launcher'];
    tagsToStrip.forEach(selector => {
      clone.querySelectorAll(selector).forEach(el => el.remove());
    });
    let rawText = (clone.innerText || clone.textContent || '').replace(/\s+/g, ' ').trim();
    if (rawText.length > 6000) {
      rawText = rawText.substring(0, 6000) + '... [truncated]';
    }
    return {
      domain: window.location.hostname || 'alhaq-initiative.org',
      path: window.location.pathname || '/',
      pageTitle: document.title || 'Al-Haq Initiative',
      pageContent: rawText
    };
  }

  async function query(userMessage) {
    const liveContext = getLiveBrowserContext();

    // 1. Try Backend Dual-Engine Space endpoint
    try {
      const backendRes = await fetch('https://alhaq-hf-alhaq-website-chatbot.hf.space/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: liveContext
        })
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        if (data && data.reply) {
          return formatLinks(data.reply);
        }
      }
    } catch (_) {}

    // 2. Client-side local RAG fallback
    const index = await getIndex();
    const retrieved = search(index, userMessage, 3);
    const fallbackText = generateFallbackAnswer(userMessage, retrieved);
    return formatLinks(fallbackText);
  }

  global.AlHaqChatbotEngine = {
    getIndex,
    search,
    formatLinks,
    query
  };
})(typeof window !== 'undefined' ? window : this);
