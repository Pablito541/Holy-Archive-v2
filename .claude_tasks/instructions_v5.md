# Claude Code Instructions: Round 5 - Detailed Bulk & Search

Please implement the Search Persistence and Detailed Bulk Upload logic.

## 1. Search Persistence
**Target Files**: `src/app/dashboard/DashboardClient.tsx`, `src/components/views/InventoryView.tsx`

**Goal**: Keep the search query active when navigating.

**Steps**:
1.  **DashboardClient.tsx**:
    -   Add `const [inventorySearchQuery, setInventorySearchQuery] = useState('');`
    -   Pass `searchQuery={inventorySearchQuery}` and `onSearchChange={setInventorySearchQuery}` to `<InventoryView />`.
2.  **InventoryView.tsx**:
    -   Update props: `interface InventoryViewProps { ... searchQuery: string; onSearchChange: (q: string) => void; }`
    -   Remove local `useState` for query. Use props.

## 2. Detailed Bulk Upload
**Target File**: `src/components/views/AddItemView.tsx`

**Goal**: Implement the "10 Wallets" scenario.

**Steps**:
1.  **Update UI for Bulk Mode**:
    -   When `isBulkMode` is TRUE:
        -   Hide "Zielpreis / VK" input.
        -   Change label of Purchase Price to "Gesamteinkaufspreis".
        -   Show a hint: "Bild-Logik: 1 Bild pro Artikel (Reihenfolge wird eingehalten)".
2.  **Update Submit Logic (`handleSubmit`)**:
    -   **Validation**: If `isBulkMode` and `finalImageUrls.length > 0` and `finalImageUrls.length !== bulkQuantity`:
        -   Show confirm dialog: "Warnung: Anzahl Bilder ({images}) stimmt nicht mit Anzahl Artikel ({qty}) überein. Fortfahren?" (Use `window.confirm`).
    -   **Creation Loop**:
        -   `pricePerItem = formData.purchasePriceEur / bulkQuantity`.
        -   Loop `i` from 0 to `bulkQuantity - 1`.
        -   **Image Assignment**:
            -   `const myImage = finalImageUrls[i % finalImageUrls.length];` (Modulo ensures safety if mismatched count).
            -   `imageUrls: myImage ? [myImage] : []`.
        -   Create Item with `purchasePriceEur: pricePerItem`.
        -   **Important**: Do NOT include `salePriceEur` (Zielpreis) if hidden/optional, or set to 0.
3.  **Refinement**:
    -   Ensure the "Total Purchase Price" input extends to full width if the "Zielpreis" input is hidden (use `col-span-2` if in grid).
