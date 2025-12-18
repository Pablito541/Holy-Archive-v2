import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata = {
  title: "Holy Archive | Enter",
  description: "Gateway to the Archive.",
};

export default function LandingPage() {
  return (
    <FadeIn className="min-h-screen flex flex-col justify-between p-6 bg-[#fafaf9] text-center">

      {/* Spacer for centering */}
      <div className="flex-1" />

      {/* Main Content: Showroom Access */}
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
          href="/shop/holy-archive"
          className="group flex items-center gap-2 border border-black px-8 py-4 rounded-full hover:bg-black hover:text-white transition-all duration-300"
        >
          <span className="font-medium tracking-wide">ENTER SHOWROOM</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Footer: Team Access */}
      <div className="flex-1 flex flex-col justify-end pb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-black transition-colors opacity-60 hover:opacity-100"
        >
          <ShieldCheck className="w-3 h-3" />
          <span>Team Access</span>
        </Link>
      </div>

    </FadeIn>
  );
}
