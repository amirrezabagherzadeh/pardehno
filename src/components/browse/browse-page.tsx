import { redirect } from "next/navigation";
import { BrowseFilters, type BrowseFilterValues } from "@/components/browse/browse-filters";
import { InfiniteMediaGrid } from "@/components/browse/infinite-media-grid";
import { HeroBanner } from "@/components/home/hero-banner";
import { formatNumber } from "@/lib/format";
import { discoverMedia, getBrowseHeroItems, getGenres } from "@/lib/tmdb/queries";
import type { MediaType } from "@/lib/tmdb/types";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

interface BrowsePageProps {
  mediaType: MediaType;
  title: string;
  description: string;
  searchParams: SearchParams;
  forcedGenre?: number;
}

export async function BrowsePage({
  mediaType,
  title,
  description,
  searchParams,
  forcedGenre,
}: BrowsePageProps) {
  const requestedMedia = first(searchParams.media);
  if (requestedMedia === "movie" || requestedMedia === "tv") {
    const targetPath = requestedMedia === "movie" ? "/movies" : "/tv";
    const normalized = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      const item = first(value);
      if (key !== "media" && item && !(key === "sort" && item === "popularity.desc")) {
        normalized.set(key, item);
      }
    });
    const query = normalized.toString();
    redirect(query ? `${targetPath}?${query}` : targetPath);
  }
  const genre = forcedGenre || Number(first(searchParams.genre)) || undefined;
  const values: BrowseFilterValues = {
    genre: genre ? String(genre) : undefined,
    sort: first(searchParams.sort),
    year: first(searchParams.year),
    language: first(searchParams.language),
    country: first(searchParams.country),
    age: first(searchParams.age),
    quality: first(searchParams.quality),
  };
  const [data, genres, heroItems] = await Promise.all([
    discoverMedia(mediaType, {
      genre,
      sort: values.sort,
      year: values.year,
      language: values.language,
      country: values.country,
      familyFriendly: values.age === "family",
      hdOnly: values.quality === "hd",
      minVotes: values.sort === "vote_average.desc" ? 1000 : undefined,
    }),
    getGenres(mediaType),
    getBrowseHeroItems(mediaType, values.sort),
  ]);

  return (
    <>
      {heroItems.length > 0 && <HeroBanner items={heroItems} />}
    <div className="browse-container pb-10 pt-12 md:pt-16">
      <header className="mb-8 max-w-3xl">
        <p className="mb-2 text-xs font-bold text-primary">کشف و تماشا</p>
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
        <p className="mt-3 text-xs text-white/45">{formatNumber(data.total_results)} عنوان پیدا شد</p>
      </header>
      <BrowseFilters genres={genres} values={values} mediaType={mediaType} />
      <section aria-label="نتایج" className="min-w-0">
          {data.results.length ? (
            <InfiniteMediaGrid
              key={`${mediaType}-${JSON.stringify(values)}`}
              initialItems={data.results}
              initialPage={data.page}
              totalPages={data.total_pages}
              mediaType={mediaType}
              filters={values}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-white/12 bg-card/40 px-5 py-16 text-center text-sm text-muted-foreground">
              با این فیلترها عنوانی پیدا نشد. فیلترها را ساده‌تر کنید.
            </div>
          )}
      </section>
    </div>
    </>
  );
}
