import { ShopHeader } from "../../../../components/shop/ShopHeader";

export default function CollectionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <ShopHeader />
            <main className="min-h-screen">
                {children}
            </main>
        </>
    );
}
