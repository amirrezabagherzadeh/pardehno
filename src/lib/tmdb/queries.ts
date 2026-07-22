import "server-only";
import { getImdbRatingByTitle } from "@/lib/omdb";
import { imdbTopSnapshot } from "@/lib/imdb/top-snapshot";
import { tmdbFetch } from "./client";
import { TmdbError } from "./errors";
import { persianGenreName } from "./genres";
import {
  mergeMovieDetails,
  mergeLocalizedMediaPages,
  mergePersonDetails,
  mergeSeasonDetails,
  mergeTvDetails,
  toMediaSummary,
  toSearchSummary,
} from "./transformers";
import { translateTitleToPersian, translateToPersian } from "./translation";
import type {
  HomeSection,
  MediaSummary,
  MediaType,
  SearchSummary,
  TmdbGenre,
  TmdbMediaItem,
  TmdbMovieDetail,
  TmdbPage,
  TmdbPersonDetail,
  TmdbSeasonDetail,
  TmdbTvDetail,
  TmdbVideos,
} from "./types";

const LIST_REVALIDATE = 60 * 20;
const DETAIL_REVALIDATE = 60 * 60 * 6;
const CONFIG_REVALIDATE = 60 * 60 * 24;

async function localizeGenres(genres: TmdbGenre[]) {
  return Promise.all(genres.map(async (genre) => ({
    ...genre,
    name: await translateToPersian(persianGenreName(genre.id, genre.name)),
  })));
}

function hasCatalogFields(item: TmdbMediaItem) {
  return Boolean(item.poster_path && (item.title || item.name || item.original_title || item.original_name));
}

async function localizeMediaItemTitle(item: TmdbMediaItem) {
  const title = item.title || item.name;
  const [localizedTitle, overview] = await Promise.all([
    translateTitleToPersian(title),
    translateToPersian(item.overview),
  ]);
  return item.title
    ? { ...item, title: localizedTitle, overview }
    : { ...item, name: localizedTitle, overview };
}

async function summaries(
  page: TmdbPage<TmdbMediaItem>,
  fallback: MediaType,
): Promise<MediaSummary[]> {
  return Promise.all(page.results
    .filter(hasCatalogFields)
    .map(async (item) => {
      const summary = toMediaSummary(item, fallback);
      const [title, overview] = await Promise.all([
        translateTitleToPersian(summary.title),
        translateToPersian(summary.overview),
      ]);
      return { ...summary, title, overview };
    }));
}

async function getList(path: string, fallback: MediaType, query = {}) {
  const request = (language: string) => tmdbFetch<TmdbPage<TmdbMediaItem>>(
    path,
    { language, page: 1, ...query },
    { revalidate: LIST_REVALIDATE, tags: [`tmdb:${path}`] },
  );
  const [fa, en] = await Promise.all([request("fa-IR"), request("en-US")]);
  const page = mergeLocalizedMediaPages(fa, en);
  return summaries(page, fallback);
}

async function getListPages(path: string, fallback: MediaType, pages: number) {
  const pageNumbers = Array.from({ length: pages }, (_, index) => index + 1);
  const allPages = await Promise.all(pageNumbers.map(async (page) => {
    const [fa, en] = await Promise.all([
      tmdbFetch<TmdbPage<TmdbMediaItem>>(path, { language: "fa-IR", page }, { revalidate: LIST_REVALIDATE, tags: [`tmdb:${path}`] }),
      tmdbFetch<TmdbPage<TmdbMediaItem>>(path, { language: "en-US", page }, { revalidate: LIST_REVALIDATE, tags: [`tmdb:${path}`] }),
    ]);
    return summaries(mergeLocalizedMediaPages(fa, en), fallback);
  }));
  return allPages.flat();
}

