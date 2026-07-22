"use client";

import { Eye, EyeOff, MessageSquare, Pencil, Star, ThumbsUp, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { type LocalComment, validateComment } from "@/lib/comments";
import { formatDate } from "@/lib/format";

function sampleComments(mediaKey: string): LocalComment[] {
  return [
    { id: `${mediaKey}-sample-1`, name: "نیلوفر", body: "فضاسازی و انتخاب بازیگران بسیار خوب بود؛ برای تماشا در یک شب آرام پیشنهادش می‌کنم.", rating: 5, spoiler: false, helpful: false, createdAt: "2026-07-10T12:00:00.000Z" },
    { id: `${mediaKey}-sample-2`, name: "آرمان", body: "شروع اثر کمی آرام است اما در ادامه ریتم بهتری پیدا می‌کند و ارزش دنبال‌کردن دارد.", rating: 4, spoiler: false, helpful: false, createdAt: "2026-07-06T12:00:00.000Z" },
    { id: `${mediaKey}-sample-3`, name: "سارا", body: "جزئیات داستان و موسیقی متن برای من جذاب‌ترین بخش‌های این عنوان بودند.", rating: 4, spoiler: false, helpful: false, createdAt: "2026-07-02T12:00:00.000Z" },
  ];
}

export function CommentsSection({ mediaKey }: { mediaKey: string }) {
  const storageKey = `pardehno:v1:comments:${mediaKey}`;
  const [comments, setComments] = useState<LocalComment[]>(() => sampleComments(mediaKey));
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [spoiler, setSpoiler] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]");
      queueMicrotask(() => setComments(Array.isArray(parsed) && parsed.length ? (parsed as LocalComment[]) : sampleComments(mediaKey)));
    } catch {
      queueMicrotask(() => setComments(sampleComments(mediaKey)));
    }
  }, [mediaKey, storageKey]);

  function persist(next: LocalComment[]) {
    setComments(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function resetForm() {
    setBody("");
    setRating(5);
    setSpoiler(false);
    setEditingId(null);
    setErrors({});
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateComment({ name, body, rating });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (editingId) {
      persist(
        comments.map((comment) =>
          comment.id === editingId
            ? { ...comment, name: name.trim(), body: body.trim(), rating, spoiler, updatedAt: new Date().toISOString() }
            : comment,
        ),
      );
    } else {
      persist([
        {
          id: crypto.randomUUID(),
          name: name.trim(),
          body: body.trim(),
          rating,
          spoiler,
          helpful: false,
          createdAt: new Date().toISOString(),
        },
        ...comments,
      ]);
    }
    resetForm();
  }

  return (
    <section className="section-space" aria-labelledby="comments-title">
      <div className="page-container grid gap-7 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-bold text-primary">گفت‌وگوی محلی</p>
          <h2 id="comments-title" className="mt-2 flex items-center gap-2 text-2xl font-black">
            <MessageSquare aria-hidden /> نظر شما
          </h2>
          <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
            این نظرها فقط در همین مرورگر ذخیره می‌شوند و برای دیگران ارسال نخواهند شد.
          </p>
          <form onSubmit={submit} className="mt-6 grid gap-4 rounded-xl border border-white/8 bg-card p-5">
            <div className="grid gap-2">
              <Label htmlFor={`${mediaKey}-name`}>نام نمایشی</Label>
              <Input id={`${mediaKey}-name`} value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(errors.name)} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${mediaKey}-body`}>نظر</Label>
              <Textarea id={`${mediaKey}-body`} value={body} onChange={(event) => setBody(event.target.value)} rows={5} aria-invalid={Boolean(errors.body)} />
              {errors.body && <p className="text-xs text-destructive">{errors.body}</p>}
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="grid gap-2">
                <Label htmlFor={`${mediaKey}-rating`}>امتیاز شما</Label>
                <select id={`${mediaKey}-rating`} value={rating} onChange={(event) => setRating(Number(event.target.value))} className="h-10 rounded-md border border-input bg-[#171c27] px-3 text-sm">
                  {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} از ۵</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Switch id={`${mediaKey}-spoiler`} checked={spoiler} onCheckedChange={setSpoiler} />
                <Label htmlFor={`${mediaKey}-spoiler`}>حاوی اسپویل</Label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingId ? "ذخیره تغییرات" : "ثبت نظر"}</Button>
              {editingId && <Button type="button" variant="ghost" onClick={resetForm}>انصراف</Button>}
            </div>
          </form>
        </div>
        <div className="space-y-4">
          <h3 className="font-bold">نظرهای ذخیره‌شده ({new Intl.NumberFormat("fa-IR").format(comments.length)})</h3>
          {!comments.length && (
            <div className="rounded-xl border border-dashed border-white/10 px-5 py-14 text-center text-sm text-muted-foreground">هنوز نظری ثبت نکرده‌اید.</div>
          )}
          {comments.map((comment) => {
            const hidden = comment.spoiler && !revealed.has(comment.id);
            return (
              <article key={comment.id} className="rounded-xl border border-white/8 bg-card p-5">
                <header className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold">{comment.name}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(comment.createdAt.slice(0, 10))}{comment.updatedAt ? " · ویرایش‌شده" : ""}</p>
                  </div>
                  <span className="flex items-center gap-1 text-sm text-[#f6c945]"><Star className="size-4 fill-current" /> {comment.rating}/۵</span>
                </header>
                {hidden ? (
                  <button type="button" onClick={() => setRevealed(new Set([...revealed, comment.id]))} className="focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-black/25 px-4 py-8 text-sm text-muted-foreground hover:text-white">
                    <Eye aria-hidden /> نمایش متن اسپویل‌دار
                  </button>
                ) : (
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/78">{comment.body}</p>
                )}
                <footer className="mt-5 flex flex-wrap items-center gap-1 border-t border-white/8 pt-3">
                  <Button type="button" variant="ghost" size="sm" onClick={() => persist(comments.map((item) => item.id === comment.id ? { ...item, helpful: !item.helpful } : item))} className={comment.helpful ? "text-primary" : "text-muted-foreground"}>
                    <ThumbsUp aria-hidden /> مفید بود
                  </Button>
                  {comment.spoiler && !hidden && <Button type="button" variant="ghost" size="sm" onClick={() => { const next = new Set(revealed); next.delete(comment.id); setRevealed(next); }}><EyeOff aria-hidden /> پنهان‌کردن</Button>}
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingId(comment.id); setName(comment.name); setBody(comment.body); setRating(comment.rating); setSpoiler(comment.spoiler); }}><Pencil aria-hidden /> ویرایش</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button type="button" variant="ghost" size="sm" className="text-destructive"><Trash2 aria-hidden /> حذف</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>این نظر حذف شود؟</AlertDialogTitle><AlertDialogDescription>این عمل فقط داده ذخیره‌شده در مرورگر را پاک می‌کند و بازگشت‌پذیر نیست.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>انصراف</AlertDialogCancel><AlertDialogAction onClick={() => persist(comments.filter((item) => item.id !== comment.id))}>حذف نظر</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </footer>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
