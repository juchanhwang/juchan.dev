"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="py-20 sm:py-28">
      <p className="text-base text-muted-foreground">안녕하세요, 저는</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
        주찬황입니다.
      </h1>
      <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
        프론트엔드 개발자 — 읽기 쉬운 코드와 빠른 UI를 만듭니다.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/blog"
          className={cn(buttonVariants({ variant: "default", size: "lg" }))}
        >
          블로그 읽기
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
        <Link
          href="/projects"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          프로젝트 보기
        </Link>
      </div>
    </section>
  );
}
