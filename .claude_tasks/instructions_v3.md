# Claude Code Instructions: Round 3 - Search & Bulk Upload

Please execute the following feature additions.

## 1. Search Persistence
**Target Files**: `src/app/dashboard/DashboardClient.tsx`, `src/components/views/InventoryView.tsx`

**Goal**: Keep the search query active when navigating between items and the list.

**Steps**:
1.  **DashboardClient.tsx**:
    -   Add state: `const [inventorySearchQuery, setInventorySearchQuery] = useState('');`
    -   Pass these to the `InventoryView` component:
        ```typescript
        <InventoryView
            // ... existing props
            searchQuery={inventorySearchQuery}
            onSearchChange={setInventorySearchQuery}
        />
        ```
2.  **InventoryView.tsx**:
    -   Update props interface to accept `searchQuery` and `onSearchChange`.
    -   Remove the local `const [searchQuery, setSearchQuery] = useState('');`.
    -   Use the props instead.

## 2. Bulk Upload Feature
**Target File**: `src/components/views/AddItemView.tsx`

**Goal**: Allow creating multiple items at once (Bulk).

**Steps**:
1.  **State**:
    -   Add state `const [isBulkMode, setIsBulkMode] = useState(false);`
    -   Add state `const [bulkQuantity, setBulkQuantity] = useState(1);`
2.  **UI Changes**:
    -   Add a Toggle/Checkbox "Bulk Upload Mode" near the top (e.g., inside the header or just below).
    -   If `isBulkMode` is true:
        -   Show an Input for "Anzahl" (Quantity) connected to `bulkQuantity`. Minimum 1.
        -   Change the label of "Einkaufspreis" to "Gesamteinkaufspreis (Total)".
        -   Show a small hint: "Preis pro Stück: {purchasePrice / quantity}".
3.  **Submit Logic (`handleSubmit`)**:
    -   If `!isBulkMode`: Proceed as usual.
    -   If `isBulkMode`:
        -   Calculate `pricePerItem = formData.purchasePriceEur / bulkQuantity`.
        -   Prepare `itemsToCreate` array.
        -   **Loop** from `i = 0` to `bulkQuantity - 1`:
            -   Create item object.
            -   **Image Logic**:
                -   Get `finalImageUrls` (from `uploadAllImages`).
                -   If `finalImageUrls.length === bulkQuantity`: Assign ONLY `[finalImageUrls[i]]` to this item.
                -   Else: Assign `finalImageUrls` (all images) to this item.
            -   Set `purchasePriceEur` to `pricePerItem`.
        -   Iterate `itemsToCreate` and insert into Supabase (sequentially or `Promise.all`).
        -   Call `onSave` once (maybe with the last item or just trigger refresh).
