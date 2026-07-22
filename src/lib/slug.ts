export function toSlug(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("fa-IR")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "عنوان";
}

export function mediaHref(
  mediaType: "movie" | "tv",
  id: number,
  title: string,
): string {
  return `/${mediaType}/${id}/${toSlug(title)}`;
}

export function matchesRouteSlug(value: string, canonical: string): boolean {
  try {
    return decodeURIComponent(value) === canonical;
  } catch {
    return value === canonical;
  }
}
