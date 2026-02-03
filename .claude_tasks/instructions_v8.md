# Claude Code Instructions: Round 8 - Analysis View Sorting

Please implement the sorting toggle in the Brand Analysis View.

## 1. Update AnalysisModal
**Target File**: `src/components/views/DashboardView.tsx`

**Goal**: Allow sorting by Margin or Profit within the modal.

**Steps**:
1.  **Add State**:
    -   Inside `AnalysisModal`, add:
        ```typescript
        const [sortMetric, setSortMetric] = useState<'margin' | 'profit'>(type);
        ```
2.  **Update Sorting Logic**:
    -   Use `sortMetric` instead of `type` for the sorting of `mappedItems` inside the `useEffect` (or ideally, move sorting to a `useMemo` so it reacts instanty to state changes without refetching).
    -   *Recommendation*: Fetch data once, set `brandItems`, and then compute `sortedItems` using `useMemo` dependent on `brandItems` and `sortMetric`.
3.  **Add Toggle UI**:
    -   In the header (where "Sortiert nach..." is displayed or next to it), add buttons to switch sort.
    -   Example UI:
        ```tsx
        <div className="flex bg-stone-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button 
                onClick={() => setSortMetric('margin')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${sortMetric === 'margin' ? 'bg-white shadow text-green-600' : 'text-stone-400'}`}
            >
                Marge %
            </button>
            <button 
                onClick={() => setSortMetric('profit')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${sortMetric === 'profit' ? 'bg-white shadow text-stone-900' : 'text-stone-400'}`}
            >
                Gewinn €
            </button>
        </div>
        ```
    -   Place this nicely in the header flex container.
