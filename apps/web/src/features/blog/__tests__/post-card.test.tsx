import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostCard } from "../components/post-card";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("#velite", () => ({
  posts: [],
}));

// ViewCountBadge는 presentational이지만 barrel을 타면 server-only 헬퍼까지
// import 체인을 만든다. jsdom에서 안전하게 돌리기 위해 feature barrel을 mock.
vi.mock("@/features/views", () => ({
  ViewCountBadge: ({ count }: { count: number }) => (
    <span data-testid="view-count-badge-mock">views:{count}</span>
  ),
}));

const defaultProps = {
  title: "React Server Components 실전 가이드",
  description: "RSC의 핵심 개념부터 실전 패턴까지 정리했습니다.",
  date: "2026-03-28T00:00:00.000Z",
  tags: ["React", "Next.js"],
  readingTime: 5,
  permalink: "/blog/react-server-components",
};

describe("PostCard", () => {
  it("제목을 렌더링한다", () => {
    render(<PostCard {...defaultProps} />);
    expect(
      screen.getByText("React Server Components 실전 가이드"),
    ).toBeInTheDocument();
  });

  it("설명을 렌더링한다", () => {
    render(<PostCard {...defaultProps} />);
    expect(
      screen.getByText("RSC의 핵심 개념부터 실전 패턴까지 정리했습니다."),
    ).toBeInTheDocument();
  });

  it("태그를 모두 렌더링한다", () => {
    render(<PostCard {...defaultProps} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
  });

  it("읽기 시간을 표시한다", () => {
    render(<PostCard {...defaultProps} />);
    expect(screen.getByText(/5분 읽기/)).toBeInTheDocument();
  });

  it("포스트 링크가 올바른 href를 가진다", () => {
    render(<PostCard {...defaultProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/blog/react-server-components");
  });

  it("viewCount가 전달되면 뱃지를 렌더링한다", () => {
    render(<PostCard {...defaultProps} viewCount={42} />);
    expect(screen.getByTestId("view-count-badge-mock")).toHaveTextContent(
      "views:42",
    );
  });

  it("viewCount가 0이면 뱃지를 렌더링하지 않는다", () => {
    render(<PostCard {...defaultProps} viewCount={0} />);
    expect(screen.queryByTestId("view-count-badge-mock")).not.toBeInTheDocument();
  });

  it("viewCount가 undefined면 뱃지를 렌더링하지 않는다", () => {
    render(<PostCard {...defaultProps} />);
    expect(screen.queryByTestId("view-count-badge-mock")).not.toBeInTheDocument();
  });
});
