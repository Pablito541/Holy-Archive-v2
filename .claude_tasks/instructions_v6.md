
# Claude Code Instructions: Round 6 - Strict Bulk Logic

Please update the Bulk Upload logic to enforce a strict "1 Item = 1 Image" rule.

## 1. Dynamic Image Limits & Logic
**Target File**: `src/components/views/AddItemView.tsx`

**Goal**: Remove the hardcoded 5-image limit when in Bulk Mode and ensure perfect mapping.

**Steps**:
1.  **Update `handleFileChange`**:
    -   Calculate `maxImages` dynamically:
        ```typescript
        const maxImages = isBulkMode ? bulkQuantity : 5; // User suggested 1 for single, but 5 is safe fallback.
        ```
    -   Update the check: `if (totalImages > maxImages) { alert(...); return; }`
2.  **Update `handleSubmit`**:
    -   **Strict Validation**:
        ```typescript
        if (isBulkMode) {
          if (finalImageUrls.length !== bulkQuantity) {
             alert(`Fehler: Für ${bulkQuantity} Artikel müssen genau ${bulkQuantity} Fotos hochgeladen werden.`);
             setIsSubmitting(false);
             return;
          }
        }
        ```
    -   **Creation Logic**:
        -   Loop `i` from 0 to `bulkQuantity - 1`.
        -   **Strict Mapping**: `imageUrls: [finalImageUrls[i]]`. (No recycling/modulo needed because we validated length).
        -   `purchasePriceEur`: `formData.purchasePriceEur / bulkQuantity`.
        -   `notes`: `formData.notes` (Optional: Append "Bulk i/N" or keep clean? User said "same details", usually implies clean notes. Let's keep notes clean or maybe Append "Batch [Timestamp]" if useful, but user didn't request it. Keep clean).
3.  **UI Updates**:
    -   Update the "Fotos (X/5)" label to display the dynamic limit: `Fotos (X/{isBulkMode ? bulkQuantity : 5})`.

## 2. Verify Single Mode
-   Ensure Single Mode still works with 1-5 images.
-   Ensure `purchasePriceEur` is NOT divided in Single Mode.
