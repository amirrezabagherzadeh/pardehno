import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { MediaDetailPage } from "@/components/details/media-detail-page";
import { siteConfig } from "@/lib/site";
import { matchesRouteSlug, toSlug } from "@/lib/slug";
import { TmdbError } from "@/lib/tmdb/errors";
import { tmdbImage } from "@/lib/tmdb/image";
import { getImdbRatingById } from "@/lib/omdb";
import { getTvDetails } from "@/lib/tmdb/queries";

async function getTv(idValue: string) {
  const id = Number(idValue);
  if (!Number.isInteger(id) || id <= 0) notFound();
  try {
    return await getTvDetails(id);
  } catch (error) {
    if (error instanceof TmdbError && error.code === "not-found") notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps<"/tv/[id]/[slug]">): Promise<Metadata> {
  const { id } = await params;
  const tv = await getTv(id);
  const description = tv.overview?.slice(0, 155) || `اطلاعات فصل‌ها و تریلر ${tv.name}`;
  return {
    title: tv.name,
    description,
    alternates: { canonical: `/tv/${tv.id}/${toSlug(tv.name)}` },
    openGraph: {
      type: "video.tv_show",
      title: tv.name,
      description,
      images: tv.backdrop_path ? [{ url: tmdbImage(tv.backdrop_path, "w1280") }] : undefined,
    },
  };
}

export default async function TvDetailPage({ params }: PageProps<"/tv/[id]/[slug]">) {
  const { id, slug } = await params;
  const tv = await getTv(id);
  const imdbRating = await getImdbRatingById(tv.external_ids?.imdb_id);
  const canonicalSlug = toSlug(tv.name);
  if (!matchesRouteSlug(slug, canonicalSlug)) permanentRedirect(`/tv/${tv.id}/${canonicalSlug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: tv.name,
    alternateName: tv.original_name,
    description: tv.overview,
    image: tmdbImage(tv.poster_path, "w780"),
    dateCreated: tv.first_air_date,
    numberOfSeasons: tv.number_of_seasons,
    numberOfEpisodes: tv.number_of_episodes,
    url: `${siteConfig.url}/tv/${tv.id}/${canonicalSlug}`,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <MediaDetailPage detail={tv} mediaType="tv" imdbRating={imdbRating} />
    </>
  );
}
