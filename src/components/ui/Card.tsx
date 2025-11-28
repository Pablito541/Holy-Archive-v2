import React from 'react';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'glass' | 'gradient';
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export const Card = ({
    children,
    variant = 'default',
    className = '',
    hover = false,
    onClick
}: CardProps) => {
    const baseStyle = "rounded-3xl transition-all duration-300";

    const variants = {
        default: "bg-white border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)]",
        glass: "glass shadow-glass",
        gradient: "gradient-brand text-white shadow-luxury"
    };

    const hoverStyle = hover ? "hover:scale-[1.02] hover:shadow-lg cursor-pointer" : "";

    return (
        <div
            className={`${baseStyle} ${variants[variant]} ${hoverStyle} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
