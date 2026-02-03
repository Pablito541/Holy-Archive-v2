# Claude Code Instructions: Round 2 - Refinements

Please execute the following refinements based on user feedback.

## 1. Analysis Drill-down: Fetch Complete Data
**Target File**: `src/components/views/DashboardView.tsx`
**Context**: The previous implementation only filtered locally loaded items (limit 50). The user wants to see ALL sales for a brand.

**Steps**:
1.  Modify `AnalysisModal` to include a `useEffect` that triggers when `selectedBrand` changes.
2.  Inside this effect, if `selectedBrand` is set:
    -   Call `supabase.from('items').select('*').eq('brand', selectedBrand).eq('status', 'sold').eq('organization_id', currentOrgId)`
    -   Store the result in a new state variable: `const [brandItems, setBrandItems] = useState<Item[]>([]);`
    -   Use `brandItems` for the list display instead of filtering `items`.
3.  Ensure the "Sort Options" (Beste Marge / Meister Gewinn) apply to this new `brandItems` list.
4.  Show a loading state (e.g., simplistic "Lade..." text) while fetching.

## 2. Fix Detail View Scroll
**Target File**: `src/app/dashboard/DashboardClient.tsx`
**Context**: When entering the item detail view, the page stays scrolled down, hiding the image.

**Steps**:
1.  Find the function that handles the view switch to `item-detail`. It is likely `onSelectItem` passed to `InventoryView`.
2.  Update it to:
    ```typescript
    onSelectItem={(id) => { 
        scrollPositionRef.current = window.scrollY; // Keep saving this for "Back"
        setSelectedItemId(id); 
        setView('item-detail');
        window.scrollTo(0, 0); // Force top for new view
    }}
    ```

## 3. Export: Unified Amount Column
**Target File**: `src/components/views/ExportView.tsx`
**Context**: User requested merging "Income" and "Expense" into a single "Betrag" column with +/- signs.

**Steps**:
1.  In `downloadExcel`:
    -   Modify the row generation logic.
    -   Remove 'Einnahme' and 'Ausgabe' fields from the data object.
    -   Add 'Betrag' field.
    -   **For Expenses**: `Betrag: -1 * item.purchasePriceEur`
    -   **For Income**: `Betrag: item.salePriceEur`
2.  Update `headers` array to replace "Typ" (optional, keep if useful), "Einnahme", "Ausgabe" with just "Betrag".
    -   *User Tip*: Maybe keep 'Typ' (Einnahme/Ausgabe) as a text column for clarity, but the *Value* should be in one column.
    -   Let's keep: `Datum`, `Typ`, `Beschreibung`, `Betrag` (Signed), `ID`.
