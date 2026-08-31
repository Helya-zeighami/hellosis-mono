"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function PlaceSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pb-24 pt-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20 rounded-xl" />
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>
    </div>
  )
}
