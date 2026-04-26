# Server-Side Pagination & MongoDB Query Architecture

## The Problem with Loading Everything

The current PoC loads all records from a static JSON file into the browser at once. With 10 mock
records this is fine. With 11,000 real donor records — each carrying ~50+ fields — the JSON
payload would be 10–15 MB on every page load, held entirely in browser memory. That doesn't scale.

The solution is to never send the full dataset to the frontend. Instead, the frontend describes
*what it wants* (filters + which page), the server runs that query against MongoDB, and only the
matching page of results comes back.

---

## The Query Flow

```
User sets filters → presses Search → frontend sends filter params + page number to API
                                              ↓
                              MongoDB runs query with those filters
                                              ↓
                         Server returns: { records: [...50 docs], total: 6000 }
                                              ↓
                              Table renders those 50 records
                                              ↓
                         User clicks "Next Page" → same query, next 50 docs
```

The server is stateless. There is no cached result set being held between requests.
Every page click is a fresh, independent MongoDB query.

---

## How skip + limit Works

MongoDB's `skip` and `limit` operators let you slice a query result:

```js
// Page 1 — records 1–50
db.donors.find({ sex: "Male" }).sort({ npid: 1 }).skip(0).limit(50)

// Page 2 — records 51–100
db.donors.find({ sex: "Male" }).sort({ npid: 1 }).skip(50).limit(50)

// Page 3 — records 101–150
db.donors.find({ sex: "Male" }).sort({ npid: 1 }).skip(100).limit(50)
```

The query re-runs from scratch each time. `skip(N)` means "run this query in sorted order,
discard the first N results, hand me the next 50." No cache, no persistent cursor, no expiry.

---

## Why You Must Sort

Without a sort, `skip(50)` is meaningless — MongoDB has no guaranteed natural document order.
You could get overlapping records across pages, or different records each time the same page is
requested. The sort defines the ordered sequence that `skip` and `limit` operate over.

The sort field becomes the anchor for the entire pagination sequence. In this app, sorting by
`npid` (alphanumeric case ID) is the natural default, with the UI also allowing sort by age,
Braak stage, etc. Changing the sort column resets to page 1.

---

## Why This Is Fast: Indexes

Without an index, each query scans all 11,000 documents to find matches — slow.
With an index on `sex`, MongoDB jumps directly to matching documents via the index, like
using a book's index instead of reading every page. Queries run in single-digit milliseconds.

Fields that should be indexed for this app:
- `sex`, `race`, `primary_diagnosis` (exact match filters)
- `braak_stage`, `thal_phase` (checkbox filters — multi-value `$in` queries)
- `age_at_death` (range filter)
- `apoe`, `mapt` (genetic filters)
- `npid`, `autopsy_id` (text search)

The record count (`6,000 results`) is a separate `countDocuments` call — also fast with an index,
returns just a number with no documents transferred.

---

## Cursor-Based Pagination (Future Consideration)

`skip`/`limit` has one weakness at scale: `skip(50000)` forces MongoDB to traverse 50,000
documents just to throw them away. For 11,000 records this is imperceptible. If the dataset
ever grew to millions, cursor-based (keyset) pagination is more efficient:

```js
// Page 1
db.donors.find({ sex: "Male" }).sort({ npid: 1 }).limit(50)
// → last doc on page has npid = "NP-0051"

// Page 2 — no skip, just "everything after the last value you saw"
db.donors.find({ sex: "Male", npid: { $gt: "NP-0051" } }).sort({ npid: 1 }).limit(50)
```

MongoDB uses the index to jump directly to `NP-0051` — O(log n) instead of O(n).
The tradeoff: you can't jump to an arbitrary page number (no "go to page 47").
Not needed at 11k records; documented here for future reference.

---

## Frontend Architecture Changes Required

The current frontend computes `filteredData` as a pure in-memory calculation:

```ts
const filteredData = applyFilters(data, filterState)  // runs synchronously, no network
```

With a MongoDB backend this becomes an async fetch, which requires several changes:

**Two filter states instead of one:**
- `pendingFilters` — what the user is currently editing in the sidebar (drives the live count)
- `committedFilters` — the filters from the last Search press (drives the actual data query)

**Live record count:** A cheap `countDocuments` query fires on every `pendingFilters` change
(debounced ~300ms) so the user sees "~340 matching records" before pressing Search.

**Explicit Search button:** Table starts empty. User builds their query, sees the live count,
presses Search. `committedFilters` is set, data query fires, table populates.

**useEffect is now required:** Fetching is a side effect (network I/O), unlike the current
pure in-memory filter. `useEffect` watches `committedFilters` + `page` and fires the API call.

**Debouncing:** Text inputs (ID search, age ranges) must debounce their updates to
`pendingFilters` — otherwise a `countDocuments` query fires on every single keystroke.

**Loading + empty states:**
- Initial: "Enter filters and press Search"
- Loading: spinner while query runs
- No results: "No records match these filters"
- Results: paginated table with "X records found"

---

## Summary

| Concern | Where it lives |
|---|---|
| Filter logic | MongoDB query on the server |
| Record count | Server — `countDocuments`, returns a number |
| Actual records | Server — only current page (50 docs) sent to browser |
| Sort order | Passed as query param, anchors the pagination sequence |
| Pagination state (`page`, `limit`) | Frontend state, sent as query params each request |
| UI rendering | Frontend — same components, fed from API instead of local array |
