"use client";

import { useEffect } from "react";
import { recentStore } from "@/lib/storage/media-store";
import type { MediaSummary } from "@/lib/tmdb/types";

export function RecentViewTracker({ item }: { item: MediaSummary }) {
  useEffect(() => {
    recentStore.push(item);
  }, [item]);
  return null;
}
