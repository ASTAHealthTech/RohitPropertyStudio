"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";

/**
 * WhatsApp mark for contact buttons. Shows the official file at
 * /brand/whatsapp.svg (download it from WhatsApp's brand page; do not redraw
 * it). Until that file exists, a plain chat icon stands in.
 */
export function WaIcon({ size = 22 }: { size?: number }) {
  const [missing, setMissing] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // The file can fail before React attaches onError, so check once on mount.
    const img = ref.current;
    if (!img) return;
    const check = () => { if (img.complete && img.naturalWidth === 0) setMissing(true); };
    check();
    img.addEventListener("error", check);
    return () => img.removeEventListener("error", check);
  }, []);

  if (missing) return <MessageCircle size={size} aria-hidden="true" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} className="wa-icon" src="/brand/whatsapp.svg" alt="" width={size} height={size} aria-hidden="true" />
  );
}
