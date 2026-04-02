export const PROFILE = {
  name: "황주찬",
  nameEn: "Ju-Chan Hwang",
  role: "Frontend Developer",
  intro:
    "변경하기 쉬운 코드가 좋은 코드라는 철학을 가진 프론트엔드 개발자입니다.",
  social: {
    github: "https://github.com/juchanhwang",
    linkedin: "https://www.linkedin.com/in/juchanhwang",
    email: "juchanhwang@gmail.com",
  },
} as const;

export interface SkillGroup {
  category: string;
  items: readonly string[];
}

export const SKILLS: SkillGroup[] = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    category: "Backend",
    items: ["Node.js", "NestJS", "PostgreSQL"],
  },
  {
    category: "Tools",
    items: ["Git", "Vercel", "Turborepo", "pnpm"],
  },
];

export const ABOUT_PARAGRAPHS = [
  "사용자에게 빠르고 접근성 높은 인터페이스를 제공하는 것에 관심이 많으며, 컴포넌트 설계와 성능 최적화를 즐깁니다.",
  "기술 글을 쓰면서 학습한 내용을 정리하고, 오픈소스 생태계에 기여하는 것을 좋아합니다.",
];
