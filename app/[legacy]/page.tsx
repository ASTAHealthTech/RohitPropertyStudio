import { notFound, permanentRedirect } from "next/navigation";
import { legacyPaths, posts, projectBySlug } from "../lib/catalog";

/**
 * Old 100yards.in addresses. The WordPress site served every project at
 * /<slug>/ — those now live at /projects/<slug>, and Google ranking follows a
 * permanent redirect. Anything unknown is a normal 404.
 */
export default async function LegacyPage({ params }: { params: Promise<{ legacy: string }> }) {
  const { legacy } = await params;
  const slug = legacy.toLowerCase();
  if (projectBySlug(slug)) permanentRedirect(`/projects/${slug}`);
  if (legacyPaths[slug]) permanentRedirect(legacyPaths[slug]);
  // Guides keep their old address until the article bodies are moved over.
  if (posts.some((post) => post.slug === slug)) permanentRedirect("/blog");
  notFound();
}
