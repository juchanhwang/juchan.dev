import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostNavigation } from "../components/post-navigation";

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

describe("PostNavigation", () => {
  it("이전/다음 포스트를 모두 렌더링한다", () => {
    render(
      <PostNavigation
        prev={{ title: "React 기초", permalink: "/blog/prev" }}
        next={{ title: "TypeScript 패턴", permalink: "/blog/next" }}
      />,
    );

    expect(screen.getByText("React 기초")).toBeInTheDocument();
    expect(screen.getByText("TypeScript 패턴")).toBeInTheDocument();
    expect(screen.getByText("React 기초").closest("a")).toHaveAttribute(
      "href",
      "/blog/prev",
    );
    expect(screen.getByText("TypeScript 패턴").closest("a")).toHaveAttribute(
      "href",
      "/blog/next",
    );
  });

  it("이전 포스트가 없을 때 다음만 렌더링한다", () => {
    render(
      <PostNavigation
        prev={null}
        next={{ title: "TypeScript 패턴", permalink: "/blog/next" }}
      />,
    );

    expect(screen.getByText("TypeScript 패턴")).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
  });

  it("다음 포스트가 없을 때 이전만 렌더링한다", () => {
    render(
      <PostNavigation
        prev={{ title: "React 기초", permalink: "/blog/prev" }}
        next={null}
      />,
    );

    expect(screen.getByText("React 기초")).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
  });

  it("둘 다 없으면 아무것도 렌더링하지 않는다", () => {
    const { container } = render(
      <PostNavigation prev={null} next={null} />,
    );
    expect(container.innerHTML).toBe("");
  });
});
