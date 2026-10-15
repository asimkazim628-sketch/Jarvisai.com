## 2025-05-18 - Input Labels and Screen Reader Dynamic Regions in Next.js Monorepo

**Learning:** Forms and inputs missing explicit ARIA labels and `htmlFor` bindings reduce screen reader navigation context, and dynamic AI response chat containers require `aria-live="polite"` so newly appended stream/response messages are automatically announced.
**Action:** Always verify form inputs have linked labels via `htmlFor`/`id` or `aria-label`, visible focus indicators (`focus-visible:ring-2`), and `aria-live="polite"` on real-time response feeds.
