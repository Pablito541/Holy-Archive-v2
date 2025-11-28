import React from 'react';
import { ItemStatus } from '../../types';

export const StatusBadge = ({ status }: { status: ItemStatus }) => {
    const styles = {
        in_stock: "bg-stone-900 text-white border-stone-900",
        reserved: "bg-amber-100 text-amber-800 border-amber-200",
        sold: "bg-emerald-100 text-emerald-800 border-emerald-200"
    };

    const labels = {
        in_stock: "Lager",
        reserved: "Reserviert",
        sold: "Verkauft"
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};
