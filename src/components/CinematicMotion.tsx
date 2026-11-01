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
                .toArray<HTMLElement>(".showreel-project .showreel-image")
                .forEach((element, index) => {
                  gsap.from(element, {
                    y: index % 2 ? 90 : 45,
                    rotate: index % 2 ? 1.5 : -1.5,
                    scale: 0.96,
                    ease: "none",
                    scrollTrigger: {
                      trigger: element,
                      start: "top 95%",
                      end: "top 30%",
                      scrub: 0.8,
                    },
                  });
                });
              gsap.utils
                .toArray<HTMLElement>("[data-image-reveal]")
                .forEach((element) => {
                  gsap.from(element, {
                    clipPath: "inset(4% 2% 4% 2%)",
                    scale: 0.92,
                    y: 65,
                    rotateX: 4,
                    ease: "none",
                    scrollTrigger: {
                      trigger: element,
                      start: "top 100%",
                      end: "top 20%",
                      scrub: 0.8,
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
