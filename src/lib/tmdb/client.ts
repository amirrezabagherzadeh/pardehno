import "server-only";
import { fetch as undiciFetch, ProxyAgent } from "undici";
import { TmdbError } from "./errors";

type QueryValue = string | number | boolean | null | undefined;

interface TmdbFetchOptions {
  revalidate?: number;
  cache?: RequestCache;
  tags?: string[];
  retry?: boolean;
}

let proxyAgent: ProxyAgent | undefined;

function getProxyAgent() {
  const proxyUrl = process.env.OUTBOUND_PROXY_URL?.trim();
  if (!proxyUrl) return undefined;
  proxyAgent ||= new ProxyAgent(proxyUrl);
  return proxyAgent;
}

function getBaseUrl(): string {
  return (process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3").replace(
    /\/$/,
    "",
  );
}

function getAuthentication(): {
  headers: HeadersInit;
  apiKey?: string;
} {
  const token = process.env.TMDB_READ_ACCESS_TOKEN?.trim();
  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (!token && !apiKey) {
    throw new TmdbError(
      "TMDB credentials are not configured.",
      "configuration",
      500,
    );
  }
  return {
    headers: {
      accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    apiKey: token ? undefined : apiKey,
  };
}

export async function tmdbFetch<T>(
  path: string,
  query: Record<string, QueryValue> = {},
  options: TmdbFetchOptions = {},
): Promise<T> {
  const { headers, apiKey } = getAuthentication();
  const url = new URL(`${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`);
  Object.entries({ ...query, ...(apiKey ? { api_key: apiKey } : {}) }).forEach(
    ([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    },
  );

  const revalidate = options.revalidate ?? 1800;
  let response: Response;
  try {
    const dispatcher = getProxyAgent();
    response = dispatcher
      ? await undiciFetch(url, { headers, dispatcher }) as unknown as Response
      : await fetch(url, {
          headers,
          cache: options.cache ?? (revalidate === 0 ? "no-store" : "force-cache"),
          next:
            revalidate > 0
              ? { revalidate, tags: options.tags }
              : undefined,
        });
  } catch (error) {
    throw new TmdbError(
      error instanceof Error ? error.message : "TMDB network error",
      "network",
      503,
    );
  }

  if ((response.status === 429 || response.status >= 500) && options.retry !== false) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return tmdbFetch<T>(path, query, { ...options, retry: false });
  }
  if (response.status === 401 || response.status === 403) {
    throw new TmdbError("TMDB authentication failed.", "authentication", 502);
  }
  if (response.status === 404) {
    throw new TmdbError("TMDB resource not found.", "not-found", 404);
  }
  if (response.status === 429) {
    throw new TmdbError("TMDB rate limit reached.", "rate-limit", 429);
  }
  if (!response.ok) {
    throw new TmdbError(
      `TMDB upstream returned ${response.status}.`,
      "upstream",
      502,
    );
  }
  return (await response.json()) as T;
}
