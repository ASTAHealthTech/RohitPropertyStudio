import type { Metadata } from "next";
import { DeskClient } from "../components/leads/DeskClient";

export const metadata: Metadata = { title: "Lead desk", robots: { index: false, follow: false } };

/** Private, unlinked, noindex. The data sits behind the team key (see /api/desk). */
export default function DeskPage() {
  return (
    <main id="main-content" className="deskpage">
      <div className="shell"><DeskClient /></div>
    </main>
  );
}
