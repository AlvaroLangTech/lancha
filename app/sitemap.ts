import type { MetadataRoute } from "next";

const routes = [
  "",
  "/passeio-de-lancha-brasilia",
  "/passeio-lago-paranoa",
  "/a-lancha",
  "/seguranca-e-regras",
  "/perguntas-frequentes",
  "/clube",
  "/tour-360",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date("2026-07-31"),
  }));
}
