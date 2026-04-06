import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostHeader } from "../components/post-header";

vi.mock("#velite", () => ({
  posts: [],
}));

// ViewCount는 async Server Component + Redis 호출을 포함하므로 jsdom에서는
// mock으로 치환한다. UI 테스트의 관심사는 헤더 구조이므로 placeholder만 렌더.
vi.mock("@/features/views", () => ({
  ViewCount: ({ slug }: { slug: string }) => (
    <span data-testid="view-count-mock">view:{slug}</span>
  ),
}));

const defaultProps = {
  title: "TypeScript 실전 패턴 모음",
  slug: "typescript-patterns",
  date: "2026-03-20T00:00:00.000Z",
  tags: ["TypeScript", "React"],
  readingTime: 8,
};

describe("PostHeader", () => {
  it("제목을 h1으로 렌더링한다", () => {
    render(<PostHeader {...defaultProps} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("TypeScript 실전 패턴 모음");
  });

  it("태그 배지를 모두 렌더링한다", () => {
    render(<PostHeader {...defaultProps} />);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("날짜와 읽기 시간을 표시한다", () => {
    render(<PostHeader {...defaultProps} />);
    expect(screen.getByText(/8분 읽기/)).toBeInTheDocument();
  });

  it("ViewCount에 slug가 전달된다", () => {
    render(<PostHeader {...defaultProps} />);
    expect(screen.getByTestId("view-count-mock")).toHaveTextContent(
      "view:typescript-patterns",
    );
  });

  it("구분선을 렌더링한다", () => {
    render(<PostHeader {...defaultProps} />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });
});
