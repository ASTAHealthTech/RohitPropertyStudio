import { notFound, permanentRedirect } from "next/navigation";
import { projectBySlug } from "../../lib/catalog";

/** Old 100yards.in address for a project. Sends visitors and Google to the new project page. */
export default async function OldProjectAddress({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (projectBySlug(slug.toLowerCase())) permanentRedirect(`/projects/${slug.toLowerCase()}`);
  notFound();
}
