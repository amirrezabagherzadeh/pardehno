import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrowsePage } from "@/components/browse/browse-page";
import { getGenres } from "@/lib/tmdb/queries";

export async function generateMetadata({ params }: PageProps<"/genre/[genreId]/[slug]">): Promise<Metadata> {
  const { genreId } = await params;
  const genres = await getGenres("movie");
  const genre = genres.find((item) => item.id === Number(genreId));
  return { title: genre ? `فیلم‌های ${genre.name}` : "ژانر" };
}

export default async function GenrePage({ params, searchParams }: PageProps<"/genre/[genreId]/[slug]">) {
  const { genreId } = await params;
  const id = Number(genreId);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const genres = await getGenres("movie");
  const genre = genres.find((item) => item.id === id);
  if (!genre) notFound();
  return (
    <BrowsePage
      mediaType="movie"
      title={`فیلم‌های ${genre.name}`}
      description={`مجموعه‌ای از فیلم‌های ژانر ${genre.name}، مرتب‌شده بر اساس محبوبیت و امتیاز کاربران TMDB.`}
      searchParams={await searchParams}
      forcedGenre={id}
    />
  );
}
