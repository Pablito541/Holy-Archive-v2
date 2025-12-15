"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { FadeIn } from "./FadeIn";

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Check if user has already dismissed it locally
            const isDismissed = localStorage.getItem("install_prompt_dismissed");
            if (!isDismissed) {
                setIsVisible(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("install_prompt_dismissed", "true");
    };

    if (!isVisible) return null;

    return (
        <FadeIn className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
            <div className="bg-foreground text-background p-4 rounded-xl shadow-2xl border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-background/20 p-2 rounded-lg">
                        <Download className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">App installieren</h3>
                        <p className="text-xs opacity-80">Für Offline-Zugriff nutzen</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDismiss}
                        className="p-2 hover:bg-background/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleInstallClick}
                        className="bg-background text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-background/90 transition-colors"
                    >
                        Installieren
                    </button>
                </div>
            </div>
        </FadeIn>
    );
}
