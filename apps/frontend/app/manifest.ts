import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hellosis",
    short_name: "Hellosis",
    description: "Discover people, places and events around you.",
    start_url: "/en",
    scope: "/",
    display: "standalone",
    background_color: "#fff7f7",
    theme_color: "#f43f5e",
    orientation: "portrait",
    categories: ["social", "lifestyle"],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
