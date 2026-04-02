import type { Metadata } from "next";
import Link from "next/link";
import {
  ProfileSection,
  SkillsSection,
  PROFILE,
  ABOUT_PARAGRAPHS,
} from "@/features/about";

export const metadata: Metadata = {
  title: "About",
  description: `${PROFILE.name} — ${PROFILE.role}`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <ProfileSection />

      <hr className="mt-10 border-border" />

      {/* Intro */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">소개</h2>
        <div className="mt-4 flex flex-col gap-3 text-[15px] leading-relaxed text-muted-foreground">
          <p>&ldquo;{PROFILE.intro}&rdquo;</p>
          {ABOUT_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <hr className="mt-10 border-border" />

      <SkillsSection />

      <hr className="mt-10 border-border" />

      {/* Career */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">경력</h2>
        <p className="mt-4 text-sm text-muted-foreground">
          추후 업데이트 예정입니다.
        </p>
      </section>

      <hr className="mt-10 border-border" />

      {/* Resume CTA */}
      <section className="mt-10 text-center">
        <Link
          href="/resume"
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          상세 이력서 보기 →
        </Link>
      </section>
    </div>
  );
}
