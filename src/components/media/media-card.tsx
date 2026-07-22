import Image from "next/image";
import Link from "next/link";
import { Film, Star, Tv } from "lucide-react";
import { WatchlistButton } from "@/components/media/watchlist-button";
import { Badge } from "@/components/ui/badge";
import { formatRating, getYear } from "@/lib/format";
import { mediaHref } from "@/lib/slug";
import { tmdbImage } from "@/lib/tmdb/image";
import type { MediaSummary } from "@/lib/tmdb/types";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  item: MediaSummary;
  layout?: "poster" | "landscape";
  className?: string;
  priority?: boolean;
  minimal?: boolean;
}

export function MediaCard({
  item,
  layout = "poster",
  className,
  priority,
  minimal,
}: MediaCardProps) {
  const landscape = layout === "landscape";
  const href = mediaHref(item.mediaType, item.id, item.title);
  const imagePath = landscape ? item.backdropPath || item.posterPath : item.posterPath;

  return (
    <article className={cn("group relative min-w-0", className)}>
      <Link href={href} className="focus-ring block rounded-lg" aria-label={`مشاهده جزئیات ${item.title}`}>
        <div
          className={cn(
            "poster-shadow relative overflow-hidden rounded-lg bg-surface",
            landscape ? "aspect-[16/10]" : "aspect-[2/3]",
          )}
        >
          <Image
            src={tmdbImage(imagePath, landscape ? "w780" : "w500")}
            alt={`پوستر ${item.title}`}
            fill
            priority={priority}
            sizes={
              landscape
                ? "(max-width: 768px) 78vw, (max-width: 1280px) 33vw, 22vw"
                : "(max-width: 480px) 42vw, (max-width: 1024px) 24vw, 14vw"
            }
            className="object-cover transition duration-300 ease-out group-hover:scale-[1.035] group-focus-within:scale-[1.035]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 opacity-70 transition group-hover:opacity-100" />
          <div className={cn("absolute flex items-end gap-2", minimal ? "end-2 top-2" : "inset-x-2 bottom-2 justify-between")}>
            {item.rating > 0 ? (
              <Badge className="gap-1 border-0 bg-black/65 text-[11px] text-white backdrop-blur-md">
                <Star className="size-3 fill-[#f6c945] text-[#f6c945]" aria-hidden />
                <span dir="ltr">{formatRating(item.rating)}</span>
                <span className="text-[9px] text-white/70">{item.ratingSource === "imdb" ? "IMDb" : "TMDB"}</span>
              </Badge>
            ) : <span />}
            <Badge variant="secondary" className={cn("gap-1 border-0 bg-black/60 text-[10px] text-white backdrop-blur-md", minimal ? "hidden" : "hidden sm:inline-flex")}>
              {item.mediaType === "movie" ? <Film aria-hidden /> : <Tv aria-hidden />}
              {item.mediaType === "movie" ? "فیلم" : "سریال"}
            </Badge>
          </div>
          {item.adult && (
            <Badge className="absolute start-2 top-2 border-0 bg-destructive/90 text-[10px] text-white">+۱۸</Badge>
          )}
          {item.imdbRank && (
            <Badge className="absolute start-2 top-2 border-0 bg-primary/95 text-[10px] text-primary-foreground">رتبه IMDb: {item.imdbRank}</Badge>
          )}
          {minimal && (
            <h3 className="absolute inset-x-2 bottom-2 truncate text-sm font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.9)]">
              {item.title}
            </h3>
          )}
        </div>
        {!minimal && (
          <div className="pt-3">
            <h3 className="truncate text-sm font-semibold text-white transition-colors group-hover:text-primary">{item.title}</h3>
            <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
              {getYear(item.date) && <span>{getYear(item.date)}</span>}
            </div>
          </div>
        )}
      </Link>
      <WatchlistButton
        item={item}
        compact
        className="absolute end-2 top-2 z-10 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
      />
    </article>
  );
}
