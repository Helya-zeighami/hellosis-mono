"use client"

import { ProgressProvider } from "@bprogress/next/app"

export function NavigationProgress({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider
      height="3px"
      color="oklch(0.51 0.19 13)"
      options={{
        showSpinner: false,
        trickle: true,
        trickleSpeed: 180,
        minimum: 0.12,
      }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  )
}
