import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CareerTimeline } from "@/components/portfolio/CareerTimeline";
import { SocialLinks } from "@/components/portfolio/SocialLinks";
import { careers, skills } from "@/lib/dummy-data";

export const metadata = {
  title: "About",
  description: "프론트엔드 개발자 주찬황 소개",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Bio */}
      <section className="flex flex-col items-start gap-6 sm:flex-row">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-muted text-3xl">
          👨‍💻
        </div>
        <div>
          <h1 className="text-2xl font-bold">주찬황</h1>
          <p className="mt-1 text-muted-foreground">Frontend Engineer</p>
          <SocialLinks />
        </div>
      </section>

      <Separator className="my-10" />

      {/* About */}
      <section>
        <h2 className="text-xl font-bold">소개</h2>
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
          <p>
            &ldquo;변경하기 쉬운 코드가 좋은 코드&rdquo;라는 철학을 가진 프론트엔드 개발자입니다.
          </p>
          <p>
            사용자에게 빠르고 접근성 높은 인터페이스를 제공하는 것에 관심이 많으며,
            컴포넌트 설계와 성능 최적화를 즐깁니다.
          </p>
          <p>
            기술 글을 쓰면서 학습한 내용을 정리하고, 오픈소스 생태계에 기여하는 것을 좋아합니다.
          </p>
        </div>
      </section>

      <Separator className="my-10" />

      {/* Skills */}
      <section>
        <h2 className="text-xl font-bold">기술 스택</h2>
        <div className="mt-4 space-y-4">
          {Object.entries(skills).map(([category, items]) => (
            <div key={category}>
              <p className="text-sm font-semibold text-muted-foreground">{category}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {items.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-sm font-normal">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-10" />

      {/* Career */}
      <section>
        <h2 className="text-xl font-bold">경력</h2>
        <div className="mt-6">
          <CareerTimeline careers={careers} />
        </div>
      </section>
    </div>
  );
}
