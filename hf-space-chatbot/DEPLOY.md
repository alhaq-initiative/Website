# Al-Haq Initiative Website Chatbot

A free conversational chatbot powered by Mistral 7B for guiding visitors on the Al-Haq Initiative website.

## Quick Deploy to Hugging Face Spaces (2 min)

### Step 1: Create a Hugging Face Account (if needed)
- Go to [huggingface.co](https://huggingface.co)
- Click "Sign Up" → Create account

### Step 2: Create a New Space
1. Click your profile → "Create" → "New Space"
2. **Space name:** `alhaq-chatbot` (or any name you prefer)
3. **License:** OpenRAIL-M (recommended for models)
4. **Space SDK:** Select "Docker"
5. **Visibility:** Public (so it's embeddable on your website)
6. Click "Create Space"

### Step 3: Upload Files
1. Click "Files" → "Add file" → "Upload files"
2. Upload these files from `d:\Projects\alhaq-website\hf-space-chatbot\`:
   - `app.py`
   - `requirements.txt`

### Step 4: Create Dockerfile (Important!)
1. Click "Files" → "Add file" → "Create new file"
2. Name: `Dockerfile`
3. Paste:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY app.py .

CMD ["python", "app.py"]
```

4. Click "Commit new file"

### Step 5: Wait for Build
- The space will auto-build (2-5 min)
- You'll see "Running" status when ready
- Check the "Logs" tab if it takes longer

### Step 6: Get Embed Code
1. Click the three dots (⋯) → "Embed this Space"
2. Copy the iframe code:

```html
<iframe
	src="https://huggingface.co/spaces/YOUR-USERNAME/alhaq-chatbot"
	frameborder="0"
	width="850"
	height="600"
></iframe>
```

---

## Embed on Your Website

### Option A: Simple Embed (Recommended)
Add to any page (e.g., `help.html`, `contact.html`):

```html
<section id="chatbot-section" style="margin: 40px 0; padding: 20px; background: #f5f5f5; border-radius: 8px;">
    <h2>💬 Need Help? Chat with Our Guide</h2>
    <iframe
        src="https://huggingface.co/spaces/YOUR-USERNAME/alhaq-chatbot"
        frameborder="0"
        width="100%"
        height="600"
        style="border: 1px solid #ddd; border-radius: 8px;"
    ></iframe>
</section>
```

### Option B: Floating Chat Bubble (Advanced)
Add to `assets/js/site.js`:

```javascript
// Add floating chat bubble
function initChatbot() {
    const bubble = document.createElement('div');
    bubble.id = 'chat-bubble';
    bubble.innerHTML = `
        <button onclick="toggleChat()" style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #0066cc;
            color: white;
            border: none;
            cursor: pointer;
            font-size: 24px;
            z-index: 999;
        ">💬</button>
        <div id="chat-window" style="
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 400px;
            height: 600px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            display: none;
            z-index: 999;
        ">
            <iframe
                src="https://huggingface.co/spaces/YOUR-USERNAME/alhaq-chatbot"
                style="width: 100%; height: 100%; border: none; border-radius: 8px;"
            ></iframe>
        </div>
    `;
    document.body.appendChild(bubble);
}

function toggleChat() {
    const window = document.getElementById('chat-window');
    window.style.display = window.style.display === 'none' ? 'block' : 'none';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initChatbot);
```

---

## Customize the Chatbot

### Add More Context
Edit `app.py` → `SYSTEM_PROMPT` section:

```python
SYSTEM_PROMPT = """You are a guide for Al-Haq Initiative...
[Add your custom instructions here]"""
```

### Change the Model
Replace `mistralai/Mistral-7B-Instruct-v0.1` with:
- `meta-llama/Llama-2-7b-chat-hf` (Llama 2)
- `NousResearch/Nous-Hermes-2-Mistral-7B-DPO` (Stronger)
- `teknium/OpenHermes-2.5-Mistral-7B` (More creative)

### Change Styling
Edit the Gradio theme:

```python
theme=gr.themes.Soft(
    primary_hue="blue",          # Change color
    secondary_hue="emerald"      # Secondary color
)
```

---

## Features

✅ **100% Free** - Hosted on Hugging Face  
✅ **No API Keys** - Just deploy and embed  
✅ **Conversational** - Maintains chat history  
✅ **Contextual** - Knows about Al-Haq, products, projects  
✅ **Fast** - Mistral 7B is optimized for speed  
✅ **Embeddable** - Works on any website  
✅ **Mobile Friendly** - Responsive design  

---

## Troubleshooting

### "Space is building..." (Stuck for >10 min)
1. Refresh the page
2. Check "Logs" tab for errors
3. Ensure files are properly committed

### "CUDA out of memory" error
- Mistral 7B is being run on free tier
- Wait and refresh (queue system)
- Or switch to smaller model (Phi-2: 2.7GB)

### Chatbot not responding
- Check Hugging Face Space "Logs"
- Verify `app.py` and `requirements.txt` are uploaded
- Dockerfile must be present

### Embed not showing on website
- Use `https://` (not `http://`)
- Check browser console for CORS errors
- Try `allow="*"` attribute on iframe

---

## Next Steps

1. **Deploy now** (5 min)
2. **Test the chatbot** on your device
3. **Embed on your website** (add iframe to pages)
4. **Customize context** (add more Al-Haq details)
5. **Share the link** (huggingface.co/spaces/YOUR-USERNAME/alhaq-chatbot)

---

## Integration Examples

### Add to Help Page
`help.html` → Add chatbot section before footer

### Add to Contact Page
`contact.html` → "Can't find what you need? Chat with our guide"

### Add to Services Page
`services.html` → "Ask about our products and projects"

---

## Support

- **HF Spaces Docs:** https://huggingface.co/docs/hub/spaces-overview
- **Gradio Docs:** https://www.gradio.app/docs/
- **Al-Haq Initiative:** https://alhaq-website.com

---

**Created for Al-Haq Initiative by ADS Solutions**
