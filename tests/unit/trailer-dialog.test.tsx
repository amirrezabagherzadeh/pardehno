// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TrailerDialog } from "@/components/media/trailer-dialog";

describe("TrailerDialog", () => {
  it("opens an official TMDB YouTube trailer", async () => {
    render(
      <TrailerDialog
        title="آزمون"
        videos={[
          { id: "trailer", key: "abc123", name: "Official trailer", site: "YouTube", type: "Trailer", official: true, iso_639_1: "en" },
        ]}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "تماشای تریلر" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByTitle("تریلر آزمون")).toHaveAttribute("src", expect.stringContaining("abc123"));
  });
});
