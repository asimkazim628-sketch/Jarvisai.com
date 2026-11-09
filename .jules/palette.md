## 2025-05-18 - Accessible Dashboard Form Controls & Async States
**Learning:** In neon/dark glassmorphic interfaces, standard input borders and transparent buttons can easily lack clear focus indicators and disabled affordances, leading to low keyboard contrast and double-submission bugs on network actions.
**Action:** Always ensure `focus-visible:ring-2 focus-visible:ring-cyan-300`, associate label `htmlFor` with element `id` attributes, disable inputs/buttons during async operations (`isSending`), and expose `aria-pressed` on toggle actions like voice command.
