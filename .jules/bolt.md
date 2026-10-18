## 2025-05-18 - Animated React Component Memoization
**Learning:** Animated components using Framer Motion (`motion.div`) in parent dashboards with frequent text input state updates re-render on every keystroke if not memoized, causing unnecessary React reconciliation overhead.
**Action:** Always wrap static/prop-stable animated components with `React.memo` when located in parent layouts with high-frequency state updates.
