import { useEffect, useRef } from "react";
import { useInView } from "motion/react";
import { useSiteMotion } from "./MotionSystem";

/** Original particle sculpture. Capped, visibility-aware rendering without a 3D runtime. */
export function NeuralEngine() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const visible = useInView(root, { margin: "80px" });
  const { disabled } = useSiteMotion();
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const element = canvas.current,
      host = root.current;
    if (!element || !host) return;
    const context = element.getContext("2d", { alpha: false });
    if (!context) return;
    let width = 1,
      height = 1,
      frame = 0,
      last = 0,
      elapsed = 0,
      px = 0,
      py = 0;
    const compact = window.matchMedia("(max-width: 767px)").matches;
    const density = compact ? 72 : 144,
      bands = compact ? 24 : 40;
    const points = Array.from({ length: density * bands }, (_, i) => {
      const u = ((i % density) / density) * Math.PI * 2,
        v = (Math.floor(i / density) / bands) * Math.PI * 2;
      return {
        u,
        v,
        cu: Math.cos(u),
        su: Math.sin(u),
        cv: Math.cos(v),
        sv: Math.sin(v),
      };
    });
    const projected = new Float32Array(points.length * 3);
    const shades = new Uint8Array(points.length);
    const colors = ["#8b2712", "#cf4219", "#ff6c31", "#ffa16d", "#ffe3c7"];
    function draw(time: number) {
      if (!context || !element || !host) return;
      px += (pointer.current.x - px) * 0.055;
      py += (pointer.current.y - py) * 0.055;
      const t = time * 0.00022;
      const scroll = disabled
        ? 0
        : Math.min(window.scrollY / window.innerHeight, 1);
      const tilt = 0.65 + Math.sin(t * 0.6) * 0.18 + py * 0.18,
        turn = -0.5 + t * 0.18 + px * 0.2 + scroll * 0.45;
      const size = Math.min(width, height) * 0.183;
      const ct = Math.cos(tilt),
        st = Math.sin(tilt),
        cr = Math.cos(turn),
        sr = Math.sin(turn);
      context.fillStyle = "#000000";
      context.fillRect(0, 0, width, height);
      let pointIndex = 0;
      for (const p of points) {
        const wave =
          0.065 * Math.sin(p.u * 5 + p.v * 3 + t * 3) +
          0.04 * Math.sin(p.u * 9 - t * 2);
        const minor = 0.54 + wave,
          radius = 1.62 + minor * p.cv;
        const x = radius * p.cu,
          y = radius * p.su,
          z = minor * p.sv;
        const ry = y * ct - z * st,
          rz = y * st + z * ct;
        const rx = x * cr - ry * sr,
          fy = x * sr + ry * cr,
          perspective = 4.6 / (4.6 - rz);
        const light = (Math.sin(p.u * 3 + p.v * 2 - t * 2) + 1) * 0.5;
        const index = Math.min(
          4,
          Math.max(0, Math.floor((rz + 2.1) * 0.7 + light * 1.7)),
        );
        shades[pointIndex] = index;
        projected[pointIndex * 3] = width * 0.5 + rx * size * perspective;
        projected[pointIndex * 3 + 1] = height * 0.5 + fy * size * perspective;
        projected[pointIndex * 3 + 2] = (0.6 + light * 0.65) * perspective;
        pointIndex++;
      }
      for (let shade = 0; shade < colors.length; shade++) {
        context.fillStyle = colors[shade];
        context.beginPath();
        for (let i = 0; i < points.length; i++) {
          if (shades[i] !== shade) continue;
          const offset = i * 3;
          context.rect(
            projected[offset],
            projected[offset + 1],
            projected[offset + 2],
            projected[offset + 2],
          );
        }
        context.fill();
      }
      for (let ring = 0; ring < 7; ring++) {
        context.beginPath();
        for (let i = 0; i <= 120; i++) {
          const u = (i / 120) * Math.PI * 2,
            v = (ring / 7) * Math.PI * 2 + t * 0.3;
          const r = 1.62 + 0.55 * Math.cos(v),
            x = r * Math.cos(u),
            y = r * Math.sin(u),
            z = 0.55 * Math.sin(v);
          const ry = y * ct - z * st,
            rz = y * st + z * ct,
            perspective = 4.6 / (4.6 - rz);
          const xx = width * 0.5 + (x * cr - ry * sr) * size * perspective,
            yy = height * 0.5 + (x * sr + ry * cr) * size * perspective;
          if (i === 0) context.moveTo(xx, yy);
          else context.lineTo(xx, yy);
        }
        context.strokeStyle = ring % 2 ? "#ff5d2e65" : "#ff8d5445";
        context.lineWidth = 0.8;
        context.shadowColor = "#ff642b80";
        context.shadowBlur = 7;
        context.stroke();
        context.shadowBlur = 0;
      }
      host.dataset.ready = "true";
    }
    function resize() {
      if (!element || !host || !context) return;
      width = host.clientWidth;
      height = host.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.5);
      element.width = Math.round(width * dpr);
      element.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(elapsed);
    }
    const reducedData = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection?.saveData;
    function tick(now: number) {
      if (now - last >= 1000 / 30) {
        elapsed += Math.min(now - last, 60);
        last = now;
        draw(elapsed);
      }
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);
      const running = visible && !disabled && !reducedData && !document.hidden;
      if (host) host.dataset.running = String(running);
      if (running) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      } else draw(elapsed);
    }
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [visible, disabled]);
  return (
    <div
      className="neural-engine"
      ref={root}
      aria-hidden="true"
      onPointerMove={(event) => {
        if (disabled || event.pointerType !== "mouse") return;
        const box = event.currentTarget.getBoundingClientRect();
        pointer.current = {
          x: (event.clientX - box.left) / box.width - 0.5,
          y: (event.clientY - box.top) / box.height - 0.5,
        };
      }}
      onPointerLeave={() => {
        pointer.current = { x: 0, y: 0 };
      }}
    >
      <svg className="engine-fallback" viewBox="0 0 700 700">
        <defs>
          <radialGradient id="engine-ember">
            <stop stopColor="#ffb28a" />
            <stop offset=".5" stopColor="#ed4e26" />
            <stop offset="1" stopColor="#651407" />
          </radialGradient>
        </defs>
        {Array.from({ length: 18 }, (_, i) => (
          <ellipse
            key={i}
            cx="350"
            cy="350"
            rx={165 + i * 4}
            ry={105 + i * 3}
            fill="none"
            stroke="url(#engine-ember)"
            strokeWidth="1"
            transform="rotate(-26 350 350)"
          />
        ))}
      </svg>
      <canvas ref={canvas} />
    </div>
  );
}
