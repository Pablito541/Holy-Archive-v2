import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata = {
  title: "Holy Archive | Enter",
  description: "Gateway to the Archive.",
};

export default function LandingPage() {
  return (
    <FadeIn className="min-h-screen flex flex-col justify-between p-6 text-center">

      {/* Spacer for centering */}
      <div className="flex-1" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-serif tracking-tighter">
            Holy Archive
          </h1>
          <p className="text-muted-foreground text-lg uppercase tracking-widest text-xs">
            Vintage & Curated Goods
          </p>
        </div>

        <Link
          href="/dashboard"
          className="group flex items-center gap-2 border border-black dark:border-white px-8 py-4 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
        >
          <span className="font-medium tracking-wide">ENTER</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Footer spacer */}
      <div className="flex-1" />

    </FadeIn>
  );
}
