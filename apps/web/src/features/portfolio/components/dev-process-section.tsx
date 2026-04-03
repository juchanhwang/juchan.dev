"use client";

import Image from "next/image";
import Link from "next/link";
import type { DevDocument, DevProcess } from "../lib/projects";
import { FadeInUp } from "../animation/fade-in-up";

const CARD_CLASS =
  "group flex h-full flex-col rounded-lg border border-border p-4 transition-all hover:border-foreground/50 hover:shadow-md";

function ExternalLinkIcon() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
      />
    </svg>
  );
}

function DocCard({ doc }: { doc: DevDocument }) {
  const inner = (
    <>
      <span className="text-2xl" aria-hidden="true">
        {doc.emoji}
      </span>
      <p className="mt-2 text-sm font-semibold">{doc.title}</p>
      {doc.description && (
        <p className="mt-1 text-xs text-muted-foreground">{doc.description}</p>
      )}
    </>
  );

  if (!doc.href) {
    return (
      <div className="flex h-full flex-col rounded-lg border border-border p-4">
        {inner}
      </div>
    );
  }

  const linkContent = (
    <>
      {inner}
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
        보기 {doc.external ? <ExternalLinkIcon /> : "→"}
        {doc.external && <span className="sr-only">(새 탭에서 열기)</span>}
      </span>
    </>
  );

  if (doc.external) {
    return (
      <a
        href={doc.href}
        target="_blank"
        rel="noopener noreferrer"
        className={CARD_CLASS}
      >
        {linkContent}
      </a>
    );
  }

  return (
    <Link href={doc.href} className={CARD_CLASS}>
      {linkContent}
    </Link>
  );
}

export function DocTable({ doc }: { doc: DevDocument }) {
  return (
    <div>
      <h4 className="flex items-center gap-2 text-base font-semibold">
        <span aria-hidden="true">{doc.emoji}</span>
        {doc.title}
      </h4>
      {doc.description && (
        <p className="mt-1 text-sm text-muted-foreground">{doc.description}</p>
      )}
      {doc.headers && doc.rows && (
        <>
          {/* Desktop: table */}
          <div className="mt-3 hidden overflow-hidden rounded-lg border border-border sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  {doc.headers.map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left font-medium text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {doc.rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-b border-border last:border-b-0"
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`px-4 py-2.5 ${ci === 0 ? "font-medium" : "text-muted-foreground"}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="mt-3 space-y-2 sm:hidden">
            {doc.rows.map((row, ri) => (
              <div
                key={ri}
                className="rounded-lg border border-border p-3"
              >
                {row.map((cell, ci) => (
                  <p
                    key={ci}
                    className={
                      ci === 0
                        ? "font-medium"
                        : "mt-0.5 text-sm text-muted-foreground"
                    }
                  >
                    {doc.headers?.[ci] && ci > 0 && (
                      <span className="text-xs uppercase tracking-wide text-muted-foreground/70">
                        {doc.headers[ci]}:{" "}
                      </span>
                    )}
                    {cell}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface DevProcessSectionProps {
  devProcess: DevProcess;
  tech?: string[];
  overviewLink?: { title: string; href: string };
  hideDocuments?: boolean;
}

export function DevProcessSection({
  devProcess,
  tech,
  overviewLink,
  hideDocuments,
}: DevProcessSectionProps) {
  const hasTableDocs = devProcess.documents.some((d) => d.rows);

  return (
    <section id="dev-process" className="mx-auto max-w-[1100px] px-4 py-20">
      <div className="scroll-reveal">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Development Process
        </p>
        <h2 className="mt-2 text-2xl font-bold">어떻게 만들었나</h2>
      </div>

      <FadeInUp className="mt-8">
        <p className="mx-auto max-w-2xl text-center leading-relaxed text-muted-foreground">
          {devProcess.description}
        </p>
      </FadeInUp>

      {tech && tech.length > 0 && (
        <FadeInUp
          delay={0.1}
          className="mt-6 flex flex-wrap justify-center gap-2"
        >
          {tech.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </FadeInUp>
      )}

      {overviewLink && (
        <FadeInUp delay={0.15} className="mt-4 text-center">
          <a
            href={overviewLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {overviewLink.title}
            <ExternalLinkIcon />
            <span className="sr-only">(새 탭에서 열기)</span>
          </a>
        </FadeInUp>
      )}

      {/* Team composition */}
      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {devProcess.team.map((member, i) => (
          <FadeInUp key={member.role} delay={i * 0.08}>
            <div className="rounded-lg border border-border p-4 text-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-sm font-bold">
                {member.role}
              </span>
              <p className="mt-2 text-sm font-semibold">{member.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {member.description}
              </p>
            </div>
          </FadeInUp>
        ))}
      </div>

      {/* Development cycle flow */}
      {devProcess.cycles.map((cycle, ci) => (
        <FadeInUp
          key={cycle.label}
          delay={0.3 + ci * 0.15}
          className="mt-12"
        >
          <h3 className="text-center text-lg font-semibold">{cycle.label}</h3>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {cycle.steps.map((step, i) => (
              <div
                key={step}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <span className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium">
                  {step}
                </span>
                {i < cycle.steps.length - 1 && (
                  <svg
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
          {cycle.image && (
            <div className="mt-8 overflow-hidden rounded-lg border border-border shadow-lg">
              <Image
                src={cycle.image}
                alt={cycle.imageAlt ?? `${cycle.label} 스크린샷`}
                width={1100}
                height={600}
                className="h-auto w-full"
              />
            </div>
          )}
        </FadeInUp>
      ))}

      {/* Documents: table view or card grid */}
      {!hideDocuments && (
        <FadeInUp delay={0.4} className="mt-12">
          <h3 className="text-center text-lg font-semibold">
            {devProcess.documentsLabel ?? "산출물"}
          </h3>

          {hasTableDocs ? (
            <div className="mt-8 space-y-10">
              {devProcess.documents.map((doc, i) => (
                <FadeInUp key={doc.title} delay={0.4 + i * 0.06}>
                  <DocTable doc={doc} />
                </FadeInUp>
              ))}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {devProcess.documents.map((doc, i) => (
                <FadeInUp key={doc.href ?? doc.title} delay={0.4 + i * 0.08}>
                  <DocCard doc={doc} />
                </FadeInUp>
              ))}
            </div>
          )}
        </FadeInUp>
      )}
    </section>
  );
}
