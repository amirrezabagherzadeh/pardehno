import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = { title: "حقوق محتوا" };
export default function CopyrightPage() {
  return <LegalPage eyebrow="حقوق و انتساب" title="حقوق محتوا و گزارش" intro="پرده‌نو مالک داده‌ها و آثار هنری طرف‌های ثالث نیست و از نشانه یا کد اختصاصی سرویس‌های دیگر استفاده نمی‌کند." sections={[
    { title: "انتساب TMDB", body: "این محصول از API و تصاویر TMDB استفاده می‌کند، اما توسط TMDB تأیید یا پشتیبانی نشده است." },
    { title: "ارائه‌دهندگان تماشا", body: "اطلاعات دسترس‌پذیری قانونی به داده‌های TMDB/JustWatch متکی است و ممکن است برای ایران خالی باشد. هیچ منطقه جایگزینی به‌صورت گمراه‌کننده نشان داده نمی‌شود." },
    { title: "گزارش محتوا", body: "کانال تماس عمومی هنوز پیکربندی نشده است. تا پیش از فعال‌شدن کانال رسمی، هیچ اطلاعات شخصی یا مدرکی را در نظرهای محلی وارد نکنید." },
  ]} />;
}
