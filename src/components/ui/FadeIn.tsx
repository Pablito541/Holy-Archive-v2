import React from 'react';

export const FadeIn = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
    <div className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}>{children}</div>
);
