"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

/**
 * Appears once the visitor has passed the first screen. On a project page it
 * jumps to that project's enquiry form; everywhere else it asks for a call back.
 */
export function StickyCta() {
  const [shown, setShown] = useState(false);
  const pathname = usePathname();
  const onProject = /^\/projects\/[^/]+/.test(pathname);
  const hidden = pathname === "/desk" || pathname.startsWith("/enquire");

  useEffect(() => {
    const onScroll = () => {
      const passedHero = window.scrollY > window.innerHeight * 0.9;
      const distanceToEnd = document.body.scrollHeight - (window.scrollY + window.innerHeight);
      // Stand down once the closing call to action and footer are on screen.
      setShown(passedHero && distanceToEnd > window.innerHeight * 1.35);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (hidden) return null;
  return (
    <a
      className={`sticky-cta${shown ? " is-shown" : ""}`}
      href={onProject ? "#enquire" : "/contact#callback"}
      data-track={onProject ? "project_enquire_cta" : "callback_cta"}
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
    >
      {onProject ? "Get price & plans" : "Request a call back"} <ArrowUpRight size={15} aria-hidden="true" />
    </a>
  );
}
