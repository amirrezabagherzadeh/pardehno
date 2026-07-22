"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Filter, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import type { MediaType, TmdbGenre } from "@/lib/tmdb/types";
import { cn } from "@/lib/utils";

export interface BrowseFilterValues {
  genre?: string;
  sort?: string;
  year?: string;
  language?: string;
  country?: string;
  age?: string;
  quality?: string;
}

const languages = [
  ["fa", "فارسی"],
  ["en", "انگلیسی"],
  ["ko", "کره‌ای"],
  ["ja", "ژاپنی"],
  ["fr", "فرانسوی"],
  ["es", "اسپانیایی"],
  ["de", "آلمانی"],
  ["tr", "ترکی"],
  ["hi", "هندی"],
] as const;

const countries = [
  ["IR", "ایران"],
  ["US", "آمریکا"],
  ["KR", "کره جنوبی"],
  ["JP", "ژاپن"],
  ["IN", "هند"],
  ["TR", "ترکیه"],
  ["GB", "بریتانیا"],
  ["FR", "فرانسه"],
] as const;

const filterControlClass =
  "h-14 w-full appearance-none rounded-xl border border-white/10 bg-[#242424] px-4 pe-9 text-sm font-semibold text-white outline-none transition hover:border-white/20 focus:border-[#d5a924] focus:ring-2 focus:ring-[#d5a924]/15";

type SelectOption = { value: string; label: string };

