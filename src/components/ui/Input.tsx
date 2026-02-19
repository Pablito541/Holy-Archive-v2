import React, { ReactNode } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: ReactNode;
    error?: string;
}

export const Input = ({ label, icon, error, className = '', ...props }: InputProps) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                        {icon}
                    </div>
                )}
                <input
                    className={`w-full ${icon ? 'pl-12' : 'px-4'} pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl 
                        text-stone-900 placeholder-stone-400 
                        focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent
                        transition-all duration-300
                        disabled:opacity-50 disabled:bg-stone-50
                        ${error ? 'border-red-300 focus:ring-red-500' : ''}
                        ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-2 text-xs text-red-600 font-medium">{error}</p>
            )}
        </div>
    );
};
