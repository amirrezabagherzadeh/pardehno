import { NextResponse } from "next/server";
import { safeTmdbMessage, TmdbError } from "@/lib/tmdb/errors";
import { searchMulti } from "@/lib/tmdb/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";
  if (query.length < 2) {
    return NextResponse.json({ results: [], total_results: 0 });
  }
  try {
    const data = await searchMulti(query, 1);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: safeTmdbMessage(error), results: [] },
      { status: error instanceof TmdbError ? error.status : 500 },
    );
  }
}
