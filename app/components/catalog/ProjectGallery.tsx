/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Img } from "../../lib/catalog";
import { photoSet } from "../../lib/catalog/photo";

/** Photo strip that opens a full-screen viewer. Keyboard: arrows and Escape. */
export function ProjectGallery({ images, name }: { images: Img[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const step = useCallback((delta: number) => setOpen((i) => (i === null ? i : (i + delta + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.classList.add("is-locked");
    window.addEventListener("keydown", onKey);
    return () => { document.body.classList.remove("is-locked"); window.removeEventListener("keydown", onKey); };
  }, [open, step]);

  if (images.length < 2) return null;
  return (
    <>
      <div className="pgallery" data-reveal-group>
        {images.slice(1).map((img, i) => (
          <button type="button" className="pgallery__item" key={img.src} onClick={() => setOpen(i + 1)} aria-label={`Open photo ${i + 2} of ${images.length}`}>
            <img src={img.src} {...photoSet(img, "(max-width: 700px) 92vw, 300px")} alt={`${name}, view ${i + 2}`} width={img.w} height={img.h} loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
      {open !== null && (
        <div className="pviewer" role="dialog" aria-modal="true" aria-label={`${name} photos`}>
          <button type="button" className="pviewer__close" onClick={() => setOpen(null)} aria-label="Close"><X aria-hidden="true" /></button>
          <button type="button" className="pviewer__nav pviewer__nav--prev" onClick={() => step(-1)} aria-label="Previous photo"><ChevronLeft aria-hidden="true" /></button>
          <img src={images[open].src} alt={`${name}, view ${open + 1}`} width={images[open].w} height={images[open].h} />
          <button type="button" className="pviewer__nav pviewer__nav--next" onClick={() => step(1)} aria-label="Next photo"><ChevronRight aria-hidden="true" /></button>
          <p className="pviewer__count">{open + 1} / {images.length}</p>
        </div>
      )}
    </>
  );
}
