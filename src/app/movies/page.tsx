import type { Metadata } from "next";
import { BrowsePage } from "@/components/browse/browse-page";

export const metadata: Metadata = {
  title: "فیلم‌ها",
  description: "کشف فیلم‌های تازه، محبوب و برتر با اطلاعات فارسی و فیلترهای کاربردی.",
  alternates: { canonical: "/movies" },
};

export default async function MoviesPage({ searchParams }: PageProps<"/movies">) {
  return (
    <BrowsePage
      mediaType="movie"
      title="فیلم‌ها"
      description="از تازه‌های سینما تا کلاسیک‌های ماندگار؛ بر اساس ژانر، سال، امتیاز و زبان جستجو کنید."
      searchParams={await searchParams}
    />
  );
}
