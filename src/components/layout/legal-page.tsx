import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
}) {
  return (
    <article className="page-container max-w-4xl pb-16 pt-24 md:pt-32">
      <header className="border-b border-white/8 pb-8">
        <p className="text-xs font-bold text-primary">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black md:text-5xl">{title}</h1>
        <p className="mt-5 text-sm leading-8 text-muted-foreground md:text-base">{intro}</p>
      </header>
      <div className="space-y-9 py-9">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="flex items-center gap-2 text-xl font-black"><ShieldCheck className="size-5 text-primary" aria-hidden />{section.title}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-8 text-white/68">{section.body}</p>
          </section>
        ))}
      </div>
      <Button variant="outline" asChild><Link href="/"><ArrowRight aria-hidden /> بازگشت به خانه</Link></Button>
    </article>
  );
}
