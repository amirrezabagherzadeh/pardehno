import type {
  MediaSummary,
  PersonSummary,
  SearchSummary,
  TmdbMediaItem,
  TmdbMovieDetail,
  TmdbPage,
  TmdbPersonDetail,
  TmdbSeasonDetail,
  TmdbTvDetail,
  TmdbVideos,
} from "./types";

export function mergeLocalizedMediaPages(
  fa: TmdbPage<TmdbMediaItem>,
  en: TmdbPage<TmdbMediaItem>,
): TmdbPage<TmdbMediaItem> {
  const englishById = new Map(en.results.map((item) => [item.id, item]));
  return {
    ...en,
    ...fa,
    results: fa.results.map((item) => {
      const english = englishById.get(item.id);
      if (!english) return item;
      return {
        ...english,
        ...item,
        title: item.title || english.title,
        name: item.name || english.name,
        overview: item.overview || english.overview,
        poster_path: item.poster_path || english.poster_path,
        backdrop_path: item.backdrop_path || english.backdrop_path,
      };
    }),
  };
}

export function inferMediaType(
  item: TmdbMediaItem,
  fallback: "movie" | "tv" = "movie",
): "movie" | "tv" {
  if (item.media_type === "movie" || item.media_type === "tv") {
    return item.media_type;
  }
  if (item.name || item.first_air_date) return "tv";
  if (item.title || item.release_date) return "movie";
  return fallback;
}

export function mediaTitle(item: TmdbMediaItem): string {
  return item.title || item.name || item.original_title || item.original_name || "بدون عنوان";
}

export function originalMediaTitle(item: TmdbMediaItem): string {
  return item.original_title || item.original_name || mediaTitle(item);
}

export function toMediaSummary(
  item: TmdbMediaItem,
  fallbackType: "movie" | "tv" = "movie",
): MediaSummary {
  return {
    kind: "media",
    id: item.id,
    mediaType: inferMediaType(item, fallbackType),
    title: mediaTitle(item),
    originalTitle: originalMediaTitle(item),
    overview: item.overview || "",
    posterPath: item.poster_path || null,
    backdropPath: item.backdrop_path || null,
    date: item.release_date || item.first_air_date || "",
    genreIds: item.genre_ids || [],
    rating: item.vote_average || 0,
    voteCount: item.vote_count || 0,
    ratingSource: "tmdb",
    popularity: item.popularity || 0,
    adult: Boolean(item.adult),
  };
}

export function toSearchSummary(item: TmdbMediaItem): SearchSummary | null {
  if (item.media_type === "person") {
    const person: PersonSummary = {
      kind: "person",
      id: item.id,
      name: item.name || "بدون نام",
      department: item.known_for_department || "هنرمند",
      profilePath: item.profile_path || null,
      knownFor: (item.known_for || []).slice(0, 3).map(mediaTitle),
      popularity: item.popularity || 0,
    };
    return person;
  }
  if (item.media_type === "movie" || item.media_type === "tv") {
    return toMediaSummary(item, item.media_type);
  }
  return null;
}

function chooseVideos(primary?: TmdbVideos, fallback?: TmdbVideos): TmdbVideos {
  const combined = [...(primary?.results || []), ...(fallback?.results || [])];
  const unique = new Map(combined.map((video) => [video.id, video]));
  return { results: [...unique.values()] };
}

export function mergeMovieDetails(
  fa: TmdbMovieDetail,
  en: TmdbMovieDetail,
): TmdbMovieDetail {
  return {
    ...en,
    ...fa,
    title: fa.title || en.title,
    overview: fa.overview || en.overview,
    tagline: fa.tagline || en.tagline,
    videos: chooseVideos(fa.videos, en.videos),
    credits: fa.credits?.cast?.length ? fa.credits : en.credits,
    images: fa.images?.backdrops?.length ? fa.images : en.images,
    recommendations:
      fa.recommendations?.results?.length ? fa.recommendations : en.recommendations,
    similar: fa.similar?.results?.length ? fa.similar : en.similar,
  };
}

export function mergeTvDetails(
  fa: TmdbTvDetail,
  en: TmdbTvDetail,
): TmdbTvDetail {
  return {
    ...en,
    ...fa,
    name: fa.name || en.name,
    overview: fa.overview || en.overview,
    tagline: fa.tagline || en.tagline,
    videos: chooseVideos(fa.videos, en.videos),
    credits: fa.credits?.cast?.length ? fa.credits : en.credits,
    aggregate_credits: fa.aggregate_credits?.cast?.length
      ? fa.aggregate_credits
      : en.aggregate_credits,
    images: fa.images?.backdrops?.length ? fa.images : en.images,
    recommendations:
      fa.recommendations?.results?.length ? fa.recommendations : en.recommendations,
    similar: fa.similar?.results?.length ? fa.similar : en.similar,
    seasons: fa.seasons?.map((season, index) => ({
      ...(en.seasons?.[index] || {}),
      ...season,
      name: season.name || en.seasons?.[index]?.name || `فصل ${season.season_number}`,
      overview: season.overview || en.seasons?.[index]?.overview || "",
    })) as TmdbTvDetail["seasons"],
  };
}

export function mergeSeasonDetails(
  fa: TmdbSeasonDetail,
  en: TmdbSeasonDetail,
): TmdbSeasonDetail {
  return {
    ...en,
    ...fa,
    name: fa.name || en.name,
    overview: fa.overview || en.overview,
    episodes: fa.episodes.map((episode, index) => ({
      ...(en.episodes[index] || {}),
      ...episode,
      name: episode.name || en.episodes[index]?.name || `قسمت ${episode.episode_number}`,
      overview: episode.overview || en.episodes[index]?.overview || "",
    })),
    aggregate_credits: fa.aggregate_credits?.cast?.length
      ? fa.aggregate_credits
      : en.aggregate_credits,
    videos: chooseVideos(fa.videos, en.videos),
  };
}

export function mergePersonDetails(
  fa: TmdbPersonDetail,
  en: TmdbPersonDetail,
): TmdbPersonDetail {
  return {
    ...en,
    ...fa,
    name: fa.name || en.name,
    biography: fa.biography || en.biography,
    place_of_birth: fa.place_of_birth || en.place_of_birth,
    combined_credits:
      fa.combined_credits?.cast?.length ? fa.combined_credits : en.combined_credits,
  };
}

export function rankVideos(videos: TmdbVideos | undefined) {
  const typePriority: Record<string, number> = {
    Trailer: 0,
    Teaser: 1,
    Clip: 2,
    "Behind the Scenes": 3,
  };
  return (videos?.results || [])
    .filter((video) => video.site === "YouTube")
    .sort((a, b) => {
      const official = Number(b.official) - Number(a.official);
      if (official) return official;
      const language = Number(b.iso_639_1 === "fa") - Number(a.iso_639_1 === "fa");
      if (language) return language;
      return (typePriority[a.type] ?? 9) - (typePriority[b.type] ?? 9);
    });
}
