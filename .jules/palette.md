## 2026-10-26 - SSR Hydration and Interactive Feedback in Next.js Dashboard
**Learning:** Browser feature detection like `speechRecognition` in Next.js client components can cause SSR hydration mismatch if evaluated synchronously via `useMemo` or state initialization. Using `useEffect` ensures consistent SSR markup while enabling browser-specific features after hydration.
**Action:** Always wrap `window` / browser API detection in `useEffect` when setting initial component state or interactive attributes.
