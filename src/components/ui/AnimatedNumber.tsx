import React, { useEffect, useState } from 'react';

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    format?: (value: number) => string;
}

export const AnimatedNumber = ({ value, duration = 1000, format }: AnimatedNumberProps) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);

            setDisplayValue(value * easeOutQuart);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setDisplayValue(value);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [value, duration]);

    return (
        <span>
            {format ? format(displayValue) : Math.round(displayValue)}
        </span>
    );
};
