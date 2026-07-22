import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="pt-20">
      <Skeleton className="h-[55vh] w-full rounded-none bg-white/5" />
      <div className="page-container space-y-8 py-10">
        {[0, 1].map((row) => (
          <div key={row}>
            <Skeleton className="mb-5 h-7 w-48 bg-white/5" />
            <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <Skeleton key={item} className="aspect-[2/3] rounded-lg bg-white/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
