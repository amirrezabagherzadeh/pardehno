import { describe, expect, it } from "vitest";
import { validateComment } from "@/lib/comments";

describe("comment validation", () => {
  it("accepts a valid local comment", () => {
    expect(validateComment({ name: "سارا", body: "فیلم خوش‌ساخت و تاثیرگذاری بود.", rating: 4 })).toEqual({});
  });

  it("returns field-level errors for invalid input", () => {
    expect(validateComment({ name: "ا", body: "کوتاه", rating: 8 })).toEqual({
      name: "نام باید بین ۲ تا ۴۰ نویسه باشد.",
      body: "نظر باید بین ۱۰ تا ۱۰۰۰ نویسه باشد.",
      rating: "امتیاز معتبر نیست.",
    });
  });
});
