import { useEffect, useRef } from "react";
import { useSiteMotion } from "./MotionSystem";

/** A stationary grid revealed by a soft spotlight around a mouse pointer. */
export function HeroHoverGrid() {
  const layer = useRef(null);
  const { disabled } = useSiteMotion();

  useEffect(() => {
    const grid = layer.current;
    const hero = grid.parentElement;
    const hover = window.matchMedia(
      "(any-hover: hover) and (any-pointer: fine)",
    );
    let frame = 0;
    let point;

    function hide() {
      cancelAnimationFrame(frame);
      frame = 0;
      delete grid.dataset.visible;
    }
    function move(event) {
      if (disabled || !hover.matches || event.pointerType === "touch") {
        hide();
        return;
      }
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = hero.getBoundingClientRect();
        grid.style.setProperty("--grid-x", `${point.x - rect.left}px`);
        grid.style.setProperty("--grid-y", `${point.y - rect.top}px`);
        grid.dataset.visible = "true";
      });
    }

    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", hide);
    hero.addEventListener("pointercancel", hide);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", hide, { passive: true });
    hover.addEventListener("change", hide);
    return () => {
      hide();
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", hide);
      hero.removeEventListener("pointercancel", hide);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", hide);
      hover.removeEventListener("change", hide);
    };
  }, [disabled]);

  return <div ref={layer} className="hero-hover-grid" aria-hidden="true" />;
}
