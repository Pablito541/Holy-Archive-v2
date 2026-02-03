# Claude Code Instructions: Round 7 - Single Mode Image Limit

Please update the image limit for Single Item Mode.

## 1. Update Image Limit
**Target File**: `src/components/views/AddItemView.tsx`

**Goal**: Limit normal item upload to a maximum of 3 images.

**Steps**:
1.  **Modify `maxImages` calculation**:
    -   In `handleFileChange`, update the logic:
        ```typescript
        const maxImages = isBulkMode ? bulkQuantity : 3;
        ```
2.  **Modify `useEffect` or Logic for Existing Data**:
    -   Ensure existing items with >3 images don't break, but new uploads enforce the limit.
    -   The check `if (totalImages > maxImages)` will handle new uploads.
3.  **Update UI Labels**:
    -   Update the text "Fotos (X/5)" to "Fotos (X/{maxImages})".
    -   Ensure the "Add" button is hidden when `totalImages >= maxImages`.
    -   Update the loop condition in `handleFileChange`: `i < (maxImages - imageUrls.length - imagePreviews.length)`.
