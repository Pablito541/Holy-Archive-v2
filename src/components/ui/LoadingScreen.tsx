"use client";

import React from "react";
import { FadeIn } from "./FadeIn";

interface LoadingScreenProps {
    message?: string;
    fullScreen?: boolean;
}

export function LoadingScreen({ message = "Wird geladen...", fullScreen = true }: LoadingScreenProps) {
    return (
        <div className={`${fullScreen ? "fixed inset-0 z-[100]" : "relative w-full h-full min-h-[400px]"} flex flex-col items-center justify-center bg-stone-50/60 backdrop-blur-sm`}>
            <FadeIn className="flex flex-col items-center gap-6">
                <div className="relative w-16 h-16">
                    {/* Outer ring */}
                    <div className="absolute inset-0 border-4 border-black/5 rounded-full" />
                    {/* Pulsing inner ring */}
                    <div className="absolute inset-0 border-4 border-t-black border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin duration-1000" />
                    {/* Inner glowing dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <p className="font-serif text-lg tracking-wide text-stone-800 animate-pulse">
                        {message}
                    </p>
                    <div className="w-32 h-[1px] bg-black/5 relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-black/40 w-1/2 animate-loading-bar" />
                    </div>
                </div>
            </FadeIn>

            <style jsx>{`
                @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .animate-loading-bar {
                    animation: loading-bar 1.5s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}
