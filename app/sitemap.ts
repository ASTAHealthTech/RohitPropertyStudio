import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { areas, builders, hasArticle, posts, projects } from "./lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly") => ({ url: `${origin}${path}`, lastModified: now, changeFrequency, priority });
  return [
    page("", 1, "weekly"),
    page("/projects", 0.9, "daily"),
    page("/compare", 0.6, "weekly"),
    page("/areas", 0.8, "weekly"),
    page("/builders", 0.7, "weekly"),
    page("/reports", 0.8, "monthly"),
    ...areas.map((a) => page(`/areas/${a.slug}`, 0.8, "weekly")),
    ...projects.map((p) => page(`/projects/${p.slug}`, 0.7, "weekly")),
    ...builders.map((b) => page(`/builders/${b.slug}`, 0.6, "weekly")),
    ...posts.filter((p) => hasArticle(p.slug)).map((p) => page(`/blog/${p.slug}`, 0.6, "monthly")),
    ...["/about", "/rohitt", "/commercial", "/nri", "/contact", "/learn", "/datalab", "/lab", "/course", "/resources", "/blog", "/stories", "/gallery"].map((path) => page(path, 0.5, "monthly")),
    ...["/privacy", "/terms", "/refund", "/disclaimer"].map((path) => page(path, 0.2, "monthly")),
  ];
}
