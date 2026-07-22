"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Bookmark, Menu, Search, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchDialog } from "@/components/search/search-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useWatchlist } from "@/lib/storage/media-store";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.toString();
  const watchlist = useWatchlist();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 28);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 h-14 bg-transparent transition-[background-color,backdrop-filter] duration-200 md:h-[68px]",
          scrolled
            ? "bg-[#0b0d12]/92 backdrop-blur-xl"
            : "bg-transparent",
        )}
      >
        <div className="page-container flex h-full items-center gap-3 md:gap-7">
          <Link href="/" className="focus-ring flex shrink-0 items-center gap-2 rounded-md" aria-label="پرده‌نو، صفحه خانه">
            <Image
              src="/images/pardehno-mark.png"
              alt=""
              width={38}
              height={38}
              className="size-8 rounded-lg md:size-9"
              priority
            />
            <span className="text-lg font-black tracking-tight md:text-xl">{siteConfig.name}</span>
          </Link>

          <nav className="hidden h-full items-center gap-1 lg:flex" aria-label="پیمایش اصلی">
            {siteConfig.nav.map((item) => {
              const [itemPath, itemQuery] = item.href.split("?");
              const active = item.href === "/"
                ? pathname === "/"
                : itemQuery
                  ? `${pathname}?${currentSearch}` === item.href
                  : pathname === itemPath && !["sort=vote_average.desc", "sort=primary_release_date.desc"].includes(currentSearch);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-ring relative flex h-full items-center rounded-sm px-3 text-sm text-white/72 transition-colors hover:text-white",
                    active && "text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ms-auto flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              aria-label="بازکردن جستجو"
              className="text-white/85 hover:bg-white/10 hover:text-white"
            >
              <Search aria-hidden />
            </Button>
            <Button variant="ghost" size="icon" asChild className="relative text-white/85 hover:bg-white/10 hover:text-white">
              <Link href="/watchlist" aria-label={`فهرست من، ${watchlist.length} عنوان`}>
                <Bookmark aria-hidden />
                {watchlist.length > 0 && (
                  <span className="absolute -end-0.5 -top-0.5 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] font-bold leading-4 text-primary-foreground">
                    {new Intl.NumberFormat("fa-IR").format(watchlist.length)}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="hidden text-white/85 hover:bg-white/10 hover:text-white sm:inline-flex">
              <Link href="/about" aria-label="حساب مهمان">
                <UserRound aria-hidden />
              </Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white/85 hover:bg-white/10 hover:text-white lg:hidden" aria-label="بازکردن منو">
                  <Menu aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[86vw] border-white/10 bg-[#11151f] sm:max-w-sm">
                <SheetHeader className="border-b border-white/10 pt-6">
                  <SheetTitle className="flex items-center gap-2 text-xl">
                    <Image src="/images/pardehno-mark.png" alt="" width={36} height={36} className="rounded-lg" />
                    {siteConfig.name}
                  </SheetTitle>
                  <SheetDescription>مسیر خودتان را در دنیای فیلم و سریال پیدا کنید.</SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-1 p-3" aria-label="پیمایش موبایل">
                  {siteConfig.nav.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "rounded-lg px-4 py-3 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-white",
                          (item.href === "/" ? pathname === "/" : item.href.includes("?") ? `${pathname}?${currentSearch}` === item.href : pathname === item.href) &&
                            "bg-primary/10 font-semibold text-primary",
                        )}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                  <SheetClose asChild>
                    <Link href="/recently-viewed" className="rounded-lg px-4 py-3 text-sm text-muted-foreground hover:bg-white/5 hover:text-white">
                      اخیراً مشاهده‌شده
                    </Link>
                  </SheetClose>
                </nav>
                <div className="mt-auto border-t border-white/10 p-4 text-xs leading-6 text-muted-foreground">
                  حساب شما در این نسخه مهمان است و فهرست‌ها فقط در همین مرورگر ذخیره می‌شوند.
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
