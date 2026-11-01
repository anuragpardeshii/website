import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { Button, Icon } from "./ui";
import { useSiteMotion } from "./MotionSystem";
import { MotionSurface } from "./MotionSurface";

export function CinematicHero() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref);
  const { disabled } = useSiteMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  return (
    <section
      ref={ref}
      className="luminous-hero"
      aria-labelledby="hero-title"
      data-active={inView && !disabled}
    >
      <div className="hero-aurora" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="container luminous-top">
        <span>
          <i /> SIMPTECH / DESIGN MEETS TECHNOLOGY
        </span>
        <span>YOUR AMBITION. OUR CRAFT.</span>
      </div>
      <div className="container luminous-composition">
        <h1 id="hero-title">
          <span className="hero-line">
            <span data-hero-line>Big ideas.</span>
          </span>
          <span className="hero-line">
            <span data-hero-line>
              Beautifully <em>built.</em>
            </span>
          </span>
          <span className="hero-line">
            <span className="hero-outline" data-hero-line>
              <Icon name="sparkle" size={44} />
              Intelligently connected.
            </span>
          </span>
        </h1>
        <motion.div
          className="luminous-sculpture"
          style={disabled ? {} : { y, rotate, scale }}
          aria-hidden="true"
        >
          <MotionSurface className="sculpture-surface">
            <div className="sculpture-float">
              <picture>
                <source
                  media="(max-width:767px)"
                  srcSet="/media/violet-sculpture-mobile.webp"
                />
                <img
                  src="/media/violet-sculpture.webp"
                  alt=""
                  width="1024"
                  height="1024"
                  fetchPriority="high"
                />
              </picture>
            </div>
          </MotionSurface>
        </motion.div>
        <div className="luminous-copy">
          <span className="luminous-copy-index">01 / A BETTER WAY FORWARD</span>
          <p>
            Distinctive websites. Clearer dashboards.
            <br />
            AI that works for your business.
          </p>
          <p className="luminous-description">
            We bring design, software, and intelligence together to turn your
            next big idea into something people love to use.
          </p>
          <div className="luminous-actions">
            <Button href="/contact" icon="diagonal">
              Let’s build something great
            </Button>
            <a href="#studio-workspace">
              Explore the possibilities <Icon name="arrow" size={16} />
            </a>
          </div>
        </div>
        <div className="hero-art-note">
          <span>DESIGNED WITH INTENTION.</span>
          <span>BUILT FOR YOUR BUSINESS.</span>
        </div>
      </div>
      <div className="container luminous-footer">
        <a href="#studio-workspace">
          <span>↓</span> THERE’S MORE BELOW
        </a>
        <div>
          <span>WEBSITES</span>
          <i />
          <span>BUSINESS SOFTWARE</span>
          <i />
          <span>AI SYSTEMS</span>
        </div>
        <span>STRATEGY → DESIGN → DEVELOPMENT</span>
      </div>
    </section>
  );
}
