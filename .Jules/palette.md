## 2026-10-19 - SSR Hydration and Interactive Accessibility in Dashboard

**Learning:** When adding speech recognition detection or window API checks in Next.js client components, doing so during initial render causes SSR hydration mismatches. Detecting web APIs inside `useEffect` ensures smooth hydration while keeping controls accessible.
**Action:** Use `useEffect` for window/speech recognition capability checks, add `aria-live="polite"` regions for AI response feedback, associate form controls explicitly with `htmlFor`/`id`, and provide `focus-visible:ring-2` focus states.
