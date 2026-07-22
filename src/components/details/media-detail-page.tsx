import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  Globe2,
  Languages,
  MapPin,
  ShieldCheck,
  Star,
  UsersRound,
} from "lucide-react";
import { CommentsSection } from "@/components/comments/comments-section";
import { ImageGallery } from "@/components/media/image-gallery";
import { MediaCard } from "@/components/media/media-card";
import { MediaCarousel } from "@/components/media/media-carousel";
import { RecentViewTracker } from "@/components/media/recent-view-tracker";
import { ShareButton } from "@/components/media/share-button";
import { TrailerDialog } from "@/components/media/trailer-dialog";
import { WatchlistButton } from "@/components/media/watchlist-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  formatCompactNumber,
  formatDate,
  formatMoney,
  formatNumber,
  formatRating,
  formatRuntime,
  getYear,
} from "@/lib/format";
import { toSlug } from "@/lib/slug";
import { tmdbImage } from "@/lib/tmdb/image";
import { rankVideos, toMediaSummary } from "@/lib/tmdb/transformers";
import type {
  MediaSummary,
  MediaType,
  TmdbCastMember,
  TmdbDetail,
  TmdbMovieDetail,
  TmdbProviderRegion,
  TmdbTvDetail,
} from "@/lib/tmdb/types";
import type { ImdbRating } from "@/lib/omdb";

function detailTitle(detail: TmdbDetail, mediaType: MediaType) {
  return mediaType === "movie"
    ? (detail as TmdbMovieDetail).title
    : (detail as TmdbTvDetail).name;
}

function detailDate(detail: TmdbDetail, mediaType: MediaType) {
  return mediaType === "movie"
    ? (detail as TmdbMovieDetail).release_date
    : (detail as TmdbTvDetail).first_air_date;
}

function getCertification(detail: TmdbDetail, mediaType: MediaType) {
  if (mediaType === "movie") {
    const results = (detail as TmdbMovieDetail).release_dates?.results || [];
    const region = results.find((item) => item.iso_3166_1 === "IR") || results.find((item) => item.iso_3166_1 === "US");
    return region?.release_dates.find((item) => item.certification)?.certification || null;
  }
  const results = (detail as TmdbTvDetail).content_ratings?.results || [];
  return (results.find((item) => item.iso_3166_1 === "IR") || results.find((item) => item.iso_3166_1 === "US"))?.rating || null;
}

function asSummary(detail: TmdbDetail, mediaType: MediaType): MediaSummary {
  return toMediaSummary(
    {
      ...detail,
      media_type: mediaType,
      genre_ids: detail.genres?.map((genre) => genre.id),
      title: mediaType === "movie" ? (detail as TmdbMovieDetail).title : undefined,
      name: mediaType === "tv" ? (detail as TmdbTvDetail).name : undefined,
      original_title: mediaType === "movie" ? (detail as TmdbMovieDetail).original_title : undefined,
      original_name: mediaType === "tv" ? (detail as TmdbTvDetail).original_name : undefined,
    },
    mediaType,
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 rounded-lg border border-white/7 bg-white/[0.025] p-4">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-sm text-white/85">{value}</dd></div>
    </div>
  );
}

