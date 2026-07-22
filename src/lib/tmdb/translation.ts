import "server-only";
import { fetch as undiciFetch, ProxyAgent } from "undici";
import { persianTitleFallback } from "./title-localization";

const TRANSLATION_REVALIDATE = 60 * 60 * 24 * 30;
const MAX_SEGMENT_BYTES = 450;
let proxyAgent: ProxyAgent | undefined;

interface MyMemoryResponse {
  responseStatus?: number;
  responseData?: {
    translatedText?: string;
  };
}

export function containsPersian(text: string) {
  return /[\u0600-\u06ff]/.test(text);
}

function decodeEntities(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
  };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith("#")) {
      const hex = entity[1]?.toLowerCase() === "x";
      const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return named[entity.toLowerCase()] || match;
  });
}

function splitForTranslation(text: string) {
  const encoder = new TextEncoder();
  const words = text.trim().split(/\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (encoder.encode(candidate).length <= MAX_SEGMENT_BYTES) {
      current = candidate;
      continue;
    }
    if (current) chunks.push(current);
    current = word;
  }
  if (current) chunks.push(current);
  return chunks.slice(0, 6);
}

async function translateSegment(segment: string) {
  const endpoint = new URL("https://api.mymemory.translated.net/get");
  endpoint.searchParams.set("q", segment);
  endpoint.searchParams.set("langpair", "en|fa");
  endpoint.searchParams.set("mt", "1");
  const email = process.env.PERSIAN_TRANSLATION_EMAIL?.trim();
  if (email) endpoint.searchParams.set("de", email);

  const proxyUrl = process.env.OUTBOUND_PROXY_URL?.trim();
  proxyAgent ||= proxyUrl ? new ProxyAgent(proxyUrl) : undefined;
  const response = proxyAgent
    ? await undiciFetch(endpoint, {
        headers: { accept: "application/json" },
        dispatcher: proxyAgent,
        signal: AbortSignal.timeout(8000),
      })
    : await fetch(endpoint, {
        headers: { accept: "application/json" },
        next: { revalidate: TRANSLATION_REVALIDATE },
        signal: AbortSignal.timeout(8000),
      });
  if (!response.ok) throw new Error(`Translation service returned ${response.status}`);
  const payload = (await response.json()) as MyMemoryResponse;
  if (payload.responseStatus && payload.responseStatus >= 400) {
    throw new Error(`Translation service returned ${payload.responseStatus}`);
  }
  return decodeEntities(payload.responseData?.translatedText?.trim() || "");
}

export async function translateToPersian(text: string | null | undefined) {
  const normalized = text?.trim() || "";
  if (!normalized || containsPersian(normalized) || process.env.PERSIAN_TRANSLATION_ENABLED === "false") {
    return normalized;
  }
  try {
    const translated = await Promise.all(splitForTranslation(normalized).map(translateSegment));
    const result = translated.filter(Boolean).join(" ").trim();
    return result && containsPersian(result) ? result : normalized;
  } catch {
    return normalized;
  }
}

export async function translateTitleToPersian(title: string | null | undefined) {
  const normalized = title?.trim() || "";
  const translated = await translateToPersian(normalized);
  return /[A-Za-z]/.test(translated) ? persianTitleFallback(translated) : translated || normalized;
}
