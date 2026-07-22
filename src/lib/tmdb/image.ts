export type TmdbImageSize =
  | "w92"
  | "w154"
  | "w185"
  | "w300"
  | "w342"
  | "w500"
  | "w780"
  | "w1280"
  | "original";

export function tmdbImage(
  path: string | null | undefined,
  size: TmdbImageSize = "w500",
): string {
  return path
    ? `https://image.tmdb.org/t/p/${size}${path}`
    : "/images/fallback-poster.png";
}
