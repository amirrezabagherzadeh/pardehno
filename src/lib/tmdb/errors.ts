export type TmdbErrorCode =
  | "configuration"
  | "authentication"
  | "not-found"
  | "rate-limit"
  | "network"
  | "upstream";

export class TmdbError extends Error {
  constructor(
    message: string,
    public readonly code: TmdbErrorCode,
    public readonly status = 500,
  ) {
    super(message);
    this.name = "TmdbError";
  }
}

export function safeTmdbMessage(error: unknown): string {
  if (!(error instanceof TmdbError)) {
    return "در دریافت اطلاعات مشکلی پیش آمد. لطفاً دوباره تلاش کنید.";
  }
  if (error.code === "rate-limit") {
    return "تعداد درخواست‌ها زیاد شده است. کمی بعد دوباره تلاش کنید.";
  }
  if (error.code === "not-found") return "محتوای درخواستی پیدا نشد.";
  if (error.code === "configuration") {
    return "اتصال به سرویس اطلاعات فیلم هنوز پیکربندی نشده است.";
  }
  return "در دریافت اطلاعات از TMDB مشکلی پیش آمد. لطفاً دوباره تلاش کنید.";
}
