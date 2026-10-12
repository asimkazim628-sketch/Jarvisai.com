## 2025-05-18 - Interactive Chat Form Focus & Loading Feedback
**Learning:** In dark/neon glassmorphism UIs, default focus rings are often stripped or invisible, and missing pending states on asynchronous send actions leave users uncertain if their message was submitted.
**Action:** Always provide explicit `focus-visible:ring-2 focus-visible:ring-cyan-300` styling, `aria-label` attributes on prompt inputs, and manage `isSending` disabled/loading UI feedback on chat send controls.
