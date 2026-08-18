import { Badge } from "@/components/ui/badge"

export function InterestBadge({
  name,
  shared,
}: {
  name: string
  shared?: boolean
}) {
  return (
    <Badge
      variant={shared ? "default" : "secondary"}
      className="rounded-full px-2.5 py-1"
    >
      {name}
    </Badge>
  )
}
