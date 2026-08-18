export const queryKeys = {
  users: {
    all: ["users"] as const,
    me: ["users", "me"] as const,
    detail: (id: string) => ["users", id] as const,
  },
  profiles: {
    all: ["profiles"] as const,
    me: ["profiles", "me"] as const,
    detail: (id: string) => ["profiles", id] as const,
    byUserId: (userId: string) => ["profiles", "user", userId] as const,
  },
  cities: {
    all: ["cities"] as const,
    search: (query: string) => ["cities", "search", query] as const,
    detail: (id: string) => ["cities", id] as const,
  },
  interests: {
    all: ["interests"] as const,
    detail: (id: string) => ["interests", id] as const,
  },
  groups: {
    all: ["groups"] as const,
    detail: (id: string) => ["groups", id] as const,
    members: (groupId: string) => ["groups", groupId, "members"] as const,
    events: (groupId: string) => ["groups", groupId, "events"] as const,
    byCity: (cityId: string) => ["groups", "city", cityId] as const,
  },
  messages: {
    all: ["messages"] as const,
    conversation: (userId: string) => ["messages", "conversation", userId] as const,
    detail: (id: string) => ["messages", id] as const,
  },
  matches: {
    all: ["matches"] as const,
    recommendations: ["matches", "recommendations"] as const,
    requests: ["matches", "requests"] as const,
    detail: (id: string) => ["matches", id] as const,
  },
  events: {
    all: ["events"] as const,
    detail: (id: string) => ["events", id] as const,
    byCity: (cityId: string) => ["events", "city", cityId] as const,
  },
  places: {
    all: ["places"] as const,
    detail: (id: string) => ["places", id] as const,
    byCity: (cityId: string) => ["places", "city", cityId] as const,
  },
  reviews: {
    all: ["reviews"] as const,
    detail: (id: string) => ["reviews", id] as const,
    byPlace: (placeId: string) => ["reviews", "place", placeId] as const,
  },
  reports: {
    all: ["reports"] as const,
    detail: (id: string) => ["reports", id] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    unread: ["notifications", "unread"] as const,
    detail: (id: string) => ["notifications", id] as const,
  },
}
