import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  MotionConfig,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";

const MotionContext = createContext({
  paused: false,
  disabled: false,
  setPaused: () => {},
  systemReduced: false,
});
export function MotionProvider({ children }) {
  const [paused, setPaused] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setSystemReduced(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  const disabled = Boolean(systemReduced || paused);
  useEffect(() => {
    document.documentElement.dataset.motion = disabled ? "off" : "on";
    return () => {
      delete document.documentElement.dataset.motion;
    };
  }, [disabled]);
  return (
    <MotionContext.Provider
      value={{ paused, disabled, setPaused, systemReduced }}
    >
      <MotionConfig reducedMotion={disabled ? "always" : "user"}>
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
}
export const useSiteMotion = () => useContext(MotionContext);
export function MotionToggle() {
  const {
    disabled,
    paused,
    setPaused,
    systemReduced: reduce,
  } = useSiteMotion();
  return (
    <button
      className="motion-toggle"
      onClick={() => setPaused(!paused)}
      disabled={Boolean(reduce)}
      aria-pressed={disabled}
      aria-label={
        reduce
          ? "Animations reduced by your device preference"
          : paused
            ? "Enable animations"
            : "Pause animations"
      }
      title={
        reduce
          ? "Reduced motion is enabled on your device"
          : paused
            ? "Enable animations"
            : "Pause animations"
      }
    >
      <span aria-hidden="true">{disabled ? "▷" : "Ⅱ"}</span>
      <span>Motion {disabled ? "off" : "on"}</span>
    </button>
  );
}
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX: scrollYProgress }}
      aria-hidden="true"
    />
  );
}
export function Reveal({ children, className = "", delay = 0, as = "div" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -30px 0px" });
  const { disabled } = useSiteMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const Tag = as === "section" ? motion.section : motion.div;
  return (
    <Tag
      ref={ref}
      className={className}
      initial={false}
      animate={
        mounted && !inView && !disabled
          ? { opacity: 0, y: 30 }
          : { opacity: 1, y: 0 }
      }
      transition={{
        duration: disabled ? 0 : 0.75,
        delay: disabled ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Tag>
  );
}
export function MagneticLink({ href, children, className = "" }) {
  const { disabled } = useSiteMotion();
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 160, damping: 20 }),
    springY = useSpring(y, { stiffness: 160, damping: 20 });
  function move(e) {
    if (disabled || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.09);
    y.set((e.clientY - r.top - r.height / 2) * 0.12);
  }
  return (
    <motion.a
      href={href}
      className={`magnetic-link ${className}`}
      style={{ x: springX, y: springY }}
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
      <span>
        <ArrowUpRight size={21} strokeWidth={1.7} aria-hidden="true" />
      </span>
    </motion.a>
  );
}
export function ParallaxMedia({
  className = "",
  src,
  alt,
  children,
  eager = false,
}) {
  const ref = useRef(null);
  const { disabled } = useSiteMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.015]);
  return (
    <div className={`parallax-media ${className}`} ref={ref}>
      <motion.img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        width="1672"
        height="941"
        style={disabled ? {} : { y, scale }}
      />
      {children}
    </div>
  );
}
