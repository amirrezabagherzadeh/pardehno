import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = { title: "حریم خصوصی" };
export default function PrivacyPage() {
  return <LegalPage eyebrow="قوانین" title="حریم خصوصی" intro="پرده‌نو با اصل کمینه‌سازی داده ساخته شده است. این متن وضعیت نسخه محلی فعلی را توضیح می‌دهد." sections={[
    { title: "داده‌های محلی", body: "فهرست من، اخیراً مشاهده‌شده، جستجوهای اخیر، نظرها و ترجیحات در Local Storage مرورگر ذخیره می‌شوند. این داده‌ها به سرور پرده‌نو ارسال نمی‌شوند." },
    { title: "درخواست‌های بیرونی", body: "برای دریافت فراداده از TMDB و برای پخش تریلر از دامنه امن YouTube Nocookie استفاده می‌شود. سیاست‌های حریم خصوصی این سرویس‌ها مستقل است." },
    { title: "کنترل شما", body: "با پاک‌کردن داده‌های سایت از تنظیمات مرورگر می‌توانید تمام اطلاعات محلی پرده‌نو را حذف کنید." },
  ]} />;
}