function CastRail({ cast }: { cast: TmdbCastMember[] }) {
  if (!cast.length) return null;
  return (
    <section className="section-space" aria-labelledby="cast-title">
      <div className="page-container">
        <h2 id="cast-title" className="mb-5 text-2xl font-black">بازیگران</h2>
        <div className="hide-scrollbar flex snap-x gap-3 overflow-x-auto pb-4 md:gap-4">
          {cast.slice(0, 16).map((person) => (
            <Link key={person.id} href={`/person/${person.id}/${toSlug(person.name)}`} className="focus-ring group w-28 shrink-0 snap-start rounded-lg sm:w-36">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-card">
                <Image src={tmdbImage(person.profile_path, "w342")} alt={`تصویر ${person.name}`} fill sizes="144px" className="object-cover transition duration-300 group-hover:scale-[1.035]" />
              </div>
              <h3 className="mt-2 truncate text-sm font-semibold group-hover:text-primary">{person.name}</h3>
              {person.character && <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">در نقش {person.character}</p>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function AvailabilityPreview({ mediaType, tv }: { mediaType: MediaType; tv: TmdbTvDetail | null }) {
  if (mediaType === "movie") {
    return (
      <div>
        <h3 className="mb-3 text-xs font-bold text-muted-foreground">کیفیت‌های نمایشی</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {["4K", "1080p", "720p", "480p"].map((quality) => (
            <div key={quality} className="rounded-lg border border-white/8 bg-black/15 px-3 py-3 text-center">
              <p dir="ltr" className="font-bold text-white">{quality}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">فقط نمایش ظاهری</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const seasons = tv?.seasons?.filter((season) => season.season_number > 0) || [];
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold text-muted-foreground">فصل‌ها و قسمت‌ها</h3>
      {seasons.length ? (
        <div className="grid gap-3">
          {seasons.map((season) => {
            const visibleEpisodes = Math.min(season.episode_count, 10);
            return (
              <div key={season.id} className="rounded-lg border border-white/8 bg-black/15 p-3">
                <div className="flex items-center justify-between gap-3"><p className="text-sm font-bold">{season.name}</p><span className="text-xs text-muted-foreground">{formatNumber(season.episode_count)} قسمت</span></div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Array.from({ length: visibleEpisodes }, (_, index) => <span key={index} className="rounded-md border border-white/8 px-2 py-1 text-[11px] text-white/75">قسمت {formatNumber(index + 1)}</span>)}
                  {season.episode_count > visibleEpisodes && <span className="rounded-md px-2 py-1 text-[11px] text-muted-foreground">+{formatNumber(season.episode_count - visibleEpisodes)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      ) : <p className="text-sm text-muted-foreground">اطلاعات فصل‌ها هنوز در دسترس نیست.</p>}
    </div>
  );
}

function ProviderList({ providers, mediaType, tv }: { providers?: TmdbProviderRegion; mediaType: MediaType; tv: TmdbTvDetail | null }) {
  const groups = [
    ["اشتراکی", providers?.flatrate],
    ["رایگان", providers?.free],
    ["همراه تبلیغ", providers?.ads],
    ["اجاره", providers?.rent],
    ["خرید", providers?.buy],
  ] as const;
  const available = groups.filter(([, list]) => list?.length);
  return (
    <section className="rounded-xl border border-white/8 bg-card p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-black">نسخه‌ها و راه‌های تماشای قانونی</h2><p className="mt-1 text-xs text-muted-foreground">اطلاعات کیفیت، فصل و قسمت صرفاً نمایشی است؛ پخش یا دانلود در این سایت فعال نیست.</p></div>
        <ShieldCheck className="text-primary" aria-hidden />
      </div>
      <Separator className="my-5" />
      {available.length ? (
        <div className="grid gap-5">
          {available.map(([label, list]) => (
            <div key={label}>
              <h3 className="mb-3 text-xs font-bold text-muted-foreground">{label}</h3>
              <div className="flex flex-wrap gap-3">
                {list?.map((provider) => (
                  <div key={`${label}-${provider.provider_id}`} className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/15 p-2 pe-3">
                    <Image src={tmdbImage(provider.logo_path, "w92")} alt="" width={36} height={36} className="rounded-md" />
                    <span className="text-xs">{provider.provider_name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-5 border-t border-white/8 pt-5"><AvailabilityPreview mediaType={mediaType} tv={tv} /></div>
      {providers?.link && <a href={providers.link} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs text-primary hover:underline"><ExternalLink aria-hidden /> مشاهده اطلاعات در JustWatch</a>}
    </section>
  );
}

export function MediaDetailPage({ detail, mediaType, imdbRating }: { detail: TmdbDetail; mediaType: MediaType; imdbRating?: ImdbRating | null }) {
  const title = detailTitle(detail, mediaType);
  const date = detailDate(detail, mediaType);
  const summary = asSummary(detail, mediaType);
  const tv = mediaType === "tv" ? (detail as TmdbTvDetail) : null;
  const movie = mediaType === "movie" ? (detail as TmdbMovieDetail) : null;
  const credits = detail.aggregate_credits || detail.credits;
  const directors = (detail.credits?.crew || []).filter((person) => ["Director", "Writer", "Screenplay", "Producer", "Director of Photography", "Original Music Composer"].includes(person.job || ""));
  const recommendations = (detail.recommendations?.results || []).slice(0, 14).map((item) => toMediaSummary(item, mediaType));
  const similar = (detail.similar?.results || []).slice(0, 14).map((item) => toMediaSummary(item, mediaType));
  const videos = rankVideos(detail.videos);
  const regionProviders = detail["watch/providers"]?.results?.IR;
  const certification = getCertification(detail, mediaType);

  return (
    <>
      <RecentViewTracker item={summary} />
      <section className="relative min-h-[720px] overflow-hidden md:min-h-[800px] lg:h-[90vh] lg:max-h-[940px]" aria-labelledby="detail-title">
        <Image src={tmdbImage(detail.backdrop_path || detail.poster_path, "original")} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="detail-scrim absolute inset-0" />
        <div className="page-container relative z-10 flex min-h-[720px] items-end pb-12 pt-28 md:min-h-[800px] lg:h-full">
          <div className="grid w-full items-end gap-7 md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr] lg:gap-10">
            <div className="relative hidden aspect-[2/3] overflow-hidden rounded-xl bg-card poster-shadow md:block">
              <Image src={tmdbImage(detail.poster_path, "w780")} alt={`پوستر ${title}`} fill sizes="260px" className="object-cover" />
            </div>
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="border-0 bg-primary text-primary-foreground">{mediaType === "movie" ? "فیلم" : "سریال"}</Badge>
                {certification && <Badge variant="secondary">رده سنی {certification}</Badge>}
                {detail.status && <Badge variant="outline" className="border-white/15 text-white/80">{detail.status}</Badge>}
              </div>
              <h1 id="detail-title" className="text-balance text-4xl font-black leading-[1.18] md:text-5xl lg:text-6xl">{title}</h1>
              {detail.tagline && <p className="mt-4 text-base font-medium text-primary/85">{detail.tagline}</p>}
              <div className="mt-5 flex flex-wrap items-center gap-2.5 text-sm text-white/72">
                <Badge variant="secondary" className="gap-1 border-0 bg-white/10 text-white"><Star className="size-3.5 fill-[#f6c945] text-[#f6c945]" /> <span dir="ltr">{imdbRating ? `IMDb ${formatRating(imdbRating.rating)}` : `TMDB ${formatRating(detail.vote_average || 0)}`}</span></Badge>
                <span>{formatCompactNumber(imdbRating?.voteCount || detail.vote_count || 0)} رأی</span>
                {getYear(date) && <><span>·</span><span>{getYear(date)}</span></>}
                {movie?.runtime && <><span>·</span><span>{formatRuntime(movie.runtime)}</span></>}
                {tv?.number_of_seasons && <><span>·</span><span>{formatNumber(tv.number_of_seasons)} فصل</span></>}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">{detail.genres?.map((genre) => <Link key={genre.id} href={`/genre/${genre.id}/${toSlug(genre.name)}`}><Badge variant="outline" className="border-white/12 text-white/70 hover:border-primary/40 hover:text-primary">{genre.name}</Badge></Link>)}</div>
              <p className="mt-6 line-clamp-5 text-sm leading-8 text-white/76 md:text-base">{detail.overview || "توضیح فارسی برای این عنوان در دسترس نیست."}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <TrailerDialog title={title} videos={videos} variant="default" />
                <WatchlistButton item={summary} />
                <ShareButton title={title} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space pt-4">
        <div className="page-container grid gap-8 lg:grid-cols-[1.45fr_0.8fr]">
          <div>
            <p className="text-xs font-bold text-primary">داستان و اطلاعات</p>
            <h2 className="mt-2 text-2xl font-black">درباره {title}</h2>
            <p className="mt-5 text-sm leading-8 text-white/72 md:text-base">{detail.overview || "هنوز خلاصه‌ای برای این عنوان ثبت نشده است."}</p>
            {directors.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2">
                {directors.slice(0, 8).map((person) => <Link key={`${person.id}-${person.job}`} href={`/person/${person.id}/${toSlug(person.name)}`} className="rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-white"><span className="text-white">{person.name}</span> · {person.job}</Link>)}
              </div>
            )}
          </div>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <InfoItem icon={<CalendarDays className="size-4" />} label={mediaType === "movie" ? "تاریخ انتشار" : "اولین پخش"} value={formatDate(date)} />
            <InfoItem icon={<Clock3 className="size-4" />} label="مدت" value={movie ? formatRuntime(movie.runtime) : formatRuntime(tv?.episode_run_time?.[0])} />
            <InfoItem icon={<Languages className="size-4" />} label="زبان اصلی" value={detail.original_language?.toUpperCase()} />
            <InfoItem icon={<MapPin className="size-4" />} label="کشور سازنده" value={detail.production_countries?.map((item) => item.name).join("، ")} />
          </dl>
        </div>
      </section>

      <CastRail cast={credits?.cast || []} />

      {tv?.seasons?.length ? (
        <section className="section-space" aria-labelledby="seasons-title">
          <div className="page-container"><h2 id="seasons-title" className="mb-5 text-2xl font-black">فصل‌ها</h2><div className="hide-scrollbar flex snap-x gap-4 overflow-x-auto pb-4">
            {tv.seasons.filter((season) => season.season_number > 0).map((season) => (
              <Link key={season.id} href={`/tv/${tv.id}/season/${season.season_number}`} className="focus-ring group w-40 shrink-0 snap-start rounded-lg md:w-48">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-card"><Image src={tmdbImage(season.poster_path, "w500")} alt={`پوستر ${season.name}`} fill sizes="192px" className="object-cover transition duration-300 group-hover:scale-[1.035]" /></div>
                <h3 className="mt-3 font-bold group-hover:text-primary">{season.name}</h3><p className="mt-1 text-xs text-muted-foreground">{formatNumber(season.episode_count)} قسمت</p>
              </Link>
            ))}
          </div></div>
        </section>
      ) : null}

      {detail.images?.backdrops?.length ? (
        <section className="section-space" aria-labelledby="gallery-title"><div className="page-container"><h2 id="gallery-title" className="mb-5 text-2xl font-black">گالری تصاویر</h2><ImageGallery images={detail.images.backdrops} title={title} /></div></section>
      ) : null}

      <section className="section-space"><div className="page-container grid gap-5">
        <ProviderList providers={regionProviders} mediaType={mediaType} tv={tv} />
        <section className="rounded-xl border border-white/8 bg-card p-5 md:p-6">
          <h2 className="text-xl font-black">اطلاعات تکمیلی</h2><Separator className="my-5" />
          <dl className="grid gap-4 sm:grid-cols-2">
            <InfoItem icon={<Building2 className="size-4" />} label="تولیدکنندگان" value={detail.production_companies?.slice(0, 4).map((item) => item.name).join("، ")} />
            <InfoItem icon={<UsersRound className="size-4" />} label="تعداد رأی" value={formatNumber(detail.vote_count || 0)} />
            <InfoItem icon={<CircleDollarSign className="size-4" />} label="بودجه" value={formatMoney(movie?.budget)} />
            <InfoItem icon={<CircleDollarSign className="size-4" />} label="فروش" value={formatMoney(movie?.revenue)} />
          </dl>
          {detail.homepage && <Button variant="outline" className="mt-5" asChild><a href={detail.homepage} target="_blank" rel="noreferrer"><Globe2 aria-hidden /> وب‌سایت رسمی</a></Button>}
        </section>
      </div></section>

      {recommendations.length > 0 && <MediaCarousel title="پیشنهادهای مرتبط" href={mediaType === "movie" ? "/movies" : "/tv"}>{recommendations.map((item) => <MediaCard key={`${item.mediaType}-${item.id}`} item={item} className="w-[42vw] snap-start sm:w-44 md:w-48 lg:w-52" />)}</MediaCarousel>}
      {similar.length > 0 && <MediaCarousel title={mediaType === "movie" ? "فیلم‌های مشابه" : "سریال‌های مشابه"} href={mediaType === "movie" ? "/movies" : "/tv"}>{similar.map((item) => <MediaCard key={`${item.mediaType}-${item.id}`} item={item} className="w-[42vw] snap-start sm:w-44 md:w-48 lg:w-52" />)}</MediaCarousel>}
      <CommentsSection mediaKey={`${mediaType}-${detail.id}`} />
    </>
  );
}
