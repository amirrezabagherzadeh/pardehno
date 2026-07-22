import { createServer } from "node:http";

const movies = [
  [693134, "تل‌ماسه: بخش دوم", "Dune: Part Two", "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg", "2024-02-27", 8.2, [878, 12]],
  [872585, "اوپنهایمر", "Oppenheimer", "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg", "2023-07-19", 8.1, [18, 36]],
  [823464, "گودزیلا و کونگ: امپراتوری جدید", "Godzilla x Kong: The New Empire", "/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg", "/j3Z3XktmWB1VhsS8iXNcrR86PXi.jpg", "2024-03-27", 7.1, [28, 878]],
  [653346, "پادشاهی سیاره میمون‌ها", "Kingdom of the Planet of the Apes", "/gKkl37BQuKTanygYQG1pyYgLVgf.jpg", "/fqv8v6AycXKsivp1T5yKtLbGXce.jpg", "2024-05-08", 7.2, [878, 12]],
  [1022789, "درون و بیرون ۲", "Inside Out 2", "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg", "/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg", "2024-06-11", 7.6, [16, 10751]],
  [786892, "فیوریوسا", "Furiosa: A Mad Max Saga", "/iADOJ8Zymht2JPMoy3R7xceZprc.jpg", "/wNAhuOZ3Zf84jCIlrcI6JhgmY5q.jpg", "2024-05-22", 7.5, [28, 12]],
  [533535, "ددپول و ولورین", "Deadpool & Wolverine", "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", "/dvBCdCohwWbsP5qAaglOXagDMtk.jpg", "2024-07-24", 7.7, [28, 35]],
  [76600, "آواتار: راه آب", "Avatar: The Way of Water", "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg", "/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg", "2022-12-14", 7.6, [878, 12]],
  [569094, "مرد عنکبوتی: در میان دنیای عنکبوتی", "Spider-Man: Across the Spider-Verse", "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", "/8rpDcsfLJypbO6vREc0547VKqEv.jpg", "2023-05-31", 8.4, [16, 28]],
];

const shows = [
  [126308, "شوگون", "Shōgun", "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg", "2024-02-27", 8.5, [18, 10768]],
  [94997, "خاندان اژدها", "House of the Dragon", "/t9XkeE7HzOsdQcDDDapDYh8Rrmt.jpg", "/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg", "2022-08-21", 8.4, [10765, 18]],
  [100088, "آخرین بازمانده از ما", "The Last of Us", "/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg", "/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg", "2023-01-15", 8.6, [18, 10765]],
  [95396, "جداسازی", "Severance", "/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg", "/4YnAZ1KO9goeKiiWzH5owzQej1x.jpg", "2022-02-17", 8.4, [18, 9648]],
  [1396, "بریکینگ بد", "Breaking Bad", "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg", "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg", "2008-01-20", 8.9, [18, 80]],
];

const overview = "روایتی پرکشش از انتخاب‌های دشوار، پیوندهای انسانی و جهانی که در آستانه تغییر قرار گرفته است؛ داستانی سینمایی با شخصیت‌هایی ماندگار.";
const makeMedia = (row, mediaType) => ({
  id: row[0],
  media_type: mediaType,
  ...(mediaType === "movie" ? { title: row[1], original_title: row[2], release_date: row[5] } : { name: row[1], original_name: row[2], first_air_date: row[5] }),
  overview,
  poster_path: row[3],
  backdrop_path: row[4],
  vote_average: row[6],
  vote_count: 8400 + row[0] % 5000,
  popularity: 500 - row[0] % 120,
  genre_ids: row[7],
  original_language: "en",
  adult: false,
});
const movieItems = movies.map((row) => makeMedia(row, "movie"));
const tvItems = shows.map((row) => makeMedia(row, "tv"));
const page = (results) => ({ page: 1, results, total_pages: 12, total_results: results.length * 12 });
const genres = [
  { id: 28, name: "اکشن" }, { id: 12, name: "ماجراجویی" }, { id: 16, name: "انیمیشن" },
  { id: 35, name: "کمدی" }, { id: 18, name: "درام" }, { id: 878, name: "علمی‌تخیلی" },
  { id: 10765, name: "علمی‌تخیلی و فانتزی" }, { id: 10768, name: "جنگ و سیاست" }, { id: 9648, name: "معمایی" },
];
const cast = [
  { id: 1190668, name: "تیموتی شالامی", character: "پل اتریدیز", profile_path: "/BE2sdjpgsa2rNTFa66f7upkaOP.jpg" },
  { id: 505710, name: "زندایا", character: "چانی", profile_path: "/3WdOloHpjtjL96uVOhFRRCcYSwq.jpg" },
  { id: 933238, name: "ربکا فرگوسن", character: "جسیکا", profile_path: "/lJloTOheuQSirSLXNA3JHsrMNfH.jpg" },
];
const crew = [{ id: 137427, name: "دنی ویلنوو", job: "Director", department: "Directing" }];
const videos = { results: [{ id: "trailer", key: "Way9Dexny3w", name: "تریلر رسمی", site: "YouTube", type: "Trailer", official: true, iso_639_1: "en" }] };

