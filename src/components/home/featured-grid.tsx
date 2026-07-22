import { MediaCard } from "@/components/media/media-card";
import type { MediaSummary } from "@/lib/tmdb/types";

export function FeaturedGrid({ items }: { items: MediaSummary[] }) {
  if (!items.length) return null;
  return (
    <section className="section-space pt-7" aria-labelledby="featured-title">
      <div className="page-container">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 id="featured-title" className="text-xl font-black md:text-2xl">ویژه این هفته</h2>
            <p className="mt-1 text-xs text-muted-foreground">عنوان‌هایی که این روزها بیشتر دیده می‌شوند</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-6 md:gap-4">
          {items.slice(0, 6).map((item) => (
            <MediaCard
              key={`${item.mediaType}-${item.id}`}
              item={item}
              layout="landscape"
              minimal
              className="col-span-1"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
