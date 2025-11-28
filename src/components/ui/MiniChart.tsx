import React from 'react';

interface MiniChartProps {
    data: number[];
    color?: string;
    width?: number;
    height?: number;
}

export const MiniChart = ({
    data,
    color = '#1c1917',
    width = 80,
    height = 32
}: MiniChartProps) => {
    if (data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
            />
            {/* Dots at each data point */}
            {data.map((value, index) => {
                const x = (index / (data.length - 1)) * width;
                const y = height - ((value - min) / range) * height;
                return (
                    <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="2"
                        fill={color}
                        className="transition-all duration-300"
                    />
                );
            })}
        </svg>
    );
};
