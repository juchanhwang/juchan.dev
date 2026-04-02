"use client";

import Link from "next/link";
import type { Project } from "../lib/projects";
import { FadeInSection } from "./fade-in-section";

interface CaseStudyPageProps {
  project: Project & { caseStudy: NonNullable<Project["caseStudy"]> };
}

export function CaseStudyPage({ project }: CaseStudyPageProps) {
  const { caseStudy } = project;

  return (
    <article>
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <FadeInSection>
          <span className="text-4xl">{project.emoji}</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight">
            {project.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {caseStudy.heroSubtitle}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span>{caseStudy.period}</span>
            <span className="hidden sm:inline" aria-hidden="true">
              /
            </span>
            <span>{caseStudy.role}</span>
            <span className="hidden sm:inline" aria-hidden="true">
              /
            </span>
            <span>{caseStudy.teamSize}</span>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </FadeInSection>
      </section>

      <hr className="mx-auto max-w-3xl border-border" />

      {/* Overview */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <FadeInSection>
          <h2 className="text-2xl font-bold">{caseStudy.overview.title}</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {caseStudy.overview.content}
          </p>
        </FadeInSection>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <FadeInSection>
          <h2 className="text-2xl font-bold">{caseStudy.problem.title}</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {caseStudy.problem.content}
          </p>
        </FadeInSection>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <FadeInSection>
          <h2 className="text-2xl font-bold">{caseStudy.process.title}</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {caseStudy.process.content}
          </p>
        </FadeInSection>
      </section>

      {/* Result */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <FadeInSection>
          <h2 className="text-2xl font-bold">{caseStudy.result.title}</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {caseStudy.result.content}
          </p>
        </FadeInSection>
      </section>

      <hr className="mx-auto max-w-3xl border-border" />

      {/* Links */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <FadeInSection>
          <div className="flex flex-wrap justify-center gap-4">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
              >
                Demo 보기 ↗
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                GitHub ↗
              </a>
            )}
            <Link
              href="/projects"
              className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              ← 모든 프로젝트
            </Link>
          </div>
        </FadeInSection>
      </section>
    </article>
  );
}
