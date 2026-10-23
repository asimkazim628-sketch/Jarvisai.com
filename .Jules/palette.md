# Palette's Journal - Critical UX & Accessibility Learnings

## 2026-10-23 - Interactive Input & Accessible Live Feedback in Chat / Voice Interface
**Learning:** In AI assistant dashboards with voice and chat inputs, icon/action controls and message containers often lack screen reader live regions (`role="log"`, `aria-live="polite"`) and explicit label associations (`htmlFor`/`id`), isolating users who rely on assistive technologies or keyboard navigation.
**Action:** Always associate forms/labels explicitly, provide visual/aria feedback during pending async operations (`isSending`), and ensure focus ring visibility (`focus-visible:ring-2`) across all interactive cards and controls.
