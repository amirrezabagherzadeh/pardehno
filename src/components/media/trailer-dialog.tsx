"use client";

import { LoaderCircle, Play, VideoOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { rankVideos } from "@/lib/tmdb/transformers";
import type { MediaType, TmdbVideo } from "@/lib/tmdb/types";

interface TrailerDialogProps {
  title: string;
  videos?: TmdbVideo[];
  mediaType?: MediaType;
  mediaId?: number;
  variant?: "default" | "secondary" | "outline";
}

export function TrailerDialog({
  title,
  videos,
  mediaType,
  mediaId,
  variant = "secondary",
}: TrailerDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState<TmdbVideo[]>(videos || []);
  const [attempted, setAttempted] = useState(Boolean(videos));
  const ranked = rankVideos({ results: loadedVideos });
  const primary = ranked[0];

  async function loadAndOpen() {
    setOpen(true);
    if (attempted || !mediaType || !mediaId) return;
    setAttempted(true);
    setLoading(true);
    try {
      const response = await fetch(`/api/media/${mediaType}/${mediaId}/videos`);
      const data = (await response.json()) as { results?: TmdbVideo[] };
      setLoadedVideos(data.results || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" variant={variant} onClick={loadAndOpen}>
        <Play className="fill-current" aria-hidden />
        تماشای تریلر
      </Button>
      <DialogContent className="max-w-5xl overflow-hidden border-white/10 bg-[#0b0d12] p-0">
        <DialogHeader className="px-5 pt-5 text-right">
          <DialogTitle>تریلر {title}</DialogTitle>
          <DialogDescription>ویدئو از کانال‌های عمومی یوتیوب پخش می‌شود.</DialogDescription>
        </DialogHeader>
        <div className="aspect-video w-full bg-black">
          {loading ? (
            <div className="flex h-full items-center justify-center gap-3 text-muted-foreground">
              <LoaderCircle className="animate-spin" aria-hidden />
              در حال دریافت تریلر…
            </div>
          ) : primary ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${primary.key}?autoplay=1&rel=0`}
              title={`تریلر ${title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-5 text-center text-muted-foreground">
              <VideoOff className="size-10" aria-hidden />
              <p>برای این عنوان تریلر عمومی در دسترس نیست.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