function detailFor(item, type) {
  const isMovie = type === "movie";
  return {
    ...item,
    genres: genres.filter((genre) => item.genre_ids.includes(genre.id)),
    tagline: "قدرت، سرنوشت و آینده در یک قاب",
    status: isMovie ? "منتشر شده" : "در حال پخش",
    runtime: isMovie ? 166 : undefined,
    episode_run_time: isMovie ? undefined : [58],
    budget: isMovie ? 190000000 : undefined,
    revenue: isMovie ? 714000000 : undefined,
    number_of_seasons: isMovie ? undefined : 2,
    number_of_episodes: isMovie ? undefined : 20,
    production_companies: [{ id: 1, name: "Legendary Pictures" }],
    production_countries: [{ iso_3166_1: "US", name: "ایالات متحده" }],
    spoken_languages: [{ iso_639_1: "en", english_name: "English", name: "انگلیسی" }],
    credits: { cast, crew }, aggregate_credits: { cast, crew }, videos,
    images: { backdrops: [item.backdrop_path, movieItems[1].backdrop_path, movieItems[3].backdrop_path].map((file_path) => ({ file_path, width: 1920, height: 1080, aspect_ratio: 1.778 })), posters: [], logos: [] },
    recommendations: page(isMovie ? movieItems.slice(1) : tvItems.slice(1)),
    similar: page(isMovie ? movieItems.slice().reverse() : tvItems.slice().reverse()),
    "watch/providers": { results: { IR: {} } },
    release_dates: isMovie ? { results: [{ iso_3166_1: "US", release_dates: [{ certification: "PG-13", type: 3 }] }] } : undefined,
    content_ratings: isMovie ? undefined : { results: [{ iso_3166_1: "US", rating: "TV-MA" }] },
    seasons: isMovie ? undefined : [1, 2].map((n) => ({ id: item.id * 10 + n, name: `فصل ${n}`, season_number: n, episode_count: 10, air_date: item.first_air_date, poster_path: item.poster_path, overview })),
  };
}

function seasonFor(id, seasonNumber) {
  const tv = tvItems.find((item) => item.id === id) || tvItems[0];
  return {
    id: id * 10 + seasonNumber, name: `فصل ${seasonNumber}`, season_number: seasonNumber,
    overview, air_date: tv.first_air_date, poster_path: tv.poster_path,
    episodes: Array.from({ length: 8 }, (_, index) => ({ id: id * 100 + index, episode_number: index + 1, name: `قسمت ${index + 1}`, overview, air_date: tv.first_air_date, runtime: 58, still_path: tv.backdrop_path, vote_average: 8.1 })),
    aggregate_credits: { cast, crew }, videos, images: { backdrops: [], posters: [], logos: [] },
  };
}

function responseFor(url) {
  const path = url.pathname.replace(/^\/\d+/, "");
  if (path === "/genre/movie/list" || path === "/genre/tv/list") return { genres };
  if (path === "/search/multi") return page([...movieItems.slice(0, 5), ...tvItems.slice(0, 3), { id: 1190668, media_type: "person", name: "تیموتی شالامی", known_for_department: "Acting", profile_path: "/BE2sdjpgsa2rNTFa66f7upkaOP.jpg", known_for: movieItems.slice(0, 2), popularity: 100 }]);
  const seasonMatch = path.match(/^\/tv\/(\d+)\/season\/(\d+)$/);
  if (seasonMatch) return seasonFor(Number(seasonMatch[1]), Number(seasonMatch[2]));
  const detailMatch = path.match(/^\/(movie|tv)\/(\d+)$/);
  if (detailMatch) {
    const type = detailMatch[1]; const id = Number(detailMatch[2]);
    const item = (type === "movie" ? movieItems : tvItems).find((entry) => entry.id === id) || (type === "movie" ? movieItems[0] : tvItems[0]);
    return detailFor(item, type);
  }
  const videoMatch = path.match(/^\/(movie|tv)\/(\d+)\/videos$/);
  if (videoMatch) return videos;
  if (path.startsWith("/person/")) return { id: 1190668, name: "تیموتی شالامی", biography: "بازیگر آمریکایی و نامزد جوایز معتبر سینمایی که با نقش‌آفرینی‌های متفاوت شناخته می‌شود.", birthday: "1995-12-27", place_of_birth: "نیویورک، آمریکا", profile_path: "/BE2sdjpgsa2rNTFa66f7upkaOP.jpg", known_for_department: "Acting", images: { profiles: [] }, combined_credits: { cast: movieItems, crew: [] } };
  if (path.startsWith("/tv") || path === "/discover/tv") return page(tvItems);
  if (path === "/trending/all/week") return page([movieItems[0], tvItems[0], ...movieItems.slice(1), ...tvItems.slice(1)]);
  return page(movieItems);
}

createServer((request, response) => {
  const url = new URL(request.url || "/", "http://127.0.0.1:4010");
  response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(responseFor(url)));
}).listen(4010, "127.0.0.1", () => console.log("TMDB fixture server ready on 4010"));
