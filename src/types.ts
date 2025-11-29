export type ItemStatus = 'in_stock' | 'reserved' | 'sold';
export type Condition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';
export type Category = 'bag' | 'wallet' | 'accessory' | 'lock' | 'other';

export interface Item {
    id: string;
    brand: string;
    model: string;
    category: Category;
    condition: Condition;
    status: ItemStatus;

    purchasePriceEur: number;
    purchaseDate: string;
    purchaseSource: string;

    salePriceEur?: number;
    saleDate?: string;
    saleChannel?: string;
    platformFeesEur?: number;
    shippingCostEur?: number;

    reservedFor?: string;
    reservedUntil?: string;

    imageUrls: string[];
    notes: string;
    createdAt: string;
}
