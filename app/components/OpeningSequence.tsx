"use client";

/**
 * The first-visit opening: a gold line draws a skyline, a measure counts to
 * one hundred, the name settles, the curtain lifts onto the hero. About four
 * seconds, once per browser, never again.
 *
 * It is skipped outright — the markup stays hidden — when the visitor:
 *   - has seen it before (localStorage flag),
 *   - prefers reduced motion or has Save-Data on,
 *   - arrived from an ad (utm_, gclid or fbclid in the address).
 * The decision is made by the inline script before first paint, so there is no
 * flash of the page underneath. Pure CSS animation; MotionLayer holds the hero
 * entrance until the overlay lifts (see `hold` there).
 */
const decide = `(function(){try{var d=document.documentElement,c=navigator.connection;if(localStorage.getItem('hy_opened')||matchMedia('(prefers-reduced-motion: reduce)').matches||(c&&c.saveData)||/[?&](utm_|gclid|fbclid)/.test(location.search))return;localStorage.setItem('hy_opened','1');d.classList.add('opening-on');setTimeout(function(){d.classList.add('opening-out')},3600);setTimeout(function(){d.classList.remove('opening-on','opening-out')},4400);}catch(e){}})();`;

export function OpeningSequence() {
  const skip = () => document.documentElement.classList.remove("opening-on", "opening-out");
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: decide }} />
      <div className="opening" role="presentation">
        <svg className="opening__sky" viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength={1} d="M0,190 H70 V150 H110 V190 H150 V120 H170 V100 H190 V120 H210 V190 H260 V140 H310 V190 H350 V90 H365 V60 H380 V90 H395 V190 H450 V130 H470 V110 H520 V130 H540 V190 H590 V70 H600 V30 H610 V70 H640 V190 H700 V150 H740 V100 H790 V150 H810 V190 H860 V120 H880 V80 H900 V120 H920 V190 H980 V140 H1030 V190 H1070 V110 H1100 V190 H1200" />
        </svg>
        <div className="opening__mark" aria-hidden="true">
          <span className="opening__num" />
          <span className="opening__word">YARDS</span>
        </div>
        <span className="opening__rule" aria-hidden="true" />
        <p className="opening__line">Bangalore · Coimbatore · Dubai · Phuket</p>
        <button type="button" className="opening__skip" onClick={skip}>Skip intro</button>
      </div>
    </>
  );
}
