import type { Metadata } from "next";
import { StoredMediaPage } from "@/components/storage/stored-media-page";

export const metadata: Metadata = { title: "اخیراً مشاهده‌شده", robots: { index: false, follow: false } };
export default function RecentlyViewedPage() { return <StoredMediaPage kind="recent" />; }
