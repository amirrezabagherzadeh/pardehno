"use client";

import Image from "next/image";
import { Expand } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { tmdbImage } from "@/lib/tmdb/image";
import type { TmdbImageAsset } from "@/lib/tmdb/types";

export function ImageGallery({ images, title }: { images: TmdbImageAsset[]; title: string }) {
  const [selected, setSelected] = useState<TmdbImageAsset | null>(null);
  if (!images.length) return null;
  return (
    <>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {images.slice(0, 8).map((image, index) => (
          <button
            key={image.file_path}
            type="button"
            onClick={() => setSelected(image)}
            className={`focus-ring group relative overflow-hidden rounded-lg bg-card ${index === 0 ? "col-span-2 row-span-2" : "aspect-video"}`}
            aria-label={`نمایش تصویر ${index + 1} از ${title}`}
          >
            <Image src={tmdbImage(image.file_path, "w780")} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition duration-300 group-hover:scale-[1.03]" />
            <span className="absolute end-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/55 opacity-0 backdrop-blur transition group-hover:opacity-100"><Expand className="size-4" aria-hidden /></span>
          </button>
        ))}
      </div>
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="h-[85vh] max-w-6xl overflow-hidden border-white/10 bg-black p-0">
          <DialogTitle className="sr-only">تصویر {title}</DialogTitle>
          {selected && <div className="relative h-full w-full"><Image src={tmdbImage(selected.file_path, "original")} alt={`تصویر ${title}`} fill sizes="100vw" className="object-contain" /></div>}
        </DialogContent>
      </Dialog>
    </>
  );
}