function FilterSelect({ label, name, defaultValue, options, active }: {
  label: string;
  name: string;
  defaultValue?: string;
  options: SelectOption[];
  active?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue || "");
  const selected = options.find((option) => option.value === value) || options[0];

  return (
    <div className="relative min-w-0">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(filterControlClass, "relative text-right", active && "border-[#d5a924] text-[#f6d45f]")}
      >
        {selected.label}
        <ChevronDown className={cn("pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-white/70 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div role="listbox" aria-label={label} className="absolute inset-x-0 top-[calc(100%+0.4rem)] z-30 max-h-64 overflow-y-auto rounded-xl border border-white/15 bg-[#242424] p-1.5 shadow-2xl">
          {options.map((option) => (
            <button
              key={option.value || "all"}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => { setValue(option.value); setOpen(false); }}
              className={cn("block w-full rounded-lg px-3 py-2.5 text-right text-sm font-semibold text-white transition hover:bg-white/12", option.value === value && "bg-primary/20 text-primary")}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SortSelect({ mediaType, value }: { mediaType: MediaType; value?: string }) {
  return (
    <label className="relative block">
      <span className="sr-only">مرتب‌سازی</span>
      <select
        name="sort"
        defaultValue={value || "popularity.desc"}
        className="h-12 min-w-40 appearance-none rounded-xl border border-transparent bg-[#262626] px-4 pe-10 text-sm font-bold text-white outline-none transition hover:bg-[#303030] focus:border-white/25"
      >
        <option value="popularity.desc">مرتب‌سازی</option>
        <option value="vote_average.desc">بالاترین امتیاز</option>
        <option value={mediaType === "movie" ? "primary_release_date.desc" : "first_air_date.desc"}>تازه‌ترین</option>
        <option value="vote_count.desc">بیشترین رأی</option>
        {mediaType === "movie" && <option value="revenue.desc">پرفروش‌ترین</option>}
      </select>
      <ChevronDown className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-white/60" aria-hidden />
    </label>
  );
}

function FilterFields({
  genres,
  values,
  mediaType,
  mobile,
}: {
  genres: TmdbGenre[];
  values: BrowseFilterValues;
  mediaType: MediaType;
  mobile?: boolean;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1979 }, (_, index) => currentYear - index);

  return (
    <div className={cn("grid gap-3", mobile ? "grid-cols-1" : "md:grid-cols-4 xl:grid-cols-8")}>
      <FilterSelect key={`media-${mediaType}`} label="فیلم و سریال" name="media" defaultValue={mediaType} options={[{ value: "movie", label: "فیلم" }, { value: "tv", label: "سریال" }]} />
      <FilterSelect key={`language-${values.language || "all"}`} label="زبان فیلم" name="language" defaultValue={values.language} active={Boolean(values.language)} options={[{ value: "", label: "زبان فیلم: همه" }, ...languages.map(([value, label]) => ({ value, label }))]} />
      <FilterSelect key={`age-${values.age || "all"}`} label="رده سنی" name="age" defaultValue={values.age} active={Boolean(values.age)} options={[{ value: "", label: "رده سنی: همه" }, { value: "family", label: "مناسب خانواده" }]} />
      <FilterSelect key={`country-${values.country || "all"}`} label="کشور سازنده" name="country" defaultValue={values.country} active={Boolean(values.country)} options={[{ value: "", label: "کشور سازنده: همه" }, ...countries.map(([value, label]) => ({ value, label }))]} />
      <FilterSelect key={`genre-${values.genre || "all"}`} label="ژانر" name="genre" defaultValue={values.genre} active={Boolean(values.genre)} options={[{ value: "", label: "ژانر: همه" }, ...genres.map((genre) => ({ value: String(genre.id), label: genre.name }))]} />
      <FilterSelect key={`year-${values.year || "all"}`} label="سال تولید" name="year" defaultValue={values.year} active={Boolean(values.year)} options={[{ value: "", label: "سال تولید: همه" }, ...years.map((year) => ({ value: String(year), label: String(year) }))]} />
      <label className="flex h-14 items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#242424] px-4 text-sm font-semibold text-white">
        <span>فقط HD</span>
        <Switch name="quality" value="hd" defaultChecked={values.quality === "hd"} aria-label="فقط عنوان‌های دارای تصویر باکیفیت" />
      </label>
      <Button
        type="submit"
        className="h-14 rounded-xl bg-[#f4f4f4] font-black text-[#121212] hover:bg-white"
      >
        اعمال فیلتر
      </Button>
    </div>
  );
}

function FilterForm({
  genres,
  values,
  mediaType,
  children,
  mobile,
  onSubmitted,
}: {
  genres: TmdbGenre[];
  values: BrowseFilterValues;
  mediaType: MediaType;
  children?: ReactNode;
  mobile?: boolean;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const selectedType = formData.get("media") === "movie" ? "movie" : "tv";
    const search = new URLSearchParams();
    ["genre", "year", "language", "country", "age", "quality"].forEach((key) => {
      const value = formData.get(key);
      if (typeof value === "string" && value) search.set(key, value);
    });
    const selectedSort = formData.get("sort");
    const sort = selectedType === mediaType && typeof selectedSort === "string"
      ? selectedSort
      : "popularity.desc";
    if (sort !== "popularity.desc") search.set("sort", sort);
    const pathname = selectedType === "movie" ? "/movies" : "/tv";
    const query = search.toString();
    onSubmitted?.();
    startTransition(() => router.push(query ? `${pathname}?${query}` : pathname));
  }

  return (
    <form onSubmit={submit} className={cn(pending && "pointer-events-none opacity-65")}>
      {children}
      {mobile && (
        <>
          <div className="mb-3"><SortSelect mediaType={mediaType} value={values.sort} /></div>
          <FilterFields genres={genres} values={values} mediaType={mediaType} mobile />
        </>
      )}
    </form>
  );
}

function filterHref(mediaType: MediaType, values: BrowseFilterValues, omitted: keyof BrowseFilterValues) {
  const search = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (key !== omitted && value && !(key === "sort" && value === "popularity.desc")) search.set(key, value);
  });
  const pathname = mediaType === "movie" ? "/movies" : "/tv";
  return search.size ? `${pathname}?${search}` : pathname;
}

export function BrowseFilters({
  genres,
  values,
  mediaType,
}: {
  genres: TmdbGenre[];
  values: BrowseFilterValues;
  mediaType: MediaType;
}) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = [values.genre, values.year, values.language, values.country, values.age, values.quality].filter(Boolean).length;
  const genreName = genres.find((genre) => String(genre.id) === values.genre)?.name;
  const activeChips: Array<{ key: keyof BrowseFilterValues; label: string }> = [];
  if (values.country) activeChips.push({ key: "country", label: countries.find(([value]) => value === values.country)?.[1] || values.country });
  if (values.genre) activeChips.push({ key: "genre", label: genreName || "ژانر" });
  if (values.language) activeChips.push({ key: "language", label: languages.find(([value]) => value === values.language)?.[1] || values.language });
  if (values.year) activeChips.push({ key: "year", label: values.year });
  if (values.age) activeChips.push({ key: "age", label: "مناسب خانواده" });
  if (values.quality) activeChips.push({ key: "quality", label: "تصویر HD" });
  const heading = values.country === "IR"
    ? mediaType === "movie" ? "فیلم‌های ایرانی" : "سریال‌های ایرانی"
    : mediaType === "movie" ? "همه فیلم‌ها" : "همه سریال‌ها";

  return (
    <section className="mb-10" aria-labelledby="browse-filter-heading">
      <FilterForm genres={genres} values={values} mediaType={mediaType}>
        <div className="hidden min-h-20 items-center justify-between gap-6 border-b border-white/10 pb-5 md:flex">
          <h2 id="browse-filter-heading" className="text-xl font-black md:text-2xl">{heading}</h2>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <SortSelect mediaType={mediaType} value={values.sort} />
            <span className="h-9 w-px bg-white/10" aria-hidden />
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              className={cn(
                "relative flex h-12 items-center gap-2 rounded-xl border px-5 text-sm font-black transition",
                open ? "border-dashed border-white/45 bg-[#202020]" : "border-white/10 bg-[#262626] hover:bg-[#303030]",
              )}
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              فیلتر
              {active > 0 && <span className="absolute -end-2 -top-2 grid size-6 place-items-center rounded-full bg-white text-xs text-black">{active}</span>}
            </button>
            {activeChips.slice(0, 3).map((chip) => (
              <Link key={chip.key} href={filterHref(mediaType, values, chip.key)} className="flex h-12 items-center gap-2 rounded-xl border border-white/25 px-4 text-sm font-bold hover:border-white/45">
                <X className="size-4" aria-hidden />
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
        {open && (
          <div className="mt-8 hidden rounded-[20px] bg-[#202020] p-4 shadow-[0_18px_60px_rgba(0,0,0,.2)] md:block">
            <FilterFields genres={genres} values={values} mediaType={mediaType} />
          </div>
        )}
      </FilterForm>

      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-5 md:hidden">
        <h2 id="browse-filter-heading-mobile" className="text-xl font-black">{heading}</h2>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative h-11 rounded-xl bg-[#202020]">
              <Filter aria-hidden /> فیلتر
              {active > 0 && <span className="absolute -end-2 -top-2 grid size-5 place-items-center rounded-full bg-white text-[10px] text-black">{active}</span>}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[94vw] overflow-y-auto border-white/10 bg-[#141414] sm:max-w-md">
            <SheetHeader>
              <SheetTitle>فیلتر فیلم و سریال</SheetTitle>
              <SheetDescription>نوع محتوا، زبان، کشور، ژانر و سال تولید را انتخاب کنید.</SheetDescription>
            </SheetHeader>
            <div className="p-4">
              <FilterForm genres={genres} values={values} mediaType={mediaType} mobile onSubmitted={() => setMobileOpen(false)} />
              {active > 0 && (
                <Button variant="ghost" className="mt-4 w-full" asChild>
                  <Link href={mediaType === "movie" ? "/movies" : "/tv"}><RotateCcw aria-hidden /> پاک‌کردن همه فیلترها</Link>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </section>
  );
}
