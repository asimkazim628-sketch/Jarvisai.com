## 2025-05-20 - MongoDB Slice Projection and Atomic Push in Express AI Controller
**Learning:** Hydrating full Mongoose conversation documents and re-saving full array fields during chat turns introduces O(N) network payload overhead and hydration latency as chat history grows. Using `.lean()`, MongoDB projection `{ messages: { $slice: -12 } }`, and atomic `$push` updates reduces database network payload to O(1).
**Action:** For chat session controllers in Mongoose/Express, project only the required recent message window using `$slice` with `.lean()` and perform atomic `$push` updates.
