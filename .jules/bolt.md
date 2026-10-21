## 2025-05-10 - Memoizing Animation Subtrees in Frequently Re-rendered Views
**Learning:** Animated visual components (e.g. `VoiceOrb` using Framer Motion) positioned inside parent components with frequent state updates (e.g. text input in `Dashboard`) trigger unnecessary virtual DOM diffs and animation recalculations on every keypress if unmemoized.
**Action:** Wrap animated leaf components in `React.memo` when their props depend on state distinct from frequent parent inputs.
