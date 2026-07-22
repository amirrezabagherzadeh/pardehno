import Image from "next/image";
import Link from "next/link";
import { Clapperboard, Heart, History, Search } from "lucide-react";
import { legalNav, siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/8 bg-[#090b0f]">
      <div className="page-container grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-lg">
          <div className="mb-4 flex items-center gap-3">
            <Image src="/images/pardehno-mark.png" alt="" width={42} height={42} className="rounded-xl" />
            <strong className="text-xl">{siteConfig.name}</strong>
          </div>
          <p className="text-sm leading-7 text-muted-foreground">{siteConfig.description}</p>
          <p className="mt-4 text-xs leading-6 text-white/45">
            این محصول از داده‌های TMDB استفاده می‌کند، اما توسط TMDB تأیید یا پشتیبانی نشده است.
            اطلاعات راه‌های تماشا با همکاری JustWatch ارائه می‌شود.
          </p>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold">دسترسی سریع</h2>
          <ul className="grid gap-3 text-sm text-muted-foreground">
            <li><Link className="hover:text-primary" href="/movies"><Clapperboard className="me-2 inline size-4" />فیلم‌ها</Link></li>
            <li><Link className="hover:text-primary" href="/search"><Search className="me-2 inline size-4" />جستجو</Link></li>
            <li><Link className="hover:text-primary" href="/watchlist"><Heart className="me-2 inline size-4" />فهرست من</Link></li>
            <li><Link className="hover:text-primary" href="/recently-viewed"><History className="me-2 inline size-4" />اخیراً دیده‌شده</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold">قوانین و اطلاعات</h2>
          <ul className="grid gap-3 text-sm text-muted-foreground">
            {legalNav.map((item) => (
              <li key={item.href}><Link className="hover:text-primary" href={item.href}>{item.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/8 py-4 text-center text-xs text-white/40">
        © {new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date())} {siteConfig.name} — فقط برای کشف و معرفی محتوای قانونی
      </div>
    </footer>
  );
}
