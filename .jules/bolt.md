# Bolt's Journal - Critical Learnings

## 2026-10-13 - MongoDB Array Slicing for Conversation History
**Learning:** Fetching an entire Mongoose document with unbounded subdocument arrays (like `messages`) over-allocates RAM and network bandwidth when only recent history (e.g. last 12 messages) is needed for LLM context. Using `{ messages: { $slice: -12 } }` projection severely cuts payload size on long chat sessions.
**Action:** Always project bounded slices for array fields in document stores when only recent history is needed.
