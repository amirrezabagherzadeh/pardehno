"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { mediaHref } from "@/lib/slug";
import { tmdbImage } from "@/lib/tmdb/image";
import type { MediaSummary } from "@/lib/tmdb/types";

const SLIDE_INTERVAL = 5000;

export function HeroBanner({ items }: { items: MediaSummary[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const count = items.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % count), SLIDE_INTERVAL);
    return () => window.clearInterval(timer);
  }, [count]);

  if (!count) return null;
  const item = items[activeIndex] || items[0];
  const move = (direction: number) => setActiveIndex((index) => (index + direction + count) % count);

  return (
    <section className="relative min-h-[570px] overflow-hidden md:min-h-[650px] lg:h-[76vh] lg:max-h-[820px]" aria-labelledby="hero-title">
      {items.map((slide, index) => (
        <Image
          key={`${slide.mediaType}-${slide.id}`}
          src={tmdbImage(slide.backdropPath || slide.posterPath, "original")}
          alt=""
          fill
          priority={index === 0}
          sizes="100vw"
          className={`object-cover object-[center_15%] transition-opacity duration-700 ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="cinematic-scrim absolute inset-0" />
      <div className="page-container relative z-10 flex min-h-[570px] items-end pb-16 pt-28 md:min-h-[650px] md:items-center md:pb-8">
        <div className="max-w-2xl">
          <h1 id="hero-title" className="text-balance text-4xl font-black leading-[1.18] tracking-tight text-white md:text-6xl lg:text-7xl">
            {item.title}
          </h1>
          <Button size="lg" asChild className="mt-7 h-11 min-w-52 text-base font-black shadow-[0_12px_32px_rgba(33,167,255,0.22)]">
            <Link href={mediaHref(item.mediaType, item.id, item.title)}><Info aria-hidden /> مشاهده {item.mediaType === "movie" ? "فیلم" : "سریال"}</Link>
          </Button>
        </div>
      </div>
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-center gap-3">
          <button type="button" onClick={() => move(1)} aria-label="اسلاید بعدی" className="grid size-9 place-items-center rounded-full bg-black/35 text-white transition hover:bg-black/60"><ChevronRight /></button>
          <div className="flex items-center gap-2">
            {items.map((slide, index) => <button key={slide.id} type="button" onClick={() => setActiveIndex(index)} aria-label={`نمایش ${slide.title}`} aria-current={index === activeIndex} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-8 bg-primary" : "w-2 bg-white/45 hover:bg-white"}`} />)}
          </div>
          <button type="button" onClick={() => move(-1)} aria-label="اسلاید قبلی" className="grid size-9 place-items-center rounded-full bg-black/35 text-white transition hover:bg-black/60"><ChevronLeft /></button>
        </div>
      )}
    </section>
  );
}