async function getStreamingHeroItems() {
  const today = new Date().toISOString().slice(0, 10);
  const commonQuery = {
    sort_by: "popularity.desc",
    "vote_count.gte": 1000,
    watch_region: "US",
    with_watch_monetization_types: "flatrate|free|ads",
    include_adult: false,
  };
  const [movies, shows] = await Promise.all([
    getList("/discover/movie", "movie", { ...commonQuery, "primary_release_date.lte": today }),
    getList("/discover/tv", "tv", { ...commonQuery, "first_air_date.lte": today }),
  ]);
  const eligible = (items: MediaSummary[]) => items.filter((item) => item.backdropPath && item.date && item.date <= today);
  const heroMovies = eligible(movies);
  const heroShows = eligible(shows);
  return [...heroMovies.slice(0, 2), ...heroShows.slice(0, 2), ...heroMovies.slice(2), ...heroShows.slice(2)].slice(0, 4);
}

async function withImdbRatings(items: MediaSummary[]) {
  const ratings = await Promise.all(items.map((item) => getImdbRatingByTitle({
    title: item.originalTitle,
    date: item.date,
    mediaType: item.mediaType,
  })));
  return items
    .map((item, index) => {
      const imdb = ratings[index];
      return imdb ? { ...item, rating: imdb.rating, voteCount: imdb.voteCount, ratingSource: "imdb" as const } : item;
    })
    .sort((left, right) => right.rating - left.rating || right.voteCount - left.voteCount);
}

interface TmdbFindResult {
  movie_results: TmdbMediaItem[];
  tv_results: TmdbMediaItem[];
}

export async function getOfficialImdbTopSnapshot() {
  const results: MediaSummary[] = [];
  for (let start = 0; start < imdbTopSnapshot.length; start += 10) {
    const batch = imdbTopSnapshot.slice(start, start + 10);
    const resolved: Array<MediaSummary | null> = await Promise.all(batch.map(async (entry) => {
      const data = await tmdbFetch<TmdbFindResult>(`/find/${entry.imdbId}`, {
        external_source: "imdb_id",
        language: "fa-IR",
      }, { revalidate: 60 * 60 * 24 * 7, tags: ["imdb-top-snapshot"] });
      const item = entry.mediaType === "movie" ? data.movie_results[0] : data.tv_results[0];
      if (!item || !hasCatalogFields(item)) return null;
      const summary = toMediaSummary(item, entry.mediaType);
      return {
        ...summary,
        title: await translateTitleToPersian(summary.title),
        rating: entry.rating,
        voteCount: entry.voteCount,
        ratingSource: "imdb" as const,
        imdbRank: entry.rank,
      };
    }));
    for (const item of resolved) {
      if (item) results.push(item);
    }
  }
  return results;
}

export async function getMixedTopRated() {
  const [movies, series] = await Promise.all([
    getList("/movie/top_rated", "movie"),
    getList("/tv/top_rated", "tv"),
  ]);
  return withImdbRatings([...movies, ...series]);
}

export async function getHomepageData(): Promise<{
  heroItems: MediaSummary[];
  featured: MediaSummary[];
  sections: HomeSection[];
}> {
  const requests = [
    getStreamingHeroItems(),
    getList("/trending/all/week", "movie"),
    getList("/movie/popular", "movie"),
    getList("/tv/popular", "tv"),
    getListPages("/movie/now_playing", "movie", 3),
    getList("/movie/upcoming", "movie"),
    getList("/movie/top_rated", "movie"),
    getList("/tv/top_rated", "tv"),
    getList("/discover/movie", "movie", { with_genres: 28, sort_by: "popularity.desc" }),
    getList("/discover/movie", "movie", { with_genres: 35, sort_by: "popularity.desc" }),
    getList("/discover/movie", "movie", { with_genres: 16, sort_by: "popularity.desc" }),
  ] as const;
  const results = await Promise.allSettled(requests);
  const value = (index: number) =>
    results[index].status === "fulfilled" ? results[index].value : [];
  const heroItems = value(0);
  const trending = value(1);
  const [topMovies, topTv] = await Promise.all([withImdbRatings(value(6)), withImdbRatings(value(7))]);
  if (!heroItems.length) {
    const firstError = results.find((item) => item.status === "rejected");
    if (firstError?.status === "rejected") throw firstError.reason;
    throw new TmdbError("No homepage media returned.", "upstream", 502);
  }
  const sections: HomeSection[] = [
    { id: "trending", title: "ترند این هفته", href: "/movies?sort=popularity.desc", items: trending },
    { id: "popular-movies", title: "فیلم‌های محبوب", href: "/movies", items: value(2) },
    { id: "popular-tv", title: "سریال‌های محبوب", href: "/tv", items: value(3) },
    { id: "now-playing", title: "در حال اکران", href: "/movies?window=now-playing", items: value(4) },
    { id: "upcoming", title: "به‌زودی", href: "/movies?window=upcoming", items: value(5) },
    { id: "top-movies", title: "برترین فیلم‌ها", href: "/movies?sort=vote_average.desc", items: topMovies },
    { id: "top-tv", title: "برترین سریال‌ها", href: "/tv?sort=vote_average.desc", items: topTv },
    { id: "action", title: "اکشن و ماجراجویی", href: "/genre/28/action", items: value(8) },
    { id: "comedy", title: "حال‌وهوای کمدی", href: "/genre/35/comedy", items: value(9) },
    { id: "animation", title: "برای تمام خانواده", href: "/genre/16/animation", items: value(10) },
  ].filter((section) => section.items.length > 0);
  return {
    heroItems,
    featured: trending.filter((item) => item.backdropPath).slice(4, 10),
    sections,
  };
}

