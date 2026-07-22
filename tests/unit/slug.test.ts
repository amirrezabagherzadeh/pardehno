import { describe, expect, it } from "vitest";
import { matchesRouteSlug, mediaHref, toSlug } from "@/lib/slug";

describe("Persian slugs", () => {
  it("keeps Persian letters and normalizes separators", () => {
    expect(toSlug("  جداییِ نادر از سیمین  ")).toBe("جدایی-نادر-از-سیمین");
  });

  it("falls back for punctuation-only titles", () => {
    expect(toSlug("...!!!")).toBe("عنوان");
  });

  it("creates stable canonical media paths", () => {
    expect(mediaHref("movie", 550, "Fight Club")).toBe("/movie/550/fight-club");
  });

  it("matches encoded Persian route params without redirecting again", () => {
    const canonical = "تل-ماسه-بخش-دوم";
    expect(matchesRouteSlug(encodeURIComponent(canonical), canonical)).toBe(true);
  });
});
