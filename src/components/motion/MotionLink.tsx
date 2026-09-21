"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { duration, ease, tapPress } from "@/lib/motion";

type MotionLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  full?: boolean;
};

export function MotionLink({
  href,
  children,
  className,
  onClick,
  full,
}: MotionLinkProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={full ? "block w-full" : "inline-flex"}
      whileHover={reduce ? undefined : { y: -1, scale: 1.02 }}
      whileTap={reduce ? undefined : tapPress}
      transition={{ duration: duration.fast, ease }}
    >
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    </motion.div>
  );
}
