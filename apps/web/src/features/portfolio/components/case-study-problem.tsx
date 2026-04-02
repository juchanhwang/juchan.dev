import type { AsIsRow } from "../lib/projects";

interface CaseStudyProblemProps {
  callout: string;
  content: string;
  asIsTable?: AsIsRow[];
}

export function CaseStudyProblem({
  callout,
  content,
  asIsTable,
}: CaseStudyProblemProps) {
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

      {asIsTable && asIsTable.length > 0 && (
        <div className="scroll-reveal mt-10">
          <h3 className="text-lg font-semibold">AS-IS</h3>

          {/* Desktop: table */}
          <div className="mt-4 hidden overflow-hidden rounded-lg border border-border sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    업무
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    사용 도구
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    한계
                  </th>
                </tr>
              </thead>
              <tbody>
                {asIsTable.map((row) => (
                  <tr
                    key={row.task}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-3 font-medium">{row.task}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.tool}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.limitation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="mt-4 space-y-3 sm:hidden">
            {asIsTable.map((row) => (
              <div
                key={row.task}
                className="rounded-lg border border-border p-4"
              >
                <p className="font-medium">{row.task}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground/70">
                    도구:
                  </span>{" "}
                  {row.tool}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground/70">
                    한계:
                  </span>{" "}
                  {row.limitation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