export async function getBrowseHeroItems(mediaType: MediaType, sort?: string) {
  const requestedSort = validSort(mediaType, sort);
  const items = await discoverMedia(mediaType, {
    sort: requestedSort,
    minVotes: requestedSort === "vote_average.desc" ? 100 : undefined,
  });
  return items.results.filter((item) => item.backdropPath).slice(0, 4);
}

export interface DiscoverOptions {
  page?: number;
  genre?: number;
  sort?: string;
  year?: string;
  minRating?: number;
  minVotes?: number;
  language?: string;
  provider?: string;
  includeAdult?: boolean;
  country?: string;
  familyFriendly?: boolean;
  hdOnly?: boolean;
}

const commonSorts = new Set(["popularity.desc", "popularity.asc", "vote_average.desc", "vote_average.asc", "vote_count.desc", "vote_count.asc"]);

function validSort(mediaType: MediaType, sort?: string) {
  if (!sort) return "popularity.desc";
  if (commonSorts.has(sort)) return sort;
  if (mediaType === "movie" && ["primary_release_date.desc", "primary_release_date.asc", "revenue.desc"].includes(sort)) return sort;
  if (mediaType === "tv" && ["first_air_date.desc", "first_air_date.asc", "name.asc", "name.desc"].includes(sort)) return sort;
  return "popularity.desc";
}

export async function discoverMedia(
  mediaType: MediaType,
  options: DiscoverOptions = {},
) {
  const yearKey = mediaType === "movie" ? "primary_release_year" : "first_air_date_year";
  const familyGenre = mediaType === "tv" && options.familyFriendly ? "10762" : undefined;
  const genres = [options.genre, familyGenre].filter(Boolean).join(",") || undefined;
  const query = {
      page: Math.max(1, options.page || 1),
      sort_by: validSort(mediaType, options.sort),
      with_genres: genres,
      [yearKey]: options.year,
      "vote_average.gte": options.minRating,
      "vote_count.gte": options.minVotes,
      with_original_language: options.language,
      with_origin_country: options.country,
      with_watch_providers: options.provider,
      watch_region: options.provider ? "IR" : undefined,
      include_adult: Boolean(options.includeAdult),
      include_video: false,
      certification_country: mediaType === "movie" && options.familyFriendly ? "US" : undefined,
      "certification.lte": mediaType === "movie" && options.familyFriendly ? "PG-13" : undefined,
    };
  const request = (language: string) => tmdbFetch<TmdbPage<TmdbMediaItem>>(
    `/discover/${mediaType}`,
    { ...query, language },
    { revalidate: LIST_REVALIDATE },
  );
  const [fa, en] = await Promise.all([request("fa-IR"), request("en-US")]);
  const data = mergeLocalizedMediaPages(fa, en);
  const baseResults = data.results
    .filter(hasCatalogFields)
    .map((item) => toMediaSummary(item, mediaType))
    .filter((item) => !options.hdOnly || Boolean(item.backdropPath && item.posterPath));
  const localizedResults = await Promise.all(baseResults.map(async (item) => ({
    ...item,
    title: await translateTitleToPersian(item.title),
    overview: await translateToPersian(item.overview),
  })));
  const results = options.sort === "vote_average.desc" ? await withImdbRatings(localizedResults) : localizedResults;
  return {
    ...data,
    results,
    total_pages: Math.min(data.total_pages, 500),
  };
}

