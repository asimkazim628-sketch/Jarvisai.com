## 2025-10-20 - Next.js AI Dashboard Accessibility & Form Interaction
**Learning:** Dense neon/glass dashboard components often miss standard form semantics (`<form>`, `htmlFor`/`id`, `aria-live="polite"`, `focus-visible`), hindering keyboard navigation and screen reader message updates.
**Action:** Always wrap chat input controls in accessible forms, connect `<label>` and `<input>/<textarea>` explicitly, add live regions for streaming/chat logs, and include `focus-visible:ring-2` focus rings.
