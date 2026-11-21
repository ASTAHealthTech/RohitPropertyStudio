/* eslint-disable @next/next/no-img-element */
import { BadgeCheck, MapPin } from "lucide-react";
import type { ProjectLite } from "../../lib/catalog";

/**
 * Catalogue photos are small pre-sized WebP files, so they are served as plain
 * <img> — no image-transform quota is spent on them.
 */
export function ProjectCard({ project, eager = false }: { project: ProjectLite; eager?: boolean }) {
  return (
    <a className="pcard" href={`/projects/${project.slug}`}>
      <span className="pcard__media">
        {project.cover ? (
          <img src={project.cover.src} alt={`${project.name} by ${project.dev}`} width={project.cover.w} height={project.cover.h} loading={eager ? "eager" : "lazy"} decoding="async" />
        ) : (
          <span className="pcard__blank" aria-hidden="true">100<i>YARDS</i></span>
        )}
        <span className="pcard__kind">{project.kind}</span>
      </span>
      <span className="pcard__body">
        <span className="pcard__dev">{project.dev}</span>
        <strong className="pcard__name">{project.name}</strong>
        <span className="pcard__loc"><MapPin size={13} aria-hidden="true" /> {project.loc}</span>
        <span className="pcard__foot">
          <span className="pcard__price">{project.price.replace(/\*/g, "")}</span>
          {project.rera && <span className="pcard__rera"><BadgeCheck size={13} aria-hidden="true" /> RERA no. listed</span>}
        </span>
      </span>
    </a>
  );
}
