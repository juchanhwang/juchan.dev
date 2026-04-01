import type { Career } from "@/lib/dummy-data";

interface CareerTimelineProps {
  careers: Career[];
}

export function CareerTimeline({ careers }: CareerTimelineProps) {
  return (
    <div className="space-y-8">
      {careers.map((career) => (
        <div key={career.period} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2.5 before:w-2.5 before:rounded-full before:bg-foreground after:absolute after:left-[4.5px] after:top-5 after:h-[calc(100%+1rem)] after:w-px after:bg-border last:after:hidden">
          <p className="text-sm text-muted-foreground">{career.period}</p>
          <p className="mt-1 font-semibold">
            {career.company} · {career.role}
          </p>
          <ul className="mt-2 space-y-1.5">
            {career.achievements.map((achievement) => (
              <li
                key={achievement}
                className="text-sm leading-relaxed text-muted-foreground before:mr-2 before:content-['·']"
              >
                {achievement}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
