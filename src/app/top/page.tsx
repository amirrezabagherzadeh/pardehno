import type { Metadata } from "next";
import { HeroBanner } from "@/components/home/hero-banner";
import { MediaCard } from "@/components/media/media-card";
import { getOfficialImdbTopSnapshot } from "@/lib/tmdb/queries";
import { imdbTopSnapshotDate } from "@/lib/imdb/top-snapshot";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "برترین‌های IMDb",
  description: "فیلم‌ها و سریال‌های برتر، رتبه‌بندی‌شده با امتیاز واقعی IMDb.",
  alternates: { canonical: "/top" },
};

export default async function TopRatedPage() {
  const items = await getOfficialImdbTopSnapshot();
  const heroItems = items.filter((item) => item.backdropPath).slice(0, 4);

  return (
    <>
      <HeroBanner items={heroItems} />
      <section className="page-container pb-14 pt-10 md:pt-14" aria-labelledby="top-title">
        <p className="text-xs font-bold text-primary">IMDb</p>
        <h1 id="top-title" className="mt-2 text-3xl font-black md:text-4xl">برترین فیلم‌ها و سریال‌ها</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">۵۰ فیلم و ۵۰ سریال از نمودارهای رسمی IMDb، به‌صورت یک‌درمیان. Snapshot رتبه‌ها: {imdbTopSnapshotDate}</p>
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item, index) => (
            <MediaCard key={`${item.mediaType}-${item.id}`} item={item} priority={index < 6} />
          ))}
        </div>
      </section>
    </>
  );
}
