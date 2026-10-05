import type { MetadataRoute } from "next";

const routes = [
  "",
  "/about",
  "/contact",
  "/projects",
  "/events",
  "/publications",
  "/free-courses",
  "/volunteer-program",
  "/career",
  "/donations",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.combinefoundation.org";

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date("2026-08-25"),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
