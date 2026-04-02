import { SKILLS } from "../lib/data";

export function SkillsSection() {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold">기술 스택</h2>
      <div className="mt-4 flex flex-col gap-4">
        {SKILLS.map((group) => (
          <div key={group.category}>
            <p className="text-sm font-semibold text-muted-foreground">
              {group.category}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-secondary px-3 py-1 text-[13px] text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
