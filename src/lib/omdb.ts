import "server-only";

export interface ImdbRating {
  rating: number;
  voteCount: number;
  imdbId: string;
}

interface OmdbResponse {
  Response?: string;
  imdbID?: string;
  imdbRating?: string;
  imdbVotes?: string;
}

function yearFromDate(date?: string) {
  const year = Number(date?.slice(0, 4));
  return Number.isInteger(year) ? String(year) : undefined;
}

async function request(params: Record<string, string | undefined>): Promise<ImdbRating | null> {
  const apiKey = process.env.OMDB_API_KEY?.trim();
  if (!apiKey) return null;
  const url = new URL("https://www.omdbapi.com/");
  url.searchParams.set("apikey", apiKey);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  try {
    const response = await fetch(url, { next: { revalidate: 60 * 60 * 12 } });
    if (!response.ok) return null;
    const data = (await response.json()) as OmdbResponse;
    const rating = Number(data.imdbRating);
    const voteCount = Number(data.imdbVotes?.replaceAll(",", ""));
    if (data.Response === "False" || !data.imdbID || !Number.isFinite(rating) || rating <= 0 || !Number.isFinite(voteCount)) return null;
    return { rating, voteCount, imdbId: data.imdbID };
  } catch {
    return null;
  }
}

export function getImdbRatingById(imdbId?: string | null) {
  return imdbId ? request({ i: imdbId }) : Promise.resolve(null);
}

export function getImdbRatingByTitle({
  title,
  date,
  mediaType,
}: {
  title: string;
  date?: string;
  mediaType: "movie" | "tv";
}) {
  return request({ t: title, y: yearFromDate(date), type: mediaType === "tv" ? "series" : "movie" });
}