export async function getGenres(mediaType: MediaType): Promise<TmdbGenre[]> {
  const data = await tmdbFetch<{ genres: TmdbGenre[] }>(
    `/genre/${mediaType}/list`,
    { language: "fa-IR" },
    { revalidate: CONFIG_REVALIDATE, tags: [`genres:${mediaType}`] },
  );
  return localizeGenres(data.genres);
}

export async function searchMulti(
  query: string,
  page = 1,
): Promise<TmdbPage<SearchSummary>> {
  const normalized = query.trim();
  if (normalized.length < 2) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  const request = (language: string) => tmdbFetch<TmdbPage<TmdbMediaItem>>(
    "/search/multi",
    { query: normalized, language, page, include_adult: false },
    { cache: "no-store", revalidate: 0 },
  );
  const [fa, en] = await Promise.all([request("fa-IR"), request("en-US")]);
  const data = mergeLocalizedMediaPages(fa, en);
  const results = await Promise.all(data.results.map(async (item) => {
    const summary = toSearchSummary(item);
    if (!summary) return summary;
    if (summary.kind === "media") {
      const [title, overview] = await Promise.all([
        translateTitleToPersian(summary.title),
        translateToPersian(summary.overview),
      ]);
      return { ...summary, title, overview };
    }
    return { ...summary, knownFor: await Promise.all(summary.knownFor.map(translateTitleToPersian)) };
  }));
  return {
    ...data,
    results: results.filter((item): item is SearchSummary => Boolean(item)),
  };
}

const movieAppend = [
  "credits",
  "videos",
  "images",
  "recommendations",
  "similar",
  "external_ids",
  "release_dates",
  "watch/providers",
  "keywords",
].join(",");

const tvAppend = [
  "credits",
  "aggregate_credits",
  "videos",
  "images",
  "recommendations",
  "similar",
  "external_ids",
  "content_ratings",
  "watch/providers",
  "keywords",
].join(",");

export async function getMovieDetails(id: number): Promise<TmdbMovieDetail> {
  const query = { append_to_response: movieAppend, include_image_language: "fa,en,null" };
  const [fa, en] = await Promise.all([
    tmdbFetch<TmdbMovieDetail>(`/movie/${id}`, { ...query, language: "fa-IR" }, { revalidate: DETAIL_REVALIDATE }),
    tmdbFetch<TmdbMovieDetail>(`/movie/${id}`, { ...query, language: "en-US" }, { revalidate: DETAIL_REVALIDATE }),
  ]);
  const detail = mergeMovieDetails(fa, en);
  const [overview, tagline, title, genres, recommendations, similar] = await Promise.all([
    translateToPersian(detail.overview),
    translateToPersian(detail.tagline),
    translateTitleToPersian(detail.title),
    localizeGenres(detail.genres),
    Promise.all((detail.recommendations?.results || []).map(localizeMediaItemTitle)),
    Promise.all((detail.similar?.results || []).map(localizeMediaItemTitle)),
  ]);
  return {
    ...detail,
    overview,
    tagline,
    title,
    genres,
    recommendations: detail.recommendations ? { ...detail.recommendations, results: recommendations } : detail.recommendations,
    similar: detail.similar ? { ...detail.similar, results: similar } : detail.similar,
  };
}

