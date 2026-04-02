interface CaseStudyProblemProps {
  callout: string;
  content: string;
}

export function CaseStudyProblem({ callout, content }: CaseStudyProblemProps) {
  return (
    <section id="problem" className="mx-auto max-w-3xl px-4 py-20">
      <div className="scroll-reveal">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Problem
        </p>
        <h2 className="mt-2 text-2xl font-bold">무엇이 문제였나</h2>
      </div>

      <blockquote className="scroll-reveal mt-8 border-l-4 border-foreground pl-6 text-xl italic leading-relaxed text-foreground/90">
        &ldquo;{callout}&rdquo;
      </blockquote>

      <div className="scroll-reveal mt-8 leading-relaxed text-muted-foreground">
        {content.split("\n\n").map((paragraph, i) => (
          <p key={i} className={i > 0 ? "mt-4" : ""}>
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
