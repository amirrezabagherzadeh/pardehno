export const siteConfig = {
  name: "پرده‌نو",
  latinName: "Pardeh No",
  description:
    "مرجع فارسی کشف فیلم و سریال؛ با اطلاعات، تریلرها و راه‌های تماشای قانونی.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  nav: [
    { href: "/", label: "خانه" },
    { href: "/movies", label: "فیلم‌ها" },
    { href: "/tv", label: "سریال‌ها" },
    { href: "/top", label: "برترین‌ها" },
    { href: "/movies?sort=primary_release_date.desc", label: "تازه‌ها" },
  ],
} as const;

export const legalNav = [
  { href: "/about", label: "درباره ما" },
  { href: "/privacy", label: "حریم خصوصی" },
  { href: "/terms", label: "شرایط استفاده" },
  { href: "/copyright", label: "حقوق محتوا" },
] as const;
