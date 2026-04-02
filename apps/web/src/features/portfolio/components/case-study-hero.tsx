"use client";

import { motion } from "motion/react";

interface CaseStudyHeroProps {
  title: string;
  impact: string;
  category: string;
  role: string;
  period: string;
  teamSize: string;
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function CaseStudyHero({
  title,
  impact,
  category,
  role,
  period,
  teamSize,
}: CaseStudyHeroProps) {
  return (
    <section className="flex min-h-[100svh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-3xl"
      >
        <motion.p
          variants={itemVariants}
          className="text-xs uppercase tracking-[0.15em] text-muted-foreground"
        >
          {category}
        </motion.p>
        <motion.h1
          variants={itemVariants}
          className="mt-4 text-[clamp(3rem,6vw,5rem)] font-extrabold leading-[1.1] tracking-[-0.03em]"
        >
          {title}
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="mt-4 text-[clamp(1rem,2vw,1.25rem)] text-muted-foreground"
        >
          {impact}
        </motion.p>
        <motion.div
          variants={itemVariants}
          className="mt-6 flex flex-wrap justify-center gap-2"
        >
          {[role, period, `${teamSize} 개발`].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-sm text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="mt-12 text-muted-foreground"
          aria-hidden="true"
        >
          <span className="inline-block motion-safe:animate-bounce text-xl">↓</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
