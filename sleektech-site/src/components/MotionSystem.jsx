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
  disabled: false,
  systemReduced: false,
});
export function MotionProvider({ children }) {
  const [systemReduced, setSystemReduced] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setSystemReduced(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  const disabled = Boolean(systemReduced);
  useEffect(() => {
    document.documentElement.dataset.motion = disabled ? "off" : "on";
    return () => {
      delete document.documentElement.dataset.motion;
    };
  }, [disabled]);
  return (
    <MotionContext.Provider value={{ disabled, systemReduced }}>
      <MotionConfig reducedMotion={disabled ? "always" : "user"}>
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
}
export const useSiteMotion = () => useContext(MotionContext);
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
export function Reveal({
  children,
  className = "",
  delay = 0,
  as = "div",
  ...props
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -30px 0px" });
  const { disabled } = useSiteMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const Tag = as === "section" ? motion.section : motion.div;
  return (
    <Tag
      {...props}
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

export function OrbitCanvas({ active = 0 }) {
  const canvas = useRef(null),
    host = useRef(null),
    activeRef = useRef(active);
  const { disabled } = useSiteMotion();
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => {
    const el = canvas.current,
      container = host.current,
      ctx = el.getContext("2d");
    if (!ctx) return;
    let frame = 0,
      visible = false,
      w = 1,
      h = 1,
      time = 0,
      last = 0;
    const pointer = { x: 0, y: 0 };
    function size() {
      const r = container.getBoundingClientRect();
      w = r.width;
      h = r.height;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      el.width = w * dpr;
      el.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    }
    function project(x, y, z, angle) {
      const ca = Math.cos(angle),
        sa = Math.sin(angle);
      const xx = x * ca - z * sa,
        zz = x * sa + z * ca;
      const tilt = 0.56 + pointer.y * 0.08;
      const yy = y * Math.cos(tilt) - zz * Math.sin(tilt);
      const depth = y * Math.sin(tilt) + zz * Math.cos(tilt);
      const perspective = 5 / (5 + depth);
      return {
        x: w / 2 + (xx + pointer.x * 0.05) * Math.min(w, h) * 0.3 * perspective,
        y: h / 2 + yy * Math.min(w, h) * 0.3 * perspective,
        depth,
        perspective,
      };
    }
    function draw(timestamp) {
      if (last && timestamp) time += Math.min(timestamp - last, 40) * 0.00013;
      last = timestamp;
      ctx.clearRect(0, 0, w, h);
      const angle = disabled ? 0.65 : time + 0.65;
      const rings = 18,
        segments = 100;
      for (let ring = 0; ring < rings; ring++) {
        const v = (ring / rings) * Math.PI * 2;
        ctx.beginPath();
        for (let j = 0; j <= segments; j++) {
          const u = (j / segments) * Math.PI * 2;
          const radius = 1 + 0.27 * Math.cos(v);
          const p = project(
            radius * Math.cos(u),
            0.27 * Math.sin(v),
            radius * Math.sin(u),
            angle,
          );
          if (j === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle =
          ring % 3 === 0 ? "rgba(134,178,255,.47)" : "rgba(69,111,187,.28)";
        ctx.lineWidth = ring % 3 === 0 ? 0.8 : 0.5;
        ctx.stroke();
      }
      for (let j = 0; j < 48; j++) {
        const u = (j / 48) * Math.PI * 2;
        ctx.beginPath();
        for (let ring = 0; ring <= 24; ring++) {
          const v = (ring / 24) * Math.PI * 2,
            r = 1 + 0.27 * Math.cos(v);
          const p = project(
            r * Math.cos(u),
            0.27 * Math.sin(v),
            r * Math.sin(u),
            angle,
          );
          if (ring === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(95,141,218,.25)";
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      for (let j = 0; j < 65; j++) {
        const u = (j / 65) * Math.PI * 2 + (disabled ? 0 : time * 0.6),
          v = j * 2.39996,
          r = 1 + 0.27 * Math.cos(v);
        const p = project(
          r * Math.cos(u),
          0.27 * Math.sin(v),
          r * Math.sin(u),
          angle,
        );
        ctx.beginPath();
        ctx.arc(p.x, p.y, j % 8 === 0 ? 2.6 : 1.2, 0, Math.PI * 2);
        ctx.fillStyle = j % 8 === 0 ? "#b6d1ff" : "#4e89fa";
        ctx.fill();
      }
      const pulse = disabled ? 1 : 1 + Math.sin(time * 7) * 0.06;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.15 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(137,174,239,.13)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    function tick(t) {
      draw(t);
      if (visible && !disabled && !document.hidden)
        frame = requestAnimationFrame(tick);
    }
    function restart() {
      cancelAnimationFrame(frame);
      last = 0;
      if (visible && !disabled && !document.hidden)
        frame = requestAnimationFrame(tick);
      else draw(0);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        restart();
      },
      { threshold: 0.05 },
    );
    observer.observe(container);
    const resize = new ResizeObserver(size);
    resize.observe(container);
    function move(e) {
      const r = container.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) / w - 0.5;
      pointer.y = (e.clientY - r.top) / h - 0.5;
    }
    container.addEventListener("pointermove", move);
    document.addEventListener("visibilitychange", restart);
    size();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      container.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", restart);
    };
  }, [disabled]);
  return (
    <div className="orbit-canvas" ref={host}>
      <canvas ref={canvas} aria-hidden="true" />
      <div className="orbit-core">
        <span>sleektech</span>
        <small>CONNECTED BY DESIGN</small>
      </div>
    </div>
  );
}
