"use client";

import Image from "next/image";
import type { Metric, Screenshot, DemoVideo } from "../lib/projects";
import { FadeInUp } from "../animation/fade-in-up";
import { CountUp } from "../animation/count-up";

interface ResultMetricsProps {
  metrics: Metric[];
  resultContent: string;
  screenshots?: Screenshot[];
  demoVideo?: DemoVideo;
}

export function ResultMetrics({
  metrics,
  resultContent,
  screenshots,
  demoVideo,
}: ResultMetricsProps) {
  return (
    <section id="result" className="mx-auto max-w-[1100px] px-4 py-20">
      <div className="scroll-reveal">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Result
        </p>
        <h2 className="mt-2 text-2xl font-bold">무엇을 만들었나</h2>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {metrics.map((metric, i) => (
          <FadeInUp key={metric.label} delay={i * 0.1}>
            <div className="rounded-lg border border-border p-6 text-center">
              <p className="text-[clamp(2.5rem,5vw,3rem)] font-bold leading-none">
                <CountUp end={metric.value} suffix={metric.suffix} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {metric.label}
              </p>
            </div>
          </FadeInUp>
        ))}
      </div>

      {demoVideo && (
        <FadeInUp className="mt-12">
          <div className="overflow-hidden rounded-lg border border-border shadow-lg">
            <video
              src={demoVideo.src}
              poster={demoVideo.poster}
              autoPlay
              muted
              loop
              playsInline
              className="h-auto w-full"
            >
              <track kind="descriptions" label="데모 영상 설명" />
            </video>
          </div>
        </FadeInUp>
      )}

      {screenshots && screenshots.length > 0 && (
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {screenshots.map((screenshot, i) => (
            <FadeInUp key={screenshot.src} delay={i * 0.1}>
              <div className="overflow-hidden rounded-lg border border-border shadow-lg">
                <Image
                  src={screenshot.src}
                  alt={screenshot.alt}
                  width={600}
                  height={400}
                  className="h-auto w-full"
                />
              </div>
            </FadeInUp>
          ))}
        </div>
      )}

      <FadeInUp className="mt-16">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Retrospective
        </p>
        <h2 className="mt-2 text-2xl font-bold">회고</h2>
        <div className="mt-6 text-[1.05rem] leading-[1.85] text-muted-foreground">
          {resultContent.split("\n\n").map((paragraph, i) => (
            <p key={i} className={i > 0 ? "mt-3" : ""}>
              {paragraph}
            </p>
          ))}
        </div>
      </FadeInUp>
    </section>
  );
}
