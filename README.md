# PromptPack

Token-aware prompt compressor — paste a verbose prompt, pick JSON / Markdown / YAML / minified output, and get measured token savings with a decoder legend.

## Stack

- **Frontend:** Vite + React 19 + TypeScript
- **API:** Vercel serverless (`/api/compress`, `/api/health`)
- **LLM:** OpenAI `gpt-4o-mini`
- **Tokens:** `js-tiktoken` (cl100k_base)
- **Rate limit:** Upstash Redis (10 req/hour/IP) or in-memory fallback

## Local development

```bash
npm install
cp .env.example .env.local   # add OPENAI_API_KEY
npm run dev:full             # Vite + API (vercel dev)
```

Frontend-only (no API):

```bash
npm run dev
```

## Deploy (Vercel)

1. Push to GitHub and import the repo in [Vercel](https://vercel.com).
2. Set environment variables:
   - `OPENAI_API_KEY` (required)
   - `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (recommended for production rate limits)
3. Add domain: `promptpack.yasirali.io` → Vercel project.
4. Deploy; verify `GET /api/health`.

## API

**POST `/api/compress`**

```json
{
  "text": "your prompt…",
  "format": "markdown",
  "mode": "lossless",
  "includeLegendInCount": true
}
```

**GET `/api/health`** — service status

## License

MIT
