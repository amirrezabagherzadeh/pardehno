"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="page-container flex min-h-[72vh] flex-col items-center justify-center px-4 pt-24 text-center">
      <span className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
        <TriangleAlert className="size-8" aria-hidden />
      </span>
      <h1 className="text-2xl font-black">این پرده فعلاً بالا نرفت</h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
        در دریافت اطلاعات مشکلی پیش آمد. اتصال اینترنت و تنظیمات TMDB را بررسی کنید و دوباره تلاش کنید.
      </p>
      <Button className="mt-6" onClick={reset}><RefreshCw aria-hidden /> تلاش دوباره</Button>
    </section>
  );
}
