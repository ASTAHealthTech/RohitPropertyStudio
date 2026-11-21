"use client";

/**
 * The first-visit opening: a measure runs out, the count climbs to one hundred,
 * and the screen parts like a curtain onto the hero film. About four seconds,
 * once per browser, never again.
 *
 * It is skipped outright — the markup stays hidden — when the visitor:
 *   - has seen it before (localStorage flag),
 *   - prefers reduced motion or has Save-Data on,
 *   - arrived from an ad (utm_, gclid or fbclid in the address).
 * The decision is made by the inline script before first paint, so there is no
 * flash of the page underneath. Pure CSS animation; MotionLayer holds the hero
 * entrance until the curtain parts (see `hold` there).
 */
const decide = `(function(){try{var d=document.documentElement,c=navigator.connection;if(localStorage.getItem('hy_opened')||matchMedia('(prefers-reduced-motion: reduce)').matches||(c&&c.saveData)||/[?&](utm_|gclid|fbclid)/.test(location.search))return;localStorage.setItem('hy_opened','1');d.classList.add('opening-on');setTimeout(function(){d.classList.add('opening-out')},2500);setTimeout(function(){d.classList.remove('opening-on','opening-out')},3900);}catch(e){}})();`;

export function OpeningSequence() {
  const skip = () => document.documentElement.classList.remove("opening-on", "opening-out");
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: decide }} />
      <div className="opening" role="presentation">
        <span className="opening__half opening__half--top" aria-hidden="true" />
        <span className="opening__half opening__half--bottom" aria-hidden="true" />
        <div className="opening__mid" aria-hidden="true">
          <span className="opening__num" />
          <span className="opening__rule" />
          <span className="opening__word">Yards</span>
        </div>
        <button type="button" className="opening__skip" onClick={skip}>Skip intro</button>
      </div>
    </>
  );
}
