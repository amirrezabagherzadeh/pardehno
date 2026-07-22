"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MediaCard } from "@/components/media/media-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MediaSummary, MediaType } from "@/lib/tmdb/types";

interface InfiniteMediaGridProps {
  initialItems: MediaSummary[];
  initialPage: number;
  totalPages: number;
  mediaType: MediaType;
  filters: {
    genre?: string;
    sort?: string;
    year?: string;
    language?: string;
    country?: string;
    age?: string;
    quality?: string;
  };
}

interface DiscoverResponse {
  results: MediaSummary[];
  page: number;
  total_pages: number;
  error?: string;
}

function Loader() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-x-4 gap-y-8 min-[480px]:grid-cols-2 md:grid-cols-4 xl:grid-cols-5" aria-label="در حال بارگذاری">
      {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="aspect-[16/10] rounded-lg bg-white/5" />)}
    </div>
  );
}

export function InfiniteMediaGrid({ initialItems, initialPage, totalPages, mediaType, filters }: InfiniteMediaGridProps) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(initialPage);
  const [lastPage, setLastPage] = useState(totalPages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const hasMore = page < lastPage;

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ media: mediaType, page: String(page + 1) });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const response = await fetch(`/api/discover?${params}`, { cache: "no-store" });
      const data = await response.json() as DiscoverResponse;
      if (!response.ok) throw new Error(data.error || "دریافت عنوانهای بیشتر ناموفق بود.");

      const known = new Set(items.map((item) => `${item.mediaType}-${item.id}`));
      const newItems = data.results.filter((item) => !known.has(`${item.mediaType}-${item.id}`));
      setItems((current) => [...current, ...newItems]);
      setPage(Math.max(page + 1, data.page));
      setLastPage(newItems.length ? data.total_pages : page);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "دریافت عنوانهای بیشتر ناموفق بود.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [filters, hasMore, items, mediaType, page]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target || !hasMore || loading || error) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void loadMore();
    }, { rootMargin: "600px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [error, hasMore, loadMore, loading]);

  return (
    <>
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 min-[480px]:grid-cols-2 md:grid-cols-4 xl:grid-cols-5">
        {items.map((item, index) => <MediaCard key={`${item.mediaType}-${item.id}`} item={item} layout="landscape" priority={index < 5} />)}
      </div>
      {loading && <Loader />}
      {error && <div className="mt-8 flex flex-wrap items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground"><span>{error}</span><button type="button" onClick={() => void loadMore()} className="font-bold text-primary hover:underline">تلاش دوباره</button></div>}
      {hasMore && <div ref={targetRef} className="h-px" aria-hidden />}
      {!hasMore && items.length > 0 && <p className="mt-10 text-center text-sm text-muted-foreground">همهٔ عنوان‌های این فیلتر نمایش داده شد.</p>}
    </>
  );
}
