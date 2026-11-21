import { ArrowUpRight } from "lucide-react";
import { AmbientBackdrop } from "./components/AmbientBackdrop";

export default function NotFound() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <AmbientBackdrop />
        <div className="shell notfound">
          <p className="eyebrow" data-enter>404</p>
          <h1 data-split>That address is not on our map.</h1>
          <p data-enter>The page may have moved when the site was rebuilt. Start from the projects, or ask us to find it for you.</p>
          <a className="button button--gold" href="/projects" data-enter>Browse projects <ArrowUpRight size={16} aria-hidden="true" /></a>
        </div>
      </section>
    </main>
  );
}
