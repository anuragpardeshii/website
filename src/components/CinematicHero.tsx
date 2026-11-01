import { useEffect, useRef, useState } from "react";
import { Button, Icon } from "./ui";
import { useSiteMotion } from "./MotionSystem";

/** The image is always present. Video loads only with motion enabled on desktop. */
export function CinematicHero() {
  const { disabled } = useSiteMotion();
  const video = useRef<HTMLVideoElement>(null);
  const [loadFilm, setLoadFilm] = useState(false);

  useEffect(() => {
    const screen = window.matchMedia("(min-width: 768px)");
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    const sync = () =>
      setLoadFilm(
        !disabled &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
          screen.matches &&
          !connection?.saveData,
      );
    sync();
    screen.addEventListener("change", sync);
    return () => screen.removeEventListener("change", sync);
  }, [disabled]);

  useEffect(() => {
    const film = video.current;
    if (!film || !loadFilm) return;
    let visible = true;
    const sync = () => {
      if (visible && !document.hidden) void film.play().catch(() => {});
      else film.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(film);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      film.pause();
    };
  }, [loadFilm]);

  return (
    <section className="cinema-hero" aria-labelledby="hero-title">
      <div className="cinema-landscape" data-parallax aria-hidden="true">
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet="/media/mountain-poster-mobile.webp"
          />
          <img
            src="/media/mountain-poster.webp"
            alt=""
            width="1280"
            height="720"
            fetchPriority="high"
          />
        </picture>
        {loadFilm && (
          <video
            ref={video}
            src="/media/mountain-film.mp4"
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            poster="/media/mountain-poster.webp"
            tabIndex={-1}
          />
        )}
      </div>
      <div className="cinema-hero-shade" aria-hidden="true" />
      <div className="container cinema-hero-content">
        <div className="cinema-eyeline flex items-center justify-between gap-4">
          <span>
            <i /> INDEPENDENT DIGITAL STUDIO
          </span>
          <span className="hidden md:block">
            DESIGNED WITH INTENT. BUILT TO LAST.
          </span>
        </div>
        <h1 id="hero-title">
          <span className="hero-line">
            <span data-hero-line>Complexity,</span>
          </span>
          <span className="hero-line">
            <span data-hero-line>
              made <em>simple.</em>
            </span>
          </span>
        </h1>
        <div className="cinema-hero-bottom grid gap-8 md:grid-cols-2 md:items-end">
          <div>
            <p>
              Better websites. Smarter business software.
              <br />
              Thoughtfully built around you.
            </p>
            <div className="cinema-actions flex flex-wrap items-center gap-6">
              <Button href="/contact" icon="diagonal">
                Start a project
              </Button>
              <a href="/work" className="cinema-work-link">
                Explore our work <Icon name="arrow" size={17} />
              </a>
            </div>
          </div>
          <div
            className="hero-coordinate md:justify-self-end"
            aria-hidden="true"
          >
            <span>STRATEGY / DESIGN / DEVELOPMENT</span>
            <div>
              Less friction.
              <br />
              More possibility.
            </div>
          </div>
        </div>
        <div className="cinema-hero-footer flex items-center justify-between gap-4">
          <a href="#studio-workspace">
            A clearer perspective <span>↓</span>
          </a>
          <span>SCROLL TO EXPLORE</span>
        </div>
      </div>
    </section>
  );
}
