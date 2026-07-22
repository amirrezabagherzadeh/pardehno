import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="page-container flex min-h-[72vh] flex-col items-center justify-center px-4 pt-24 text-center">
      <SearchX className="mb-5 size-16 text-primary" aria-hidden />
      <p className="text-sm font-bold text-primary">خطای ۴۰۴</p>
      <h1 className="mt-2 text-3xl font-black">این عنوان پیدا نشد</h1>
      <p className="mt-3 text-sm text-muted-foreground">ممکن است پیوند تغییر کرده باشد یا این محتوا در TMDB موجود نباشد.</p>
      <Button className="mt-7" asChild><Link href="/"><ArrowRight aria-hidden /> بازگشت به خانه</Link></Button>
    </section>
  );
}
