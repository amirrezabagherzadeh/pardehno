import { FeaturedGrid } from "@/components/home/featured-grid";
import { HeroBanner } from "@/components/home/hero-banner";
import { MediaCard } from "@/components/media/media-card";
import { MediaCarousel } from "@/components/media/media-carousel";
import { RecentlyViewedRail } from "@/components/media/recently-viewed-rail";
import { getHomepageData } from "@/lib/tmdb/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { heroItems, featured, sections } = await getHomepageData();
  return (
    <>
      <HeroBanner items={heroItems} />
      <FeaturedGrid items={featured} />
      <div className="-mt-4">
        {sections.map((section) => {
          return (
            <MediaCarousel
              key={section.id}
              title={section.title}
              href={section.href}
              layout="poster"
            >
              {section.items.slice(0, section.id === "now-playing" ? 20 : 14).map((item) => (
                <MediaCard
                  key={`${item.mediaType}-${item.id}`}
                  item={item}
                  layout="poster"
                  className="w-[42vw] snap-start sm:w-44 md:w-48 lg:w-52"
                />
              ))}
            </MediaCarousel>
          );
        })}
      </div>
      <RecentlyViewedRail />
    </>
  );
}
