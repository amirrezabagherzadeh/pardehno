import type { Metadata } from "next";
import { StoredMediaPage } from "@/components/storage/stored-media-page";

export const metadata: Metadata = { title: "فهرست من", robots: { index: false, follow: false } };
export default function WatchlistPage() { return <StoredMediaPage kind="watchlist" />; }
