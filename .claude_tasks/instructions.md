# Claude Code Instructions: Holy Archive v2 Updates

Please execute the following changes in order. Read the relevant files first to understand the context.

## 1. Fix Scroll Position in Inventory
**Target File**: `src/app/dashboard/DashboardClient.tsx`

**Goal**: Preserve scroll position when navigating from Inventory List to Item Detail and back.

**Steps**:
1.  Add a `useRef` hook: `const scrollPositionRef = useRef<number>(0);`
2.  Modify the navigation to Item Detail:
    -   Find the logic where `setView('item-detail')` is called (likely in `onSelectItem` prop of `InventoryView`).
    -   Before setting the view, save the current scroll position: `scrollPositionRef.current = window.scrollY;`
3.  Modify the navigation back to Inventory:
    -   Find the `useEffect` that handles view changes or add a new one.
    -   When `view` changes to `'inventory'`, restore the scroll position:
        ```typescript
        useEffect(() => {
            if (view === 'inventory') {
                window.scrollTo(0, scrollPositionRef.current);
            }
        }, [view]);
        ```
    -   *Note*: You might need a small timeout (e.g., 10ms) if the rendering is not immediate.

## 2. Improve Analysis Drill-down
**Target File**: `src/components/views/DashboardView.tsx`

**Goal**: Allow clicking on a brand in "Beste Marge"/"Meister Gewinn" modals to see products sorted by that metric.

**Steps**:
1.  Update `AnalysisModal` component (internal to `DashboardView`):
    -   Add state: `const [selectedBrand, setSelectedBrand] = useState<string | null>(null);`
    -   If `selectedBrand` is set, render a "Brand Detail" view instead of the list of brands.
    -   **Brand Detail View**:
        -   Header: Brand Name + Back Button (to return to brand list).
        -   List of Items: Filter `items` (from props) by `brand === selectedBrand`.
        -   Sorting:
            -   If `type === 'margin'`, sort by `(salePrice - purchasePrice - fees) / salePrice` Descending.
            -   If `type === 'profit'`, sort by `(salePrice - purchasePrice - fees)` Descending.
        -   Render item cards similar to `InventoryView` or simplistic cards (Image, Model, Profit/Margin value).
2.  In the main Brand List (existing logic):
    -   Make the rows clickable. `onClick={() => setSelectedBrand(b.brand)}`.

## 3. Improve Export for Accounting
**Target File**: `src/components/views/ExportView.tsx`

**Goal**: Export a "Transaction Ledger" (Income/Expenses) for the selected period, with a summary.

**Steps**:
1.  Add helper function `isInPeriod(date: string, year, month, quarter): boolean`.
2.  Inside `downloadExcel` function:
    -   Create a new array `transactions`.
    -   Iterate through `items`.
    -   **Expense Entry**: If `item.purchaseDate` is in the selected period -> Add row:
        -   Type: 'AUSGABE'
        -   Date: `item.purchaseDate`
        -   Description: `Einkauf: ${item.brand} ${item.model}`
        -   Amount: `item.purchasePriceEur` (negative value or separate column? Best use positive value in "Ausgaben" column or negative in "Betrag"). Let's use: `Einnahme`, `Ausgabe`.
    -   **Income Entry**: If `item.saleDate` is in the selected period (checking `item.status === 'sold'`) -> Add row:
        -   Type: 'EINNAHME'
        -   Date: `item.saleDate`
        -   Description: `Verkauf: ${item.brand} ${item.model}`
        -   Amount: `item.salePriceEur`
3.  **Summary**:
    -   Calculate `Total Income`, `Total Expenses`, `Profit = Income - Expenses`.
    -   Append these as rows at the bottom of the Excel sheet (leave a few empty rows).
4.  Export columns: `Datum`, `Typ`, `Beschreibung`, `Betrag`, `ID`, `Notizen`.
