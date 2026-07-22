"use client";

import { MediaCard } from "@/components/media/media-card";
import { MediaCarousel } from "@/components/media/media-carousel";
import { useRecentlyViewed } from "@/lib/storage/media-store";

export function RecentlyViewedRail() {
  const items = useRecentlyViewed();
  if (!items.length) return null;
  return (
    <MediaCarousel title="اخیراً مشاهده‌شده" href="/recently-viewed">
      {items.slice(0, 14).map((item) => (
        <MediaCard
          key={`${item.mediaType}-${item.id}`}
          item={item}
          className="w-[42vw] snap-start sm:w-44 md:w-48 lg:w-52"
        />
      ))}
    </MediaCarousel>
  );
}
