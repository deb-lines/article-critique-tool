# Article Sherlock

**Before you share it, cite it, or act on it — run it through here first.**

A public web tool for designers and product managers who read seriously and share carefully. Paste any article URL or text and receive a structured critique across five evaluation dimensions in about 15 seconds.

🔍 **Live at [articlesherlock.com](https://articlesherlock.com)**

---

## What it does

Not all articles are worth your trust. Article Sherlock evaluates the quality of argument, evidence, and original thinking in any design or product article — so you know what you are sharing before you share it.

Paste a URL or the full article text. Get back a verdict and reasoning across five dimensions.

---

## The five evaluation dimensions

| Dimension | What it checks |
|---|---|
| **Fabricated Frameworks** | Does the article cite frameworks or methodologies that do not verifiably exist, or that are misattributed? |
| **Misrepresented Citations** | Are studies, statistics, or research cited accurately — or distorted, decontextualised, or unverifiable? |
| **Recycled AI Content** | Does the article repackage widely circulated ideas without original insight, synthesis, or perspective? |
| **Analytical Rigour** | Does the article demonstrate logical consistency, depth of analysis, and intellectual honesty about what it does not know? |
| **Practical Value** | Does the article offer specific, actionable guidance a working designer or PM could apply — or does it only inspire? |

Each dimension returns a one-sentence verdict and two to three sentences of reasoning. The tool flags uncertainty rather than fabricating confident assessments.

---

## How it works

```
Browser → Serverless function (Vercel) → Jina Reader (URL path) → Claude API → Parser → Output
```

1. User pastes a URL or article text and clicks submit
2. The frontend sends the input to a Vercel serverless function
3. If a URL was provided, the function fetches the article via [Jina Reader](https://jina.ai/reader/)
4. The function calls the Claude API with a structured system prompt
5. Claude returns a JSON evaluation across five dimensions
6. The frontend parses and renders five critique cards

The API key never leaves the server. The browser only ever sees the critique.

---

## Tech stack

- **Frontend** — HTML, CSS, vanilla JavaScript
- **Backend** — Vercel serverless function (Node.js)
- **AI** — Anthropic Claude API (`claude-sonnet-4-6`)
- **URL fetching** — Jina Reader (`r.jina.ai`)
- **Hosting** — Vercel
- **Domain** — articlesherlock.com

---

## Running locally

**Prerequisites**
- Node.js v18 or above
- A Vercel account
- An Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

**Setup**

```bash
# Clone the repository
git clone https://github.com/deb-lines/article-critique-tool.git
cd article-critique-tool

# Install dependencies
npm install

# Install Vercel CLI
npm install -g vercel

# Create your environment file
touch .env.local
```

Add your API key to `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Start the local development server**

```bash
vercel dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment variables

| Variable | Description | Where to get it |
|---|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | [console.anthropic.com](https://console.anthropic.com) |

For local development, add the key to `.env.local`. For production, add it in your Vercel project settings under Settings → Environment Variables.

The `.env.local` file is listed in `.gitignore` and will never be pushed to GitHub.

---

## Project structure

```
article-critique-tool/
├── index.html          ← the page the user sees
├── style.css           ← how it looks
├── script.js           ← frontend logic
├── package.json        ← dependencies
├── .env.local          ← your API key (never committed)
├── .gitignore
└── api/
    └── critique.js     ← serverless function that calls Claude
```

---

## Data and privacy

Article Sherlock stores nothing. Every critique is session-only — data clears when the session ends. No article content, no critique output, no usage data is logged or retained.

---

## Limitations

- Paywalled articles cannot be fetched via URL — use the text paste fallback instead
- The evaluation reflects Claude's reasoning, which may have gaps for niche or recent research
- Citations cannot be verified against live databases in v1 — this is planned for v2

---

## Built by

Deblina Pandit — senior UX and product designer, building in public as part of the She Vibes AI learning cohort.

---

## Licence

MIT
