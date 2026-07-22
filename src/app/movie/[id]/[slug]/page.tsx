import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { MediaDetailPage } from "@/components/details/media-detail-page";
import { siteConfig } from "@/lib/site";
import { matchesRouteSlug, toSlug } from "@/lib/slug";
import { TmdbError } from "@/lib/tmdb/errors";
import { tmdbImage } from "@/lib/tmdb/image";
import { getImdbRatingById } from "@/lib/omdb";
import { getMovieDetails } from "@/lib/tmdb/queries";

async function getMovie(idValue: string) {
  const id = Number(idValue);
  if (!Number.isInteger(id) || id <= 0) notFound();
  try {
    return await getMovieDetails(id);
  } catch (error) {
    if (error instanceof TmdbError && error.code === "not-found") notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps<"/movie/[id]/[slug]">): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovie(id);
  const description = movie.overview?.slice(0, 155) || `اطلاعات و تریلر ${movie.title}`;
  return {
    title: movie.title,
    description,
    alternates: { canonical: `/movie/${movie.id}/${toSlug(movie.title)}` },
    openGraph: {
      type: "video.movie",
      title: movie.title,
      description,
      images: movie.backdrop_path ? [{ url: tmdbImage(movie.backdrop_path, "w1280") }] : undefined,
    },
  };
}

export default async function MoviePage({ params }: PageProps<"/movie/[id]/[slug]">) {
  const { id, slug } = await params;
  const movie = await getMovie(id);
  const imdbRating = await getImdbRatingById(movie.imdb_id);
  const canonicalSlug = toSlug(movie.title);
  if (!matchesRouteSlug(slug, canonicalSlug)) permanentRedirect(`/movie/${movie.id}/${canonicalSlug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    alternateName: movie.original_title,
    description: movie.overview,
    image: tmdbImage(movie.poster_path, "w780"),
    dateCreated: movie.release_date,
    aggregateRating: (imdbRating?.voteCount || movie.vote_count)
      ? { "@type": "AggregateRating", ratingValue: imdbRating?.rating || movie.vote_average, ratingCount: imdbRating?.voteCount || movie.vote_count, bestRating: 10 }
      : undefined,
    url: `${siteConfig.url}/movie/${movie.id}/${canonicalSlug}`,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <MediaDetailPage detail={movie} mediaType="movie" imdbRating={imdbRating} />
    </>
  );
}
