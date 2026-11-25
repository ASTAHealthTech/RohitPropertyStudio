/**
 * Catalogue photos come in two files: the full one (up to 1920px wide) and,
 * when the full one is wider than 900px, a phone-sized `-s` copy 800px wide.
 * Both are written by tools/import-100yards (see CLAUDE.md, "Photo quality").
 */
export function photoSet(img: { src: string; w: number }, sizes: string) {
  if (img.w <= 900) return {};
  return { srcSet: `${img.src.replace(/\.webp$/, "-s.webp")} 800w, ${img.src} ${img.w}w`, sizes };
}
