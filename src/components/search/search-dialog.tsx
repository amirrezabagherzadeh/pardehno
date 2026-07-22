"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Clock3, Film, LoaderCircle, Search, Trash2, Tv, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getYear } from "@/lib/format";
import { mediaHref } from "@/lib/slug";
import { tmdbImage } from "@/lib/tmdb/image";
import type { SearchSummary } from "@/lib/tmdb/types";

const RECENT_SEARCHES_KEY = "pardehno:v1:searches";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function readRecentSearches() {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string").slice(0, 10)
      : [];
  } catch {
    return [];
  }
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (open) queueMicrotask(() => setRecent(readRecentSearches()));
  }, [open]);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) {
      queueMicrotask(() => {
        setResults([]);
        setLoading(false);
        setError("");
      });
      return;
    }
    const controller = new AbortController();
    queueMicrotask(() => {
      setLoading(true);
      setError("");
    });
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(normalized)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("search-failed");
        const data = (await response.json()) as { results?: SearchSummary[] };
        setResults(data.results || []);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError("جستجو انجام نشد. دوباره تلاش کنید.");
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const grouped = useMemo(
    () => ({
      media: results.filter((item) => item.kind === "media"),
      people: results.filter((item) => item.kind === "person"),
    }),
    [results],
  );

  function saveQuery(value: string) {
    const normalized = value.trim();
    if (!normalized) return;
    const next = [normalized, ...recent.filter((item) => item !== normalized)].slice(0, 10);
    setRecent(next);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  }

  function navigate(item: SearchSummary) {
    saveQuery(query);
    onOpenChange(false);
    if (item.kind === "person") router.push(`/person/${item.id}/${encodeURIComponent(item.name)}`);
    else router.push(mediaHref(item.mediaType, item.id, item.title));
  }

  function openSearchPage(value = query) {
    const normalized = value.trim();
    if (normalized.length < 2) return;
    saveQuery(normalized);
    onOpenChange(false);
    router.push(`/search?q=${encodeURIComponent(normalized)}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12vh] max-w-2xl translate-y-0 overflow-hidden border-white/10 bg-[#11151f] p-0 sm:top-[16vh]">
        <DialogHeader className="sr-only">
          <DialogTitle>جستجو در پرده‌نو</DialogTitle>
          <DialogDescription>جستجوی فیلم، سریال و بازیگر</DialogDescription>
        </DialogHeader>
        <Command shouldFilter={false} className="rounded-none bg-transparent p-0">
          <div className="border-b border-white/10 p-3">
            <CommandInput
              autoFocus
              value={query}
              onValueChange={setQuery}
              onKeyDown={(event) => {
                if (event.key === "Enter" && results.length === 0) openSearchPage();
              }}
              placeholder="نام فیلم، سریال یا بازیگر…"
              className="h-11 text-base"
              aria-label="عبارت جستجو"
            />
          </div>
          <CommandList className="max-h-[65vh] p-2">
            <div className="sr-only" aria-live="polite">
              {loading ? "در حال جستجو" : `${results.length} نتیجه پیدا شد`}
            </div>
            {loading && (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <LoaderCircle className="animate-spin" aria-hidden />
                در حال جستجو…
              </div>
            )}
            {error && <p className="px-3 py-8 text-center text-sm text-destructive">{error}</p>}
            {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
              <CommandEmpty>نتیجه‌ای پیدا نشد.</CommandEmpty>
            )}
            {!query && recent.length > 0 && (
              <CommandGroup heading="جستجوهای اخیر">
                {recent.map((item) => (
                  <CommandItem
                    key={item}
                    value={`recent-${item}`}
                    onSelect={() => {
                      setQuery(item);
                      openSearchPage(item);
                    }}
                  >
                    <Clock3 className="text-muted-foreground" aria-hidden />
                    <span>{item}</span>
                  </CommandItem>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-muted-foreground"
                  onClick={() => {
                    localStorage.removeItem(RECENT_SEARCHES_KEY);
                    setRecent([]);
                  }}
                >
                  <Trash2 aria-hidden /> پاک‌کردن تاریخچه
                </Button>
              </CommandGroup>
            )}
            {grouped.media.length > 0 && (
              <CommandGroup heading="فیلم و سریال">
                {grouped.media.slice(0, 8).map((item) =>
                  item.kind === "media" ? (
                    <CommandItem
                      key={`${item.mediaType}-${item.id}`}
                      value={`${item.mediaType}-${item.id}`}
                      className="gap-3 py-2.5"
                      onSelect={() => navigate(item)}
                    >
                      <Image
                        src={tmdbImage(item.posterPath, "w92")}
                        alt=""
                        width={42}
                        height={62}
                        className="h-[62px] w-[42px] rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          {item.mediaType === "movie" ? <Film aria-hidden /> : <Tv aria-hidden />}
                          {item.mediaType === "movie" ? "فیلم" : "سریال"}
                          {getYear(item.date) && <span>· {getYear(item.date)}</span>}
                        </p>
                      </div>
                    </CommandItem>
                  ) : null,
                )}
              </CommandGroup>
            )}
            {grouped.people.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="بازیگران و عوامل">
                  {grouped.people.slice(0, 5).map((item) =>
                    item.kind === "person" ? (
                      <CommandItem
                        key={`person-${item.id}`}
                        value={`person-${item.id}`}
                        className="gap-3 py-2.5"
                        onSelect={() => navigate(item)}
                      >
                        <Image
                          src={tmdbImage(item.profilePath, "w92")}
                          alt=""
                          width={48}
                          height={48}
                          className="size-12 rounded-full object-cover"
                        />
                        <UserRound className="sr-only" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.knownFor.join("، ") || item.department}
                          </p>
                        </div>
                      </CommandItem>
                    ) : null,
                  )}
                </CommandGroup>
              </>
            )}
          </CommandList>
          {query.trim().length >= 2 && (
            <button
              type="button"
              onClick={() => openSearchPage()}
              className="focus-ring flex min-h-12 items-center justify-center gap-2 border-t border-white/10 bg-white/[0.03] px-4 text-sm text-primary transition hover:bg-white/[0.07]"
            >
              <Search aria-hidden /> مشاهده همه نتایج برای «{query.trim()}»
            </button>
          )}
        </Command>
      </DialogContent>
    </Dialog>
  );
}
