## 2026-10-16 - MongoDB Conversation Array Optimization

**Learning:** Chat history arrays stored within Mongoose documents grow unbounded over time. Retrieving the entire document without projection transfers unnecessary data over the wire and incurs document hydration cost. Saving via `.save()` sends the entire array back over the network.
**Action:** Use `$slice` projection (e.g. `{ messages: { $slice: -12 } }`) with `.lean()` for context retrieval, and atomic `$push` with `$each` for appending new messages without full document hydration or resending history.
