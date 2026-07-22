import { NextResponse } from "next/server";
import { safeTmdbMessage, TmdbError } from "@/lib/tmdb/errors";
import { discoverMedia } from "@/lib/tmdb/queries";
import type { MediaType } from "@/lib/tmdb/types";

function positiveNumber(value: string | null) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mediaType: MediaType = searchParams.get("media") === "tv" ? "tv" : "movie";
  const sort = searchParams.get("sort") || undefined;

  try {
    const data = await discoverMedia(mediaType, {
      page: positiveNumber(searchParams.get("page")),
      genre: positiveNumber(searchParams.get("genre")),
      sort,
      year: searchParams.get("year") || undefined,
      language: searchParams.get("language") || undefined,
      country: searchParams.get("country") || undefined,
      familyFriendly: searchParams.get("age") === "family",
      hdOnly: searchParams.get("quality") === "hd",
      minVotes: sort === "vote_average.desc" ? 1000 : undefined,
    });
    return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json(
      { error: safeTmdbMessage(error), results: [] },
      { status: error instanceof TmdbError ? error.status : 500 },
    );
  }
}
