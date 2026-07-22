import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock3, Star, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber, formatRating, formatRuntime } from "@/lib/format";
import { toSlug } from "@/lib/slug";
import { TmdbError } from "@/lib/tmdb/errors";
import { tmdbImage } from "@/lib/tmdb/image";
import { getSeasonDetails, getTvDetails } from "@/lib/tmdb/queries";

async function getData(idValue: string, seasonValue: string) {
  const id = Number(idValue);
  const seasonNumber = Number(seasonValue);
  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(seasonNumber) || seasonNumber < 0) notFound();
  try {
    const [tv, season] = await Promise.all([getTvDetails(id), getSeasonDetails(id, seasonNumber)]);
    return { tv, season };
  } catch (error) {
    if (error instanceof TmdbError && error.code === "not-found") notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps<"/tv/[id]/season/[seasonNumber]">): Promise<Metadata> {
  const { id, seasonNumber } = await params;
  const { tv, season } = await getData(id, seasonNumber);
  return { title: `${season.name} از ${tv.name}`, description: season.overview?.slice(0, 155) };
}

export default async function SeasonPage({ params }: PageProps<"/tv/[id]/season/[seasonNumber]">) {
  const { id, seasonNumber } = await params;
  const { tv, season } = await getData(id, seasonNumber);
  return (
    <div className="pb-12 pt-20 md:pt-24">
      <section className="relative overflow-hidden border-b border-white/8">
        <Image src={tmdbImage(tv.backdrop_path, "w1280")} alt="" fill priority sizes="100vw" className="object-cover opacity-28" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d12]/50 to-[#0b0d12]" />
        <div className="page-container relative z-10 grid gap-7 py-10 md:grid-cols-[190px_1fr] md:items-end md:py-16">
          <div className="relative hidden aspect-[2/3] overflow-hidden rounded-xl bg-card poster-shadow md:block">
            <Image src={tmdbImage(season.poster_path, "w500")} alt={`پوستر ${season.name}`} fill sizes="190px" className="object-cover" />
          </div>
          <div>
            <Link href={`/tv/${tv.id}/${toSlug(tv.name)}`} className="text-sm text-primary hover:underline">{tv.name}</Link>
            <h1 className="mt-2 text-4xl font-black md:text-5xl">{season.name}</h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {season.air_date && <span className="flex items-center gap-1.5"><CalendarDays className="size-4" /> {formatDate(season.air_date)}</span>}
              <span className="flex items-center gap-1.5"><UsersRound className="size-4" /> {formatNumber(season.episodes.length)} قسمت</span>
            </div>
            {season.overview && <p className="mt-5 max-w-3xl text-sm leading-8 text-white/70">{season.overview}</p>}
          </div>
        </div>
      </section>
      <section className="page-container py-10" aria-labelledby="episodes-title">
        <h2 id="episodes-title" className="mb-6 text-2xl font-black">قسمت‌ها</h2>
        <div className="grid gap-4">
          {season.episodes.map((episode) => (
            <article key={episode.id} className="grid overflow-hidden rounded-xl border border-white/8 bg-card md:grid-cols-[300px_1fr]">
              <div className="relative aspect-video bg-black md:aspect-auto md:min-h-44">
                <Image src={tmdbImage(episode.still_path || tv.backdrop_path, "w780")} alt={`نمایی از ${episode.name}`} fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover" />
                <Badge className="absolute start-3 top-3 border-0 bg-black/65 text-white">قسمت {formatNumber(episode.episode_number)}</Badge>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="text-lg font-bold">{episode.name}</h3>{episode.vote_average ? <span className="flex items-center gap-1 text-sm text-[#f6c945]"><Star className="size-4 fill-current" /> {formatRating(episode.vote_average)}</span> : null}</div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">{episode.air_date && <span>{formatDate(episode.air_date)}</span>}{episode.runtime && <span className="flex items-center gap-1"><Clock3 className="size-3.5" /> {formatRuntime(episode.runtime)}</span>}</div>
                {episode.overview && <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/65">{episode.overview}</p>}
                {episode.guest_stars?.length ? <p className="mt-3 text-xs text-muted-foreground">بازیگران مهمان: {episode.guest_stars.slice(0, 4).map((person) => person.name).join("، ")}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
