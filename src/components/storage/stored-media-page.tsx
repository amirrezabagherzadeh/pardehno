"use client";

import Link from "next/link";
import { BookmarkX, History, LibraryBig } from "lucide-react";
import { MediaCard } from "@/components/media/media-card";
import { Button } from "@/components/ui/button";
import { useRecentlyViewed, useWatchlist } from "@/lib/storage/media-store";

export function StoredMediaPage({ kind }: { kind: "watchlist" | "recent" }) {
  const watchlist = useWatchlist();
  const recent = useRecentlyViewed();
  const items = kind === "watchlist" ? watchlist : recent;
  const title = kind === "watchlist" ? "فهرست من" : "اخیراً مشاهده‌شده";
  return (
    <div className="page-container min-h-[70vh] pb-12 pt-24 md:pt-28">
      <header className="mb-8 max-w-3xl">
        <p className="text-xs font-bold text-primary">ذخیره‌شده در همین مرورگر</p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-black md:text-4xl">{kind === "watchlist" ? <LibraryBig aria-hidden /> : <History aria-hidden />}{title}</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          این داده‌ها محلی‌اند؛ با پاک‌کردن اطلاعات مرورگر حذف می‌شوند و بین دستگاه‌ها همگام نیستند.
        </p>
      </header>
      {items.length ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item, index) => <MediaCard key={`${item.mediaType}-${item.id}`} item={item} priority={index === 0} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 px-5 py-16 text-center">
          <BookmarkX className="mb-4 size-12 text-muted-foreground" aria-hidden />
          <h2 className="font-bold">{kind === "watchlist" ? "هنوز عنوانی ذخیره نکرده‌اید" : "هنوز چیزی ندیده‌اید"}</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">با انتخاب نشانک روی کارت‌ها، عنوان‌های مورد علاقه‌تان را برای بعد نگه دارید.</p>
          <Button className="mt-6" asChild><Link href="/movies">کشف فیلم‌ها</Link></Button>
        </div>
      )}
    </div>
  );
}
