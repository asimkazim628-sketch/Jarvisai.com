## 2025-05-18 - Tesseract WASM Worker Lifecycle Management in Node.js
**Learning:** Reusing a Tesseract worker avoids ~1.5–3s WASM initialization overhead per request, but WASM heap memory accumulates over time and abrupt worker termination under concurrent HTTP traffic breaks active in-flight requests.
**Action:** Wrap worker instances in a container with per-instance `activeJobs` and `jobsProcessed` tracking. Recycle workers after $N$ jobs and defer `worker.terminate()` until `activeJobs <= 0`.
