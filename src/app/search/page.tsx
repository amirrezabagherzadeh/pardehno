import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SearchX, UserRound } from "lucide-react";
import { MediaCard } from "@/components/media/media-card";
import { formatNumber } from "@/lib/format";
import { toSlug } from "@/lib/slug";
import { tmdbImage } from "@/lib/tmdb/image";
import { searchMulti } from "@/lib/tmdb/queries";

export const metadata: Metadata = { title: "جستجو", description: "جستجوی فیلم، سریال و بازیگر در پرده‌نو" };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const type = typeof params.type === "string" ? params.type : "all";
  const page = Math.max(1, Number(typeof params.page === "string" ? params.page : "1") || 1);
  const data = query.length >= 2 ? await searchMulti(query, page) : { page: 1, results: [], total_pages: 0, total_results: 0 };
  const media = data.results.filter((item) => item.kind === "media" && (type === "all" || item.mediaType === type));
  const people = data.results.filter((item) => item.kind === "person" && (type === "all" || type === "person"));
  return (
    <div className="page-container min-h-[70vh] pb-12 pt-24 md:pt-28">
      <header className="mb-8">
        <p className="text-xs font-bold text-primary">جستجو در TMDB</p>
        <h1 className="mt-2 text-3xl font-black md:text-4xl">{query ? `نتایج «${query}»` : "جستجوی فیلم، سریال و بازیگر"}</h1>
        {query && <p className="mt-3 text-sm text-muted-foreground">{formatNumber(data.total_results)} نتیجه پیدا شد</p>}
      </header>
      <form method="get" className="mb-7 flex max-w-2xl gap-2"><input name="q" defaultValue={query} minLength={2} required placeholder="چه چیزی را جستجو می‌کنید؟" className="h-12 min-w-0 flex-1 rounded-lg border border-input bg-card px-4 outline-none focus:border-primary" /><button className="rounded-lg bg-primary px-5 font-bold text-primary-foreground">جستجو</button></form>
      {query && <nav className="mb-8 flex flex-wrap gap-2" aria-label="نوع نتیجه">{[["all", "همه"], ["movie", "فیلم"], ["tv", "سریال"], ["person", "افراد"]].map(([value, label]) => <Link key={value} href={`/search?q=${encodeURIComponent(query)}&type=${value}`} className={`rounded-full border px-4 py-2 text-sm ${type === value ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-muted-foreground hover:text-white"}`}>{label}</Link>)}</nav>}
      {media.length > 0 && <section aria-labelledby="media-results"><h2 id="media-results" className="mb-5 text-xl font-black">فیلم و سریال</h2><div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">{media.map((item) => item.kind === "media" ? <MediaCard key={`${item.mediaType}-${item.id}`} item={item} /> : null)}</div></section>}
      {people.length > 0 && <section className="section-space" aria-labelledby="people-results"><h2 id="people-results" className="mb-5 text-xl font-black">بازیگران و عوامل</h2><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">{people.map((item) => item.kind === "person" ? <Link key={item.id} href={`/person/${item.id}/${toSlug(item.name)}`} className="focus-ring group rounded-lg"><div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-card"><Image src={tmdbImage(item.profilePath, "w500")} alt={`تصویر ${item.name}`} fill sizes="180px" className="object-cover transition group-hover:scale-[1.03]" /></div><h3 className="mt-2 truncate font-bold group-hover:text-primary">{item.name}</h3><p className="mt-1 truncate text-xs text-muted-foreground">{item.knownFor.join("، ") || item.department}</p></Link> : null)}</div></section>}
      {query.length >= 2 && !media.length && !people.length && <div className="rounded-xl border border-dashed border-white/10 py-16 text-center text-muted-foreground"><SearchX className="mx-auto mb-4 size-10" /><p>نتیجه‌ای برای «{query}» پیدا نشد.</p></div>}
      {!query && <div className="rounded-xl border border-dashed border-white/10 py-16 text-center text-muted-foreground"><UserRound className="mx-auto mb-4 size-10" /><p>نام یک فیلم، سریال یا بازیگر را وارد کنید.</p></div>}
    </div>
  );
}
