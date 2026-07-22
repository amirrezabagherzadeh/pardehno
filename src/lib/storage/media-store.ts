"use client";

import { useSyncExternalStore } from "react";
import type { MediaSummary } from "@/lib/tmdb/types";

const WATCHLIST_KEY = "pardehno:v1:watchlist";
const RECENT_KEY = "pardehno:v1:recent";

type Listener = () => void;
const EMPTY_MEDIA: MediaSummary[] = [];

function isStoredMedia(value: unknown): value is MediaSummary {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<MediaSummary>;
  return (
    item.kind === "media" &&
    typeof item.id === "number" &&
    (item.mediaType === "movie" || item.mediaType === "tv") &&
    typeof item.title === "string"
  );
}

class LocalMediaStore {
  private snapshot: MediaSummary[] = [];
  private listeners = new Set<Listener>();
  private hydrated = false;

  constructor(
    private readonly key: string,
    private readonly limit = 250,
  ) {}

  private read() {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(this.key);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      this.snapshot = Array.isArray(parsed) ? parsed.filter(isStoredMedia) : [];
    } catch {
      this.snapshot = [];
    }
    this.hydrated = true;
  }

  private write(items: MediaSummary[]) {
    this.snapshot = items.slice(0, this.limit);
    window.localStorage.setItem(this.key, JSON.stringify(this.snapshot));
    this.listeners.forEach((listener) => listener());
  }

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    if (!this.hydrated) {
      this.read();
      queueMicrotask(() => listener());
    }
    const handleStorage = (event: StorageEvent) => {
      if (event.key === this.key) {
        this.read();
        listener();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      this.listeners.delete(listener);
      window.removeEventListener("storage", handleStorage);
    };
  };

  getSnapshot = () => this.snapshot;
  getServerSnapshot = () => EMPTY_MEDIA;

  has(id: number, mediaType: MediaSummary["mediaType"]) {
    if (!this.hydrated) this.read();
    return this.snapshot.some((item) => item.id === id && item.mediaType === mediaType);
  }

  toggle(item: MediaSummary) {
    if (!this.hydrated) this.read();
    const exists = this.has(item.id, item.mediaType);
    this.write(
      exists
        ? this.snapshot.filter(
            (stored) => stored.id !== item.id || stored.mediaType !== item.mediaType,
          )
        : [item, ...this.snapshot],
    );
  }

  push(item: MediaSummary) {
    if (!this.hydrated) this.read();
    const rest = this.snapshot.filter(
      (stored) => stored.id !== item.id || stored.mediaType !== item.mediaType,
    );
    this.write([item, ...rest]);
  }
}

export const watchlistStore = new LocalMediaStore(WATCHLIST_KEY);
export const recentStore = new LocalMediaStore(RECENT_KEY, 30);

export function useWatchlist() {
  return useSyncExternalStore(
    watchlistStore.subscribe,
    watchlistStore.getSnapshot,
    watchlistStore.getServerSnapshot,
  );
}

export function useRecentlyViewed() {
  return useSyncExternalStore(
    recentStore.subscribe,
    recentStore.getSnapshot,
    recentStore.getServerSnapshot,
  );
}
