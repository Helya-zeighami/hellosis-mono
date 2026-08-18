import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function MatchSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="h-full">
          <CardContent className="flex h-full flex-col gap-4">
            <div className="flex items-start gap-4">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex w-full flex-col gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
