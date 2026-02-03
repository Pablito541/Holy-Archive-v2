# Claude Code Instructions: Round 9 - Fix Analysis UI & Styling

Please refine the Sort Toggle UI and the Item Value styles in the Analysis View.

## 1. Update Layout & Styling
**Target File**: `src/components/views/DashboardView.tsx`

**Goal**:
1.  Make the sort toggle buttons compact (`w-fit`).
2.  Update the item list to show the primary metric on top with specific colors (Green for Margin, Gold for Profit).

**Steps**:

### A. Fix Toggle Width
1.  **Find the Toggle Container**: The div wrapping the "Marge %" and "Gewinn €" buttons in `AnalysisModal`.
2.  **Update Class**: Change `flex` to `inline-flex` (or add `w-fit`).
    -   Example: `className="inline-flex bg-stone-100 dark:bg-zinc-800 p-1 rounded-lg mt-3"`

### B. Refine Item Values (Reordering & Colors)
1.  **Locate**: The rendering loop for `sortedBrandItems`.
2.  **Modify the Right-Side Content (`div className="text-right"`)**:
    -   Implement conditional logic based on `sortMetric`.

    **Logic Explanation**:
    -   **IF `sortMetric === 'margin'`**:
        -   **Top Line**: Margin %. Color: Green (`text-green-600 dark:text-green-400`). Size: Large (`text-lg`).
        -   **Bottom Line**: Profit €. Color: Gray (`text-stone-400 dark:text-zinc-500`). Size: Small (`text-xs`).
    -   **IF `sortMetric === 'profit'`**:
        -   **Top Line**: Profit €. Color: **Gold/Yellow** (`text-yellow-500 dark:text-yellow-400`). Size: Large (`text-lg`).
        -   **Bottom Line**: Margin %. Color: Gray (`text-stone-400 dark:text-zinc-500`). Size: Small (`text-xs`).

    **Code Snippet Implementation**:
    ```tsx
    <div className="text-right">
        {sortMetric === 'margin' ? (
            <>
                <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                    {item.calculatedMargin.toFixed(1)}%
                </p>
                <p className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-tight">
                    +{formatCurrency(item.calculatedProfit)}
                </p>
            </>
        ) : (
            <>
                <p className="font-bold text-yellow-500 dark:text-yellow-400 text-lg">
                    +{formatCurrency(item.calculatedProfit)}
                </p>
                <p className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-tight">
                    {item.calculatedMargin.toFixed(1)}%
                </p>
            </>
        )}
    </div>
    ```
