"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useWatchlist, watchlistStore } from "@/lib/storage/media-store";
import type { MediaSummary } from "@/lib/tmdb/types";

interface WatchlistButtonProps {
  item: MediaSummary;
  compact?: boolean;
  className?: string;
}

export function WatchlistButton({ item, compact, className }: WatchlistButtonProps) {
  const items = useWatchlist();
  const active = items.some(
    (stored) => stored.id === item.id && stored.mediaType === item.mediaType,
  );
  const label = active ? "حذف از فهرست من" : "افزودن به فهرست من";

  const button = (
    <Button
      type="button"
      variant={compact ? "secondary" : active ? "secondary" : "outline"}
      size={compact ? "icon-sm" : "default"}
      className={cn(
        compact && "border border-white/10 bg-black/55 text-white backdrop-blur-md hover:bg-primary hover:text-primary-foreground",
        className,
      )}
      aria-label={label}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        watchlistStore.toggle(item);
      }}
    >
      {active ? <BookmarkCheck aria-hidden /> : <Bookmark aria-hidden />}
      {!compact && <span>{label}</span>}
    </Button>
  );

  if (!compact) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
