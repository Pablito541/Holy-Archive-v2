# Claude Code Instructions: Round 4 - Showroom Removal

Please execute the cleanup of the Showroom feature.

## 1. Delete Unused Files
**Goal**: Remove code related to the public showroom web view.

**Steps**:
1.  Delete the directory `src/app/showroom` recursively.
2.  Delete the directory `src/components/shop` recursively.
3.  Check `src/app/page.tsx` (or `src/middleware.ts` if exists) to ensure no redirects point to `/showroom`.

## 2. Simplify Add Item View
**Target File**: `src/components/views/AddItemView.tsx`

**Goal**: Remove the visual separation between "Public" and "Private" data. Consolidate into one clean form.
**CRITICAL**: Do NOT remove any input fields or functional logic. We only want to simplify the *layout* and *visuals*.

**Steps**:
1.  **Remove Section Design**:
    -   Remove the "Public Showroom" (Green) badge and green border containers.
    -   Remove the "Internal / Private" (Red) badge and red border containers.
    -   Flatten the layout so all inputs are in the main form container (e.g., white background cards, but neutral styling).
2.  **Reorder / Group Fields**:
    -   **Images**: Keep at the very top.
    -   **Core Data**: Group `Brand`, `Model`, `Category`, `Condition` together.
    -   **Financials**: Group `Purchase Price`, `Purchase Date`, `Purchase Source` AND `Sale Price (Angebotspreis)` together.
        -   *Note*: Ensure `salePriceEur` (Angebotspreis) is still editable for "In Stock" items. It is the Target Price.
    -   **Notes**: Keep the notes text area at the bottom.
3.  **Styles**:
    -   Remove any "warning/alert" style colors (red/green backgrounds).
    -   Use a consistent, clean design (e.g., standard `Input` components in a grid).
    -   Leave the **"Sold Data"** section as it is (it acts as a special state when item is sold).
