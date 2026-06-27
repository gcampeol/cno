import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border" />
      <div className="h-12 border-b border-border" />
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Skeleton className="h-[420px]" />
          <div className="space-y-6">
            <Skeleton className="h-[240px]" />
            <Skeleton className="h-[360px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
