import React, { ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'amber' | 'gradient' | 'luxury';
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    fullWidth?: boolean;
}

export const Button = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    type = 'button',
    disabled = false,
    icon,
    iconPosition = 'left',
    loading = false,
    fullWidth = false
}: ButtonProps) => {
    const baseStyle = "px-6 py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-sm tracking-wide";

    const variants = {
        primary: "bg-stone-900 text-white shadow-xl shadow-stone-900/20 hover:bg-black hover:shadow-2xl",
        secondary: "bg-white text-stone-900 border border-stone-200 shadow-sm hover:bg-stone-50 hover:shadow-md",
        danger: "bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 hover:border-red-200",
        ghost: "bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-900",
        amber: "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-200",
        gradient: "bg-gradient-gold text-white shadow-luxury hover:shadow-luxury-lg",
        luxury: "bg-gradient-luxury text-white shadow-luxury hover:shadow-luxury-lg"
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyle} ${variants[variant]} ${widthStyle} ${className}`}
        >
            {loading && <LoadingSpinner size="sm" variant={variant === 'primary' || variant === 'gradient' || variant === 'luxury' ? 'light' : 'dark'} />}
            {!loading && icon && iconPosition === 'left' && icon}
            {children}
            {!loading && icon && iconPosition === 'right' && icon}
        </button>
    );
};
