export type MediaType = "movie" | "tv";

export interface TmdbPage<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbMediaItem {
  id: number;
  media_type?: MediaType | "person";
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  adult?: boolean;
  original_language?: string;
  known_for_department?: string;
  known_for?: TmdbMediaItem[];
}

export interface MediaSummary {
  kind: "media";
  id: number;
  mediaType: MediaType;
  title: string;
  originalTitle: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  date: string;
  genreIds: number[];
  rating: number;
  voteCount: number;
  ratingSource?: "imdb" | "tmdb";
  imdbRank?: number;
  popularity: number;
  adult: boolean;
}

export interface PersonSummary {
  kind: "person";
  id: number;
  name: string;
  department: string;
  profilePath: string | null;
  knownFor: string[];
  popularity: number;
}

export type SearchSummary = MediaSummary | PersonSummary;

export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: "Trailer" | "Teaser" | "Clip" | "Behind the Scenes" | string;
  official: boolean;
  iso_639_1: string;
  published_at?: string;
}

export interface TmdbVideos {
  results: TmdbVideo[];
}

export interface TmdbCastMember {
  id: number;
  name: string;
  original_name?: string;
  character?: string;
  profile_path?: string | null;
  order?: number;
  roles?: Array<{ character: string; episode_count: number }>;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  original_name?: string;
  job?: string;
  department?: string;
  profile_path?: string | null;
}

export interface TmdbCredits {
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbImageAsset {
  file_path: string;
  width: number;
  height: number;
  aspect_ratio: number;
  iso_639_1?: string | null;
  vote_average?: number;
}

export interface TmdbImages {
  backdrops: TmdbImageAsset[];
  posters: TmdbImageAsset[];
  logos: TmdbImageAsset[];
  profiles?: TmdbImageAsset[];
}

export interface TmdbProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface TmdbProviderRegion {
  link?: string;
  flatrate?: TmdbProvider[];
  free?: TmdbProvider[];
  ads?: TmdbProvider[];
  rent?: TmdbProvider[];
  buy?: TmdbProvider[];
}

export interface TmdbWatchProviders {
  results: Record<string, TmdbProviderRegion>;
}

export type TmdbRecommendationPage = TmdbPage<TmdbMediaItem>;

export interface TmdbCompany {
  id: number;
  name: string;
  logo_path?: string | null;
  origin_country?: string;
}

export interface TmdbCountry {
  iso_3166_1: string;
  name: string;
}

export interface TmdbLanguage {
  iso_639_1: string;
  english_name: string;
  name: string;
}

export interface TmdbSeasonSummary {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date?: string | null;
  poster_path?: string | null;
  overview?: string;
}

export interface TmdbDetailBase extends TmdbMediaItem {
  genres: TmdbGenre[];
  tagline?: string;
  status?: string;
  homepage?: string;
  production_companies?: TmdbCompany[];
  production_countries?: TmdbCountry[];
  spoken_languages?: TmdbLanguage[];
  credits?: TmdbCredits;
  aggregate_credits?: TmdbCredits;
  videos?: TmdbVideos;
  images?: TmdbImages;
  recommendations?: TmdbRecommendationPage;
  similar?: TmdbRecommendationPage;
  external_ids?: Record<string, string | null>;
  keywords?: { keywords?: TmdbGenre[]; results?: TmdbGenre[] };
  "watch/providers"?: TmdbWatchProviders;
}

export interface TmdbMovieDetail extends TmdbDetailBase {
  title: string;
  original_title: string;
  release_date: string;
  runtime?: number | null;
  budget?: number;
  revenue?: number;
  imdb_id?: string | null;
  release_dates?: {
    results: Array<{
      iso_3166_1: string;
      release_dates: Array<{ certification: string; type: number }>;
    }>;
  };
}

export interface TmdbTvDetail extends TmdbDetailBase {
  name: string;
  original_name: string;
  first_air_date: string;
  last_air_date?: string;
  episode_run_time?: number[];
  number_of_episodes?: number;
  number_of_seasons?: number;
  origin_country?: string[];
  networks?: TmdbCompany[];
  created_by?: Array<{ id: number; name: string; profile_path?: string | null }>;
  seasons?: TmdbSeasonSummary[];
  content_ratings?: {
    results: Array<{ iso_3166_1: string; rating: string }>;
  };
}

export type TmdbDetail = TmdbMovieDetail | TmdbTvDetail;

export interface TmdbEpisode {
  id: number;
  episode_number: number;
  name: string;
  overview?: string;
  air_date?: string;
  runtime?: number | null;
  still_path?: string | null;
  vote_average?: number;
  guest_stars?: TmdbCastMember[];
}

export interface TmdbSeasonDetail {
  id: number;
  name: string;
  overview?: string;
  air_date?: string;
  poster_path?: string | null;
  season_number: number;
  episodes: TmdbEpisode[];
  aggregate_credits?: TmdbCredits;
  videos?: TmdbVideos;
  images?: TmdbImages;
}

export interface TmdbPersonDetail {
  id: number;
  name: string;
  biography?: string;
  birthday?: string | null;
  deathday?: string | null;
  place_of_birth?: string | null;
  profile_path?: string | null;
  known_for_department?: string;
  homepage?: string | null;
  external_ids?: Record<string, string | null>;
  images?: { profiles: TmdbImageAsset[] };
  combined_credits?: {
    cast: Array<TmdbMediaItem & { character?: string; credit_id?: string }>;
    crew: Array<TmdbMediaItem & { job?: string; department?: string; credit_id?: string }>;
  };
}

export interface HomeSection {
  id: string;
  title: string;
  href: string;
  items: MediaSummary[];
  layout?: "poster" | "landscape";
}
