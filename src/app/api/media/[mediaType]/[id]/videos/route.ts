import { NextResponse } from "next/server";
import { safeTmdbMessage, TmdbError } from "@/lib/tmdb/errors";
import { getMediaVideos } from "@/lib/tmdb/queries";
import type { MediaType } from "@/lib/tmdb/types";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/media/[mediaType]/[id]/videos">,
) {
  const { mediaType, id } = await context.params;
  if ((mediaType !== "movie" && mediaType !== "tv") || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }
  try {
    const data = await getMediaVideos(mediaType as MediaType, Number(id));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: safeTmdbMessage(error), results: [] },
      { status: error instanceof TmdbError ? error.status : 500 },
    );
  }
}
