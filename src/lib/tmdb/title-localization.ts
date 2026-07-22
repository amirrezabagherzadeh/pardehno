const knownTitles: Record<string, string> = {
  "project hail mary": "پروژه هیل مری",
  "mission: impossible": "مأموریت: غیرممکن",
  "the lord of the rings": "ارباب حلقه‌ها",
  "game of thrones": "بازی تاج‌وتخت",
  "breaking bad": "بریکینگ بد",
};

const knownWords: Record<string, string> = {
  a: "یک", an: "یک", and: "و", of: "از", the: "", project: "پروژه", hail: "هیل", mary: "مری",
  season: "فصل", episode: "قسمت", part: "بخش", chapter: "فصل", love: "عشق", night: "شب",
  day: "روز", last: "آخرین", first: "اولین", dead: "مرده", world: "دنیا", king: "پادشاه",
};

const letters: Record<string, string> = {
  a: "ا", b: "ب", c: "ک", d: "د", e: "", f: "ف", g: "گ", h: "ه", i: "ی", j: "ج",
  k: "ک", l: "ل", m: "م", n: "ن", o: "و", p: "پ", q: "ک", r: "ر", s: "س", t: "ت",
  u: "و", v: "و", w: "و", x: "کس", y: "ی", z: "ز",
};

function transliterateWord(word: string) {
  const normalized = word.toLowerCase()
    .replace(/tion/g, "شن")
    .replace(/sh/g, "ش")
    .replace(/ch/g, "چ")
    .replace(/kh/g, "خ")
    .replace(/gh/g, "غ")
    .replace(/zh/g, "ژ")
    .replace(/ph/g, "ف")
    .replace(/oo/g, "و")
    .replace(/ee|ea|ai|ay|ey/g, "ی")
    .replace(/ou|ow/g, "او");
  return [...normalized].map((character) => letters[character] || character).join("");
}

export function persianTitleFallback(title: string) {
  const normalized = title.trim();
  const exact = knownTitles[normalized.toLowerCase()];
  if (exact) return exact;
  return normalized.replace(/[A-Za-z]+/g, (word) => knownWords[word.toLowerCase()] ?? transliterateWord(word));
}
