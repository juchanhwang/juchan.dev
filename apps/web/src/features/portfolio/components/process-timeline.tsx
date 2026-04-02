import type { ProcessStep } from "../lib/projects";

interface ProcessTimelineProps {
  steps: ProcessStep[];
}

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  return (
    <section id="process" className="mx-auto max-w-3xl px-4 py-20">
      <div className="scroll-reveal">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Process
        </p>
        <h2 className="mt-2 text-2xl font-bold">어떻게 해결했나</h2>
      </div>

      <div className="mt-12 space-y-16">
        {steps.map((step) => (
          <div key={step.number} className="scroll-reveal">
            <p className="text-sm font-medium text-muted-foreground">
              {step.number}
            </p>
            <h3 className="mt-1 text-xl font-semibold">{step.title}</h3>
            <div className="mt-4 leading-relaxed text-muted-foreground">
              {step.description.split("\n\n").map((paragraph, i) => (
                <p key={i} className={i > 0 ? "mt-3" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
