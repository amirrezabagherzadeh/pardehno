export interface LocalComment {
  id: string;
  name: string;
  body: string;
  rating: number;
  spoiler: boolean;
  helpful: boolean;
  createdAt: string;
  updatedAt?: string;
}

export function validateComment(input: Pick<LocalComment, "name" | "body" | "rating">) {
  const errors: Record<string, string> = {};
  const name = input.name.trim();
  const body = input.body.trim();
  if (name.length < 2 || name.length > 40) errors.name = "نام باید بین ۲ تا ۴۰ نویسه باشد.";
  if (body.length < 10 || body.length > 1000) errors.body = "نظر باید بین ۱۰ تا ۱۰۰۰ نویسه باشد.";
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) errors.rating = "امتیاز معتبر نیست.";
  return errors;
}
