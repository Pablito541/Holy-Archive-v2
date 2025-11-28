import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'light' | 'dark';
}

export const LoadingSpinner = ({ size = 'md', variant = 'dark' }: LoadingSpinnerProps) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    const colors = {
        light: 'border-white',
        dark: 'border-stone-900'
    };

    return (
        <div className="flex items-center justify-center">
            <div
                className={`${sizes[size]} ${colors[variant]} border-4 border-t-transparent rounded-full animate-spin`}
            />
        </div>
    );
};

export const SkeletonCard = () => {
    return (
        <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] animate-pulse">
            <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-stone-200 rounded-2xl animate-shimmer" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-200 rounded w-3/4 animate-shimmer" />
                    <div className="h-3 bg-stone-200 rounded w-1/2 animate-shimmer" />
                </div>
            </div>
        </div>
    );
};
