# Claude Code Instructions: Round 10 - ROI Display

Please add the ROI (Return on Investment) calculation to the Sold Item Detail View.

## 1. Add ROI to ItemDetailView
**Target File**: `src/components/views/ItemDetailView.tsx`

**Goal**: Calculate and display ROI next to the Reingewinn (Net Profit).

**Steps**:

### A. Calculate ROI
1.  Locate the calculateProfit line: `const profit = calculateProfit(item);`.
2.  Add the ROI calculation below it:
    ```typescript
    const roi = item.purchasePriceEur ? ((profit || 0) / item.purchasePriceEur) * 100 : 0;
    ```

### B. Display ROI
1.  Locate the "Reingewinn" block (around line 112):
    ```tsx
    <div className="flex justify-between items-end border-t border-white/20 pt-4">
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Reingewinn</span>
        <span className="text-3xl font-serif">{formatCurrency(profit || 0)}</span>
    </div>
    ```
2.  Replace the right-side value span with a container displaying both Profit and ROI:
    ```tsx
    <div className="flex justify-between items-end border-t border-white/20 pt-4">
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Reingewinn</span>
        <div className="text-right">
            <span className="block text-3xl font-serif">{formatCurrency(profit || 0)}</span>
            <span className="text-sm font-bold text-emerald-400">{roi.toFixed(0)}% ROI</span>
        </div>
    </div>
    ```
