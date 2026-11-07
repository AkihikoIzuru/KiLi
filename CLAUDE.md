# Claude Code Project Rules

Read `README.md` fully before modifying this project.

- Preserve the existing AKII AI visual design. Do not redesign or replace it with a generic template.
- This repository is a frontend-first prototype. Many controls are intentionally preview placeholders.
- Do not claim mock data is connected to a real model.
- Keep all 9Router requests and API keys server-side. Never expose secrets through `NEXT_PUBLIC_` variables.
- The user's router is an OpenAI-compatible 9Router gateway behind Cloudflare Tunnel. It is a model router, not an agent runtime.
- Follow the implementation phases in README.md in order: basic chat, persistence, attachments/rich content, agent runtime, production hardening.
- Do not implement agent tool execution in client-side code.
- Make small changes, preserve responsive behavior, and run `npm run lint` and `npm run build` after significant work.
- Explain before making architectural changes that are not specified in README.md.
