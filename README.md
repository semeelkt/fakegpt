# FakeGPT — Chat interface

Simple ChatGPT-like frontend + backend proxy that uses the OpenAI Chat Completions API.

Quick start

1. Set your OpenAI API key in the environment:

```bash
export OPENAI_API_KEY="sk-..."
```

2. Install deps and run:

```bash
npm install
npm start
```

3. Open http://localhost:3000

Notes
- The server proxies requests to the OpenAI API at `POST /api/chat` and expects a JSON body: `{ model, temperature, messages }`.
- Keep your API key secret. This is a minimal example for local development.
# fakegpt