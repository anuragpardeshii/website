import { useEffect } from "react";
import { useSiteMotion } from "./MotionSystem";

/** Lazy loaded, scoped GSAP effects; native scrolling and static SSR stay intact. */
export function CinematicMotion() {
  const { disabled } = useSiteMotion();
  useEffect(() => {
    if (
      disabled ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        const context = gsap.context(
          () => {
            gsap.from("[data-hero-line]", {
              yPercent: 110,
              duration: 1.15,
              stagger: 0.12,
              ease: "power3.out",
            });
            media.add("(min-width: 768px)", () => {
              gsap.utils
                .toArray<HTMLElement>("[data-parallax]")
                .forEach((element) => {
                  gsap.to(element, {
                    yPercent: 12,
                    ease: "none",
                    scrollTrigger: {
                      trigger: element.parentElement,
                      start: "top top",
                      end: "bottom top",
                      scrub: 0.8,
                    },
                  });
                });
              gsap.utils
                .toArray<HTMLElement>("[data-image-reveal]")
                .forEach((element) => {
                  gsap.from(element, {
                    clipPath: "inset(8% 3% 8% 3%)",
                    duration: 1.1,
                    ease: "power2.out",
                    scrollTrigger: {
                      trigger: element,
                      start: "top 85%",
                      once: true,
                    },
                  });
                });
            });
          },
          document.querySelector("main") ?? undefined,
        );
        cleanup = () => {
          media.revert();
          context.revert();
        };
      },
    );
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [disabled]);
  return null;
}
