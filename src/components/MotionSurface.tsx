import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { MotionStyle } from "motion/react";
import type { PointerEvent } from "react";
import type { ChildrenProps } from "../types";
import { useSiteMotion } from "./MotionSystem";

/** Pointer depth is decorative; every action remains a native link or button. */
export function MotionSurface({ children, className = "" }: ChildrenProps) {
  const { disabled } = useSiteMotion();
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const smoothX = useSpring(pointerX, { stiffness: 180, damping: 28 });
  const smoothY = useSpring(pointerY, { stiffness: 180, damping: 28 });
  const rotateY = useTransform(smoothX, [0, 100], [-3, 3]);
  const rotateX = useTransform(smoothY, [0, 100], [2, -2]);
  const lightX = useTransform(smoothX, (value) => `${value}%`);
  const lightY = useTransform(smoothY, (value) => `${value}%`);
  useEffect(() => {
    if (disabled) {
      pointerX.jump(50);
      pointerY.jump(50);
    }
  }, [disabled, pointerX, pointerY]);
  function move(event: PointerEvent<HTMLDivElement>) {
    if (disabled || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - box.left) / box.width) * 100);
    pointerY.set(((event.clientY - box.top) / box.height) * 100);
  }
  return (
    <motion.div
      className={`motion-surface ${className}`}
      data-motion-surface
      onPointerMove={move}
      onPointerLeave={() => {
        pointerX.set(50);
        pointerY.set(50);
      }}
      style={
        disabled
          ? {}
          : ({
              rotateX,
              rotateY,
              transformPerspective: 1200,
              "--light-x": lightX,
              "--light-y": lightY,
            } as MotionStyle)
      }
    >
      {children}
    </motion.div>
  );
}
