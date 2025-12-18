import { AccessGate } from "../../../components/shop/AccessGate";

export const metadata = {
    title: "Holy Archive | Private Collection",
    description: "Exklusiver Zugang zum Inventar.",
};

export default function ShopGatePage() {
    return <AccessGate />;
}
