import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Button, Icon } from "./ui";
import { useSiteMotion } from "./MotionSystem";
import { MotionSurface } from "./MotionSurface";

export function CinematicHero() {
  const ref = useRef<HTMLElement>(null);
  const { disabled } = useSiteMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  return (
    <section
      ref={ref}
      className="cinema-hero black-hero"
      aria-labelledby="hero-title"
    >
      <motion.div
        className="hero-scroll-art"
        style={disabled ? {} : { y, scale }}
        aria-hidden="true"
      >
        <MotionSurface className="hero-intelligence-art">
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet="/media/intelligence-sculpture-mobile.webp"
            />
            <img
              src="/media/intelligence-sculpture.webp"
              alt=""
              width="1536"
              height="1024"
              fetchPriority="high"
            />
          </picture>
          <div className="hero-coordinate-lines">
            <i />
            <i />
            <i />
          </div>
        </MotionSurface>
      </motion.div>
      <div className="cinema-hero-shade" aria-hidden="true" />
      <div className="container cinema-hero-content">
        <div className="cinema-eyeline flex items-center justify-between gap-4">
          <span>
            <i /> SIMPTECH / DIGITAL SYSTEMS STUDIO
          </span>
          <span className="hidden md:block">
            DESIGNED FOR PEOPLE. BUILT FOR POSSIBILITY.
          </span>
        </div>
        <h1 id="hero-title">
          <span className="hero-line">
            <span data-hero-line>Intelligence.</span>
          </span>
          <span className="hero-line">
            <span data-hero-line>
              Made <em>useful.</em>
            </span>
          </span>
        </h1>
        <div className="cinema-hero-bottom">
          <p>
            AI systems. Thoughtful websites. Connected software.
            <br />
            Built to make your business work better.
          </p>
          <div className="cinema-actions flex flex-wrap items-center gap-6">
            <Button href="/contact" icon="diagonal">
              Start a project
            </Button>
            <a href="#intelligence-flow" className="cinema-work-link">
              Explore AI systems <Icon name="arrow" size={17} />
            </a>
          </div>
        </div>
        <MotionSurface className="hero-node">
          <div className="hero-node-top">
            <Icon name="sparkle" size={16} />
            <span>THE INTELLIGENCE LAYER</span>
            <i />
          </div>
          <strong>Everything, in context.</strong>
          <div className="hero-node-flow">
            <span>Knowledge</span>
            <Icon name="arrow" size={12} />
            <span>Reasoning</span>
            <Icon name="arrow" size={12} />
            <span>Review</span>
          </div>
          <small>AN ORIGINAL SYSTEM CONCEPT</small>
        </MotionSurface>
        <div className="cinema-hero-footer flex items-center justify-between gap-4">
          <a href="#intelligence-flow">
            Discover what connects us <span>↓</span>
          </a>
          <span>SCROLL TO EXPLORE</span>
        </div>
      </div>
    </section>
  );
}
