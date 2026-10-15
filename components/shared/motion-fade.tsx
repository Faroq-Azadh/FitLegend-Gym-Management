"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MotionFadeProps {
  className?: string;
  children: ReactNode;
  delay?: number;
}

export function MotionFade({ className, children, delay = 0 }: MotionFadeProps) {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (prefersReducedMotion || !mounted) {
    return (
      <div className={cn("animate-in fade-in slide-in-from-bottom-2 duration-300", className)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
