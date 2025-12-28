"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Filter, Heart, ShoppingBag, ArrowUpDown } from "lucide-react";
import { Item, Category } from "@/types";
import { ProductCard } from "../../components/shop/ProductCard";
import { FadeIn } from "../../components/ui/FadeIn";
import { AccessGate } from "../../components/shop/AccessGate";
import { SHOWROOM_SLUG, CATEGORIES } from "@/constants";
import { createClient } from "@/lib/supabase";

interface ShowroomClientProps {
    initialItems: Item[];
    initialOrgName: string;
    initialOrgId: string;
}

export default function ShowroomClient({ initialItems, initialOrgName, initialOrgId }: ShowroomClientProps) {
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBrand, setFilterBrand] = useState<string>("");
    const [filterCondition, setFilterCondition] = useState<string>("");
    const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'likes'>('likes');
    const [showLikedOnly, setShowLikedOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const supabase = createClient();
    const memberKey = `member_of_${SHOWROOM_SLUG}`;

    // Get unique brands for filter (moved up before useEffect)
    const uniqueBrands = Array.from(new Set(initialItems.map(item => item.brand))).sort();
    const uniqueConditions = Array.from(new Set(initialItems.map(item => item.condition))).sort();

    // Filter and sort items (useMemo MUST be before useEffect)
    const filteredAndSortedItems = useMemo(() => {
        let result = initialItems.filter(item => {
            // Search filter
            if (searchQuery) {
                const search = searchQuery.toLowerCase();
                const matchesSearch =
                    item.brand.toLowerCase().includes(search) ||
                    item.model.toLowerCase().includes(search) ||
                    item.category.toLowerCase().includes(search);
                if (!matchesSearch) return false;
            }

            // Category filter
            if (filterCategory !== 'all' && item.category !== filterCategory) return false;

            // Brand filter
            if (filterBrand && item.brand !== filterBrand) return false;

            // Condition filter
            if (filterCondition && item.condition !== filterCondition) return false;

            // TODO: Liked filter (requires fetching user's likes)
            // if (showLikedOnly) { ... }

            return true;
        });

        // Sort items
        switch (sortBy) {
            case 'newest':
                return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            case 'oldest':
                return result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            case 'price_asc':
                return result.sort((a, b) => a.purchasePriceEur - b.purchasePriceEur);
            case 'price_desc':
                return result.sort((a, b) => b.purchasePriceEur - a.purchasePriceEur);
            case 'likes':
                return result.sort((a, b) => ((b as any).likeCount || 0) - ((a as any).likeCount || 0));
            default:
                return result;
        }
    }, [initialItems, searchQuery, filterCategory, filterBrand, filterCondition, sortBy]);

    const activeFilterCount = [filterBrand, filterCondition, showLikedOnly].filter(Boolean).length;

    // Handle scroll to hide/show header
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < 10) {
                // Always show header at top
                setIsHeaderVisible(true);
            } else if (currentScrollY > lastScrollY) {
                // Scrolling down - hide header
                setIsHeaderVisible(false);
            } else {
                // Scrolling up - show header
                setIsHeaderVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Check authentication
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setIsAuthenticated(!!user);
        };
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    useEffect(() => {
        // Check access on mount
        setHasAccess(!!localStorage.getItem(memberKey));
    }, [memberKey]);

    if (hasAccess === null || isAuthenticated === null) return null; // Wait for mount check

    if (!hasAccess) {
        return <AccessGate onSuccess={() => setHasAccess(true)} slug={SHOWROOM_SLUG} initialOrgName={initialOrgName} initialOrgId={initialOrgId} />;
    }

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-black">
            {/* Holy Archive Header - Sticky */}
            <div className={`sticky top-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-stone-200 dark:border-zinc-800 shadow-sm transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
                }`}>
                <div className="max-w-7xl mx-auto px-4 py-3">
                    {/* Logo & Brand */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-stone-900 dark:bg-white rounded-xl flex items-center justify-center shadow-md rotate-3 transition-transform hover:rotate-6">
                                <ShoppingBag className="text-white dark:text-stone-900 w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-base font-serif font-bold text-stone-900 dark:text-white">Holy Archive</h1>
                                <p className="text-[10px] text-stone-500 dark:text-zinc-400 font-light">Showroom</p>
                            </div>
                        </div>

                        {/* User indicator */}
                        {!isAuthenticated && (
                            <button className="text-xs font-medium text-stone-900 dark:text-white hover:text-stone-600 dark:hover:text-zinc-300 transition-colors">
                                Anmelden
                            </button>
                        )}
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Suche nach Marke, Modell..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-stone-100 dark:bg-zinc-800 text-stone-900 dark:text-white placeholder-stone-500 dark:placeholder-zinc-500 border border-stone-200 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-stone-400 dark:focus:border-zinc-600 transition-colors"
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-3 py-2 bg-stone-100 dark:bg-zinc-800 text-stone-900 dark:text-white rounded-xl border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-stone-400 dark:focus:border-zinc-600 transition-colors"
                        >
                            <option value="newest">Neueste</option>
                            <option value="likes">Beliebteste</option>
                            <option value="price_desc">Preis ↓</option>
                            <option value="price_asc">Preis ↑</option>
                            <option value="oldest">Älteste</option>
                        </select>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="relative px-4 py-2 bg-stone-100 dark:bg-zinc-800 text-stone-900 dark:text-white rounded-xl border border-stone-200 dark:border-zinc-700 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-600 dark:bg-teal-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar mt-3">
                        <button
                            onClick={() => setFilterCategory('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterCategory === 'all'
                                ? 'bg-stone-900 dark:bg-white text-white dark:text-black'
                                : 'border border-stone-300 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:border-stone-400 dark:hover:border-zinc-600'
                                }`}
                        >
                            Alle
                        </button>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setFilterCategory(cat.value)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterCategory === cat.value
                                    ? 'bg-stone-900 dark:bg-white text-white dark:text-black'
                                    : 'border border-stone-300 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:border-stone-400 dark:hover:border-zinc-600'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-3 p-4 bg-stone-100 dark:bg-zinc-800 rounded-xl space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300 mb-1">Marke</label>
                                <select
                                    value={filterBrand}
                                    onChange={(e) => setFilterBrand(e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-900 text-stone-900 dark:text-white border border-stone-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">Alle Marken</option>
                                    {uniqueBrands.map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300 mb-1">Zustand</label>
                                <select
                                    value={filterCondition}
                                    onChange={(e) => setFilterCondition(e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-900 text-stone-900 dark:text-white border border-stone-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">Alle Zustände</option>
                                    {uniqueConditions.map(condition => (
                                        <option key={condition} value={condition}>{condition}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={() => {
                                    setFilterBrand("");
                                    setFilterCondition("");
                                    setShowLikedOnly(false);
                                }}
                                className="w-full text-sm text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                            >
                                Filter zurücksetzen
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-3 py-4">
                <FadeIn>
                    {filteredAndSortedItems.length === 0 ? (
                        <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800">
                            <p className="text-stone-500 dark:text-zinc-400 italic">
                                {searchQuery || activeFilterCount > 0 ? "Keine Artikel gefunden." : "Aktuell keine Artikel in der Kollektion."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {filteredAndSortedItems.map((item) => (
                                <ProductCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </FadeIn>
            </main>
        </div>
    );
}
