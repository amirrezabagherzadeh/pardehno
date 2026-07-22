"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface MediaCarouselProps {
  title: string;
  href: string;
  children: React.ReactNode;
  layout?: "poster" | "landscape";
}

export function MediaCarousel({ title, href, children, layout = "poster" }: MediaCarouselProps) {
  const ref = useRef<HTMLDivElement>(null);

  function move(direction: 1 | -1) {
    const node = ref.current;
    if (!node) return;
    const amount = Math.min(node.clientWidth * 0.82, 980);
    node.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  return (
    <section className="section-space" aria-labelledby={`section-${title}`}>
      <div className="page-container">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 id={`section-${title}`} className="text-xl font-black tracking-tight md:text-2xl">{title}</h2>
            <span className="mt-1 block h-0.5 w-12 rounded-full bg-primary" />
          </div>
          <div className="flex items-center gap-1">
            <Link href={href} className="focus-ring me-2 rounded px-2 py-1 text-xs text-muted-foreground transition hover:text-primary">
              مشاهده همه
            </Link>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => move(1)} aria-label={`مورد قبلی در ${title}`}>
              <ChevronRight aria-hidden />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => move(-1)} aria-label={`مورد بعدی در ${title}`}>
              <ChevronLeft aria-hidden />
            </Button>
          </div>
        </div>
        <div
          ref={ref}
          dir="rtl"
          className={`hide-scrollbar grid snap-x snap-mandatory auto-cols-max grid-flow-col overflow-x-auto overscroll-x-contain pb-5 ${
            layout === "landscape" ? "gap-3 md:gap-4" : "gap-3 md:gap-5"
          }`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