export async function getTvDetails(id: number): Promise<TmdbTvDetail> {
  const query = { append_to_response: tvAppend, include_image_language: "fa,en,null" };
  const [fa, en] = await Promise.all([
    tmdbFetch<TmdbTvDetail>(`/tv/${id}`, { ...query, language: "fa-IR" }, { revalidate: DETAIL_REVALIDATE }),
    tmdbFetch<TmdbTvDetail>(`/tv/${id}`, { ...query, language: "en-US" }, { revalidate: DETAIL_REVALIDATE }),
  ]);
  const detail = mergeTvDetails(fa, en);
  const [overview, tagline, seasons, name, genres, recommendations, similar] = await Promise.all([
    translateToPersian(detail.overview),
    translateToPersian(detail.tagline),
    Promise.all((detail.seasons || []).map(async (season) => ({
      ...season,
      name: await translateTitleToPersian(season.name),
      overview: await translateToPersian(season.overview),
    }))),
    translateTitleToPersian(detail.name),
    localizeGenres(detail.genres),
    Promise.all((detail.recommendations?.results || []).map(localizeMediaItemTitle)),
    Promise.all((detail.similar?.results || []).map(localizeMediaItemTitle)),
  ]);
  return {
    ...detail,
    overview,
    tagline,
    seasons,
    name,
    genres,
    recommendations: detail.recommendations ? { ...detail.recommendations, results: recommendations } : detail.recommendations,
    similar: detail.similar ? { ...detail.similar, results: similar } : detail.similar,
  };
}

export async function getSeasonDetails(
  tvId: number,
  seasonNumber: number,
): Promise<TmdbSeasonDetail> {
  const query = { append_to_response: "aggregate_credits,videos,images", include_image_language: "fa,en,null" };
  const [fa, en] = await Promise.all([
    tmdbFetch<TmdbSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`, { ...query, language: "fa-IR" }, { revalidate: DETAIL_REVALIDATE }),
    tmdbFetch<TmdbSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`, { ...query, language: "en-US" }, { revalidate: DETAIL_REVALIDATE }),
  ]);
  const detail = mergeSeasonDetails(fa, en);
  const [name, overview, episodes] = await Promise.all([
    translateTitleToPersian(detail.name),
    translateToPersian(detail.overview),
    Promise.all(detail.episodes.map(async (episode) => ({
      ...episode,
      name: await translateTitleToPersian(episode.name),
      overview: await translateToPersian(episode.overview),
    }))),
  ]);
  return { ...detail, name, overview, episodes };
}

export async function getPersonDetails(id: number): Promise<TmdbPersonDetail> {
  const query = { append_to_response: "combined_credits,external_ids,images", include_image_language: "fa,en,null" };
  const [fa, en] = await Promise.all([
    tmdbFetch<TmdbPersonDetail>(`/person/${id}`, { ...query, language: "fa-IR" }, { revalidate: DETAIL_REVALIDATE }),
    tmdbFetch<TmdbPersonDetail>(`/person/${id}`, { ...query, language: "en-US" }, { revalidate: DETAIL_REVALIDATE }),
  ]);
  const detail = mergePersonDetails(fa, en);
  const [biography, cast, crew] = await Promise.all([
    translateToPersian(detail.biography),
    Promise.all((detail.combined_credits?.cast || []).map(localizeMediaItemTitle)),
    Promise.all((detail.combined_credits?.crew || []).map(localizeMediaItemTitle)),
  ]);
  return {
    ...detail,
    biography,
    combined_credits: detail.combined_credits ? { ...detail.combined_credits, cast, crew } : detail.combined_credits,
  };
}

export async function getMediaVideos(mediaType: MediaType, id: number) {
  const [fa, en] = await Promise.all([
    tmdbFetch<TmdbVideos>(`/${mediaType}/${id}/videos`, { language: "fa-IR" }, { revalidate: 3600 }),
    tmdbFetch<TmdbVideos>(`/${mediaType}/${id}/videos`, { language: "en-US" }, { revalidate: 3600 }),
  ]);
  const unique = new Map([...fa.results, ...en.results].map((video) => [video.id, video]));
  return { results: [...unique.values()] };
}
