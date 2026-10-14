## 2026-10-14 - Redundant MongoDB Compound Indexes on Primary Keys
**Learning:** In MongoDB, creating a compound index starting with `_id` (e.g. `{ _id: 1, userId: 1 }`) provides no query speedup because `_id` is already uniquely indexed by default and finds documents in O(1) time. Adding `_id` prefixed compound indexes increases WiredTiger RAM consumption and write latency.
**Action:** Avoid compound indexes starting with `_id`. Index secondary fields directly (e.g. `{ userId: 1 }`) if prefix matching is needed on non-primary fields.
