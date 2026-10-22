## 2026-10-22 - Slice Projection & Atomic Append for Chat Models
**Learning:** In Mongoose chat models storing unbounded message arrays, loading full documents into memory with `.findOne()` and saving with `.save()` scales as O(N) memory and bandwidth. Slicing on fetch (`$slice: -11`) with `.lean()` and updating via atomic `$push` reduces query payloads and MongoDB writes to O(1).
**Action:** When working with growing document arrays (logs, messages, activity history), project subdocuments using `$slice` and update subdocument arrays using atomic `$push` operators.
