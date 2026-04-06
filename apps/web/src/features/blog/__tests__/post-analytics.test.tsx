import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { PostAnalytics } from "../components/post-analytics";

const captureEventMock = vi.fn();

vi.mock("@/lib/posthog", () => ({
  captureEvent: (...args: unknown[]) => captureEventMock(...args),
}));

vi.mock("../lib/use-scroll-depth", () => ({
  useScrollDepth: vi.fn(),
}));

vi.mock("../lib/use-dwell-time", () => ({
  useDwellTime: vi.fn(),
}));

vi.mock("#velite", () => ({
  posts: [],
}));

describe("PostAnalytics", () => {
  beforeEach(() => {
    captureEventMock.mockClear();
  });

  it("마운트 시 post_view 이벤트를 한 번 발행한다", () => {
    render(
      <PostAnalytics
        slug="react-server-components"
        tags={["React", "Next.js"]}
        readingTime={5}
      />,
    );

    expect(captureEventMock).toHaveBeenCalledTimes(1);
    expect(captureEventMock).toHaveBeenCalledWith("post_view", {
      slug: "react-server-components",
      tags: ["React", "Next.js"],
      readingTime: 5,
    });
  });

  it("렌더링 출력이 없다", () => {
    const { container } = render(
      <PostAnalytics slug="x" tags={[]} readingTime={1} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
