import { describe, expect, it } from "vitest";
import { persianGenreName } from "@/lib/tmdb/genres";
import { persianTitleFallback } from "@/lib/tmdb/title-localization";
import { inferMediaType, mergeLocalizedMediaPages, rankVideos, toMediaSummary } from "@/lib/tmdb/transformers";
import type { TmdbMediaItem, TmdbVideos } from "@/lib/tmdb/types";

describe("TMDB transformers", () => {
  it("uses Persian labels for known TMDB genres", () => {
    expect(persianGenreName(10759, "Action & Adventure")).toBe("اکشن و ماجراجویی");
    expect(persianGenreName(18, "Drama")).toBe("درام");
  });

  it("falls back to Persian script when a movie title has no translation", () => {
    expect(persianTitleFallback("Project Hail Mary")).toBe("پروژه هیل مری");
    expect(persianTitleFallback("The Last Night")).not.toMatch(/[A-Za-z]/);
    expect(persianTitleFallback("فصل The Last Night")).not.toMatch(/[A-Za-z]/);
  });
  it("infers TV results without an explicit media type", () => {
    expect(inferMediaType({ id: 1, name: "Dark", first_air_date: "2017-12-01" })).toBe("tv");
  });

  it("maps missing optional values to safe summary defaults", () => {
    const item: TmdbMediaItem = { id: 42, title: "آزمون" };
    expect(toMediaSummary(item)).toMatchObject({
      id: 42,
      title: "آزمون",
      mediaType: "movie",
      overview: "",
      rating: 0,
      posterPath: null,
    });
  });

  it("ranks official Persian YouTube trailers first", () => {
    const videos: TmdbVideos = {
      results: [
        { id: "clip", key: "1", name: "Clip", site: "YouTube", type: "Clip", official: false, iso_639_1: "en", published_at: "2024-01-01" },
        { id: "trailer", key: "2", name: "Trailer", site: "YouTube", type: "Trailer", official: true, iso_639_1: "fa", published_at: "2024-01-02" },
        { id: "vimeo", key: "3", name: "Other", site: "Vimeo", type: "Trailer", official: true, iso_639_1: "fa", published_at: "2024-01-03" },
      ],
    };

    expect(rankVideos(videos).map((video) => video.id)).toEqual(["trailer", "clip"]);
  });

  it("fills missing Persian list fields from the matching English TMDB result", () => {
    const fa = {
      page: 1,
      results: [{ id: 7, title: "عنوان فارسی", overview: "", poster_path: null }],
      total_pages: 2,
      total_results: 21,
    };
    const en = {
      page: 1,
      results: [{ id: 7, title: "English title", overview: "English overview", poster_path: "/poster.jpg" }],
      total_pages: 2,
      total_results: 21,
    };

    expect(mergeLocalizedMediaPages(fa, en).results[0]).toMatchObject({
      title: "عنوان فارسی",
      overview: "English overview",
      poster_path: "/poster.jpg",
    });
  });
});
