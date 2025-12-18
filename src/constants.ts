import { Category, Condition } from './types';

export const BRANDS = [
    { value: '', label: 'Bitte wählen...' },
    { value: 'Louis Vuitton', label: 'Louis Vuitton' },
    { value: 'Gucci', label: 'Gucci' },
    { value: 'Prada', label: 'Prada' },
    { value: 'Hermès', label: 'Hermès' },
    { value: 'Chanel', label: 'Chanel' },
    { value: 'Dior', label: 'Dior' },
    { value: 'Fendi', label: 'Fendi' },
    { value: 'Celine', label: 'Celine' },
    { value: 'Other', label: 'Sonstige' }
];

export const CATEGORIES: { value: Category, label: string }[] = [
    { value: 'bag', label: 'Tasche' },
    { value: 'wallet', label: 'Geldbeutel' },
    { value: 'accessory', label: 'Accessoire' },
    { value: 'lock', label: 'Schloss / Key' },
    { value: 'other', label: 'Sonstiges' }
];

export const CONDITIONS: { value: Condition, label: string }[] = [
    { value: 'mint', label: 'Neuwertig' },
    { value: 'very_good', label: 'Sehr gut' },
    { value: 'good', label: 'Gut' },
    { value: 'fair', label: 'Akzeptabel' },
    { value: 'poor', label: 'Schlecht' }
];

export const SHOWROOM_SLUG = "holy-archive";
