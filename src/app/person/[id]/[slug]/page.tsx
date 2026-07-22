import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { MediaCard } from "@/components/media/media-card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { matchesRouteSlug, toSlug } from "@/lib/slug";
import { TmdbError } from "@/lib/tmdb/errors";
import { tmdbImage } from "@/lib/tmdb/image";
import { getPersonDetails } from "@/lib/tmdb/queries";
import { toMediaSummary } from "@/lib/tmdb/transformers";
import type { TmdbMediaItem } from "@/lib/tmdb/types";

async function getPerson(idValue: string) {
  const id = Number(idValue);
  if (!Number.isInteger(id) || id <= 0) notFound();
  try {
    return await getPersonDetails(id);
  } catch (error) {
    if (error instanceof TmdbError && error.code === "not-found") notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps<"/person/[id]/[slug]">): Promise<Metadata> {
  const { id } = await params;
  const person = await getPerson(id);
  return { title: person.name, description: person.biography?.slice(0, 155) || `آثار و اطلاعات ${person.name}` };
}

export default async function PersonPage({ params, searchParams }: PageProps<"/person/[id]/[slug]">) {
  const { id, slug } = await params;
  const query = await searchParams;
  const person = await getPerson(id);
  const canonicalSlug = toSlug(person.name);
  if (!matchesRouteSlug(slug, canonicalSlug)) permanentRedirect(`/person/${person.id}/${canonicalSlug}`);
  const type = typeof query.type === "string" ? query.type : "all";
  const department = typeof query.department === "string" ? query.department : "all";
  const year = typeof query.year === "string" ? query.year : "";
  const credits = [
    ...(person.combined_credits?.cast || []).map((item) => ({ ...item, roleDepartment: "Acting" })),
    ...(person.combined_credits?.crew || []).map((item) => ({ ...item, roleDepartment: item.department || item.job || "Crew" })),
  ];
  const deduped = new Map<string, TmdbMediaItem & { roleDepartment: string }>();
  credits.forEach((item) => {
    const mediaType = item.media_type === "tv" ? "tv" : "movie";
    const key = `${mediaType}-${item.id}`;
    if (!deduped.has(key)) deduped.set(key, item);
  });
  const filtered = [...deduped.values()]
    .filter((item) => type === "all" || item.media_type === type)
    .filter((item) => department === "all" || item.roleDepartment === department)
    .filter((item) => !year || (item.release_date || item.first_air_date || "").startsWith(year))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 60)
    .map((item) => toMediaSummary(item, item.media_type === "tv" ? "tv" : "movie"));

  return (
    <div className="page-container pb-12 pt-24 md:pt-32">
      <section className="grid gap-7 md:grid-cols-[260px_1fr] md:gap-10">
        <div className="relative aspect-[3/4] max-w-[260px] overflow-hidden rounded-xl bg-card poster-shadow"><Image src={tmdbImage(person.profile_path, "w780")} alt={`تصویر ${person.name}`} fill priority sizes="260px" className="object-cover" /></div>
        <div>
          <p className="text-xs font-bold text-primary">{person.known_for_department || "هنرمند"}</p>
          <h1 className="mt-2 text-4xl font-black md:text-5xl">{person.name}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {person.birthday && <span className="flex items-center gap-1.5"><CalendarDays className="size-4" /> {formatDate(person.birthday)}</span>}
            {person.place_of_birth && <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {person.place_of_birth}</span>}
          </div>
          <p className="mt-6 max-w-4xl whitespace-pre-line text-sm leading-8 text-white/70">{person.biography || "زندگی‌نامه‌ای برای این شخص ثبت نشده است."}</p>
        </div>
      </section>

      <section className="section-space" aria-labelledby="credits-title">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-bold text-primary">کارنامه</p><h2 id="credits-title" className="mt-2 text-2xl font-black">آثار {person.name}</h2></div>
          <form method="get" className="flex flex-wrap gap-2">
            <select name="type" defaultValue={type} className="h-10 rounded-md border border-input bg-[#171c27] px-3 text-sm"><option value="all">فیلم و سریال</option><option value="movie">فیلم</option><option value="tv">سریال</option></select>
            <select name="department" defaultValue={department} className="h-10 rounded-md border border-input bg-[#171c27] px-3 text-sm"><option value="all">همه نقش‌ها</option><option value="Acting">بازیگری</option><option value="Directing">کارگردانی</option><option value="Writing">نویسندگی</option><option value="Production">تهیه‌کنندگی</option></select>
            <input name="year" defaultValue={year} inputMode="numeric" placeholder="سال" className="h-10 w-24 rounded-md border border-input bg-[#171c27] px-3 text-sm outline-none focus:border-primary" />
            <Button type="submit">اعمال</Button>
            <Button type="button" variant="outline" asChild><Link href={`/person/${person.id}/${canonicalSlug}`}>پاک‌کردن</Link></Button>
          </form>
        </div>
        {filtered.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">{filtered.map((item) => <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />)}</div> : <div className="rounded-xl border border-dashed border-white/10 py-14 text-center text-sm text-muted-foreground"><UserRound className="mx-auto mb-3" />اثری با این فیلتر پیدا نشد.</div>}
      </section>
    </div>
  );
}
