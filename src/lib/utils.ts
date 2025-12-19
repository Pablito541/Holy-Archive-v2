import { Item, Condition } from '../types';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
};

export const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

export const calculateProfit = (item: Item): number | null => {
    if (item.status !== 'sold' || item.salePriceEur === undefined) return null;
    const fees = (item.platformFeesEur || 0) + (item.shippingCostEur || 0);
    return item.salePriceEur - item.purchasePriceEur - fees;
};

export const calculateMarginPercentage = (profit: number, revenue: number) => {
    if (!revenue || revenue === 0) return 0;
    return (profit / revenue) * 100;
};

export const conditionLabels: Record<Condition, string> = {
    mint: 'Neuwertig',
    very_good: 'Sehr gut',
    good: 'Gut',
    fair: 'Akzeptabel',
    poor: 'Schlecht'
};
