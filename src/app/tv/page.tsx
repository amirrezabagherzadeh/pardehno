import type { Metadata } from "next";
import { BrowsePage } from "@/components/browse/browse-page";

export const metadata: Metadata = {
  title: "سریال‌ها",
  description: "کشف سریال‌های محبوب و برتر از سراسر جهان با اطلاعات فصل‌ها و قسمت‌ها.",
  alternates: { canonical: "/tv" },
};

export default async function TvPage({ searchParams }: PageProps<"/tv">) {
  return (
    <BrowsePage
      mediaType="tv"
      title="سریال‌ها"
      description="سریال‌های روز و ماندگار را پیدا کنید و اطلاعات فصل‌ها، قسمت‌ها و بازیگران را ببینید."
      searchParams={await searchParams}
    />
  );
}
