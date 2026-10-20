## 2026-10-20 - Prevent unnecessary animation component re-renders with React.memo
**Learning:** Heavy animated components like `VoiceOrb` using Framer Motion inside top-level dashboards with high-frequency state updates (e.g. typing in text inputs) re-render needlessly unless memoized.
**Action:** Always wrap leaf display/animation components in `React.memo` when rendered inside interactive dashboards.
