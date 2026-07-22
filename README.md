# پرده‌نو — Persian RTL Movie Discovery

پرده‌نو یک وب‌اپ کامل و واکنش‌گرا برای کشف فیلم و سریال است. رابط کاربری از ابتدا برای زبان فارسی و جهت راست‌به‌چپ طراحی شده و اطلاعات واقعی را از TMDB دریافت می‌کند.

> این پروژه سرویس پخش ویدئو نیست. دکمه‌های «تماشای تریلر» فقط ویدئوهای رسمی YouTube ثبت‌شده در TMDB را نمایش می‌دهند.

## راه‌اندازی

نیازمندی‌ها: Node.js 20 یا جدیدتر و یک کلید TMDB.

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

سپس `http://localhost:3000` را باز کنید. یکی از دو روش احراز هویت TMDB کافی است:

```dotenv
# پیشنهادشده: TMDB Read Access Token
TMDB_READ_ACCESS_TOKEN=

# یا TMDB v3 API Key
TMDB_API_KEY=

TMDB_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

توکن‌ها فقط در Server Components و Route Handlers استفاده می‌شوند و به کد مرورگر راه پیدا نمی‌کنند.

اگر اتصال Node.js در شبکه شما از پراکسی سیستم عبور نمی‌کند، `OUTBOUND_PROXY_URL` را با نشانی پراکسی HTTP(S) تنظیم کنید؛ این مقدار نیز فقط در سرور خوانده می‌شود.

پرده‌نو داده‌های فهرست و جزئیات را هم‌زمان با زبان‌های `fa-IR` و `en-US` از TMDB می‌گیرد. ترجمه رسمی فارسی TMDB در اولویت است؛ اگر توضیح فارسی موجود نباشد، متن انگلیسی TMDB به‌صورت server-side و cache‌شده به فارسی ترجمه می‌شود. این رفتار با `PERSIAN_TRANSLATION_ENABLED=false` قابل غیرفعال‌کردن است.

## فرمان‌ها

```bash
npm run dev          # سرور توسعه
npm run build        # بیلد production
npm run start        # اجرای production build
npm run lint         # ESLint
npm run typecheck    # تولید route types و بررسی TypeScript
npm test             # تست‌های واحد Vitest
npm run test:e2e     # تست‌های Playwright دسکتاپ و موبایل
npm run test:e2e:states # حالت‌های empty/loading/error و تعامل‌ها
npm run test:e2e:live # اجرای smoke test روی TMDB زنده
npm run screenshots  # تصاویر مرجع مسیرهای اصلی
```

تست‌های پیش‌فرض Playwright از یک سرور محلی سازگار با قرارداد TMDB استفاده می‌کنند تا نتیجه‌ها قطعی و مستقل از محدودیت شبکه باشند. فرمان `test:e2e:live` همان مسیرهای اصلی را با اعتبارنامه واقعی `.env.local` بررسی می‌کند.

## مسیرها

- `/` — هوم سینمایی، عنوان ویژه و ردیف‌های محتوایی
- `/movies` و `/tv` — مرور و فیلتر بر اساس ژانر، سال، امتیاز، رأی و زبان
- `/genre/[genreId]/[slug]` — صفحه ژانر
- `/movie/[id]/[slug]` و `/tv/[id]/[slug]` — جزئیات کامل، عوامل، گالری و پیشنهادها
- `/tv/[id]/season/[seasonNumber]` — فصل و قسمت‌ها
- `/person/[id]/[slug]` — بیوگرافی و آثار شخص
- `/search` — جستجوی فیلم، سریال و افراد
- `/watchlist` و `/recently-viewed` — داده‌های محلی کاربر
- `/about`، `/privacy`، `/terms` و `/copyright` — صفحات اطلاعاتی و حقوقی

## معماری

- Next.js App Router + TypeScript strict + Tailwind CSS 4
- کامپوننت‌های Radix/shadcn با `DirectionProvider` راست‌به‌چپ
- لایه TMDB در `src/lib/tmdb` با خطاهای تایپ‌شده، کش قابل بازاعتبارسنجی و ادغام داده فارسی/انگلیسی
- Server Components برای واکشی اولیه؛ Client Components فقط برای جستجوی آنی، دیالوگ‌ها و وضعیت محلی
- `localStorage` برای فهرست من، موارد اخیر، عبارت‌های جستجو و دیدگاه‌ها
- متادیتای پویا، canonical URL، Open Graph و صفحات loading/error/not-found
- فونت Vazirmatn به‌صورت self-hosted برای بیلد مستقل از شبکه Google Fonts

## رفتار داده و خطا

- فهرست‌ها و جزئیات TMDB با TTL کش می‌شوند؛ جستجو `no-store` است.
- ترجمه فارسی TMDB در اولویت است؛ توضیحات انگلیسی ناقص با سرویس ترجمه عمومی MyMemory به فارسی برگردان و برای ۳۰ روز cache می‌شوند.
- مسیرهای `/movies` و `/tv` از Discover API واقعی TMDB، فیلتر کشور/زبان/ژانر/سال/رده خانوادگی و صفحه‌بندی تا سقف رسمی ۵۰۰ صفحه استفاده می‌کنند.
- تریلرها فقط از نتیجه‌های YouTube ثبت‌شده در TMDB انتخاب می‌شوند و ویدئوهای رسمی و نوع `Trailer` در اولویت هستند.
- خطای پیکربندی، محدودیت نرخ، شبکه و پاسخ نامعتبر به خطاهای کاربرپسند تبدیل می‌شود.
- آیتم بدون تصویر از دارایی محلی `public/images/fallback-poster.png` استفاده می‌کند.

## محدودیت‌های عمدی

- ورود کاربر و همگام‌سازی ابری وجود ندارد؛ داده‌های شخصی همین مرورگر نگه‌داری می‌شوند.
- دیدگاه‌ها محلی هستند و به سرور ارسال نمی‌شوند.
- دسترس‌پذیری و طراحی برای اندازه‌های 320px تا دسکتاپ عریض بررسی شده، اما کیفیت تصویر به داده TMDB وابسته است.

## اعتبار محتوا

This product uses the TMDB API but is not endorsed or certified by TMDB. پوسترها، تصاویر، اطلاعات عوامل و ویدئوها متعلق به صاحبان حقوق مربوطه هستند.
