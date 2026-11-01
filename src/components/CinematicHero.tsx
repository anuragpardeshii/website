import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Button, Icon } from "./ui";
import { useSiteMotion } from "./MotionSystem";
import { NeuralEngine } from "./NeuralEngine";

export function CinematicHero() {
  const ref = useRef<HTMLElement>(null);
  const { disabled } = useSiteMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 12]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  return (
    <section ref={ref} className="business-hero" aria-labelledby="hero-title">
      <div className="container business-hero-top">
        <span>
          <i /> SIMPTECH — DESIGN & TECHNOLOGY
        </span>
        <span>BUILT WITH INTENT. MADE TO MATTER.</span>
      </div>
      <motion.div
        className="business-hero-art"
        style={disabled ? {} : { y, rotate, scale }}
      >
        <NeuralEngine />
        <div className="engine-coordinate">
          <span>01 / INTELLIGENCE IN MOTION</span>
          <span>AN ORIGINAL GENERATIVE STUDY</span>
        </div>
        <div className="engine-cross cross-a">+</div>
        <div className="engine-cross cross-b">+</div>
      </motion.div>
      <div className="container business-hero-main">
        <motion.div
          className="business-hero-copy"
          style={disabled ? {} : { y: titleY }}
        >
          <div className="hero-overline">
            <span>FOR AMBITIOUS BUSINESSES</span>
            <i />
          </div>
          <h1 id="hero-title">
            <span className="hero-line">
              <span data-hero-line>Built to move</span>
            </span>
            <span className="hero-line">
              <span data-hero-line>business</span>
            </span>
            <span className="hero-line">
              <span data-hero-line>
                <em>forward.</em>
              </span>
            </span>
          </h1>
          <p>
            Exceptional websites. Connected dashboards.
            <br className="desktop-break" /> AI that works for your business.
            <br />
            <span>Designed with passion. Engineered with purpose.</span>
          </p>
          <div className="business-hero-actions">
            <Button href="/contact" icon="diagonal">
              Let’s build your next chapter
            </Button>
            <a href="#business-solutions">
              Explore what we build <Icon name="arrow" size={17} />
            </a>
          </div>
        </motion.div>
      </div>
      <div className="container business-hero-footer">
        <a href="#business-solutions">
          <span className="hero-scroll-icon">↓</span> SCROLL INTO POSSIBILITY
        </a>
        <span>WEBSITES / SOFTWARE / INTELLIGENCE</span>
        <a href="/approach">
          THE SIMPTECH APPROACH <Icon name="diagonal" size={13} />
        </a>
      </div>
    </section>
  );
}
