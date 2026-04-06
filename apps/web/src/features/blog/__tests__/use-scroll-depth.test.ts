import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollDepth } from "../lib/use-scroll-depth";

const captureEventMock = vi.fn();

vi.mock("@/lib/posthog", () => ({
  captureEvent: (...args: unknown[]) => captureEventMock(...args),
}));

vi.mock("#velite", () => ({
  posts: [],
}));

function setScroll({
  scrollY,
  innerHeight,
  scrollHeight,
}: {
  scrollY: number;
  innerHeight: number;
  scrollHeight: number;
}) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value: scrollY,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: innerHeight,
  });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    configurable: true,
    value: scrollHeight,
  });
}

describe("useScrollDepth", () => {
  beforeEach(() => {
    captureEventMock.mockClear();
  });

  afterEach(() => {
    setScroll({ scrollY: 0, innerHeight: 0, scrollHeight: 0 });
  });

  it("초기 진입 시 보이는 영역이 25% 미만이면 이벤트가 발생하지 않는다", () => {
    setScroll({ scrollY: 0, innerHeight: 100, scrollHeight: 1000 });
    renderHook(() => useScrollDepth("test-slug"));
    expect(captureEventMock).not.toHaveBeenCalled();
  });

  it("스크롤이 25% 마일스톤을 넘으면 post_scroll_depth 이벤트가 발생한다", () => {
    setScroll({ scrollY: 0, innerHeight: 100, scrollHeight: 1000 });
    renderHook(() => useScrollDepth("test-slug"));

    setScroll({ scrollY: 200, innerHeight: 100, scrollHeight: 1000 });
    window.dispatchEvent(new Event("scroll"));

    expect(captureEventMock).toHaveBeenCalledWith("post_scroll_depth", {
      slug: "test-slug",
      depth: 25,
    });
  });

  it("같은 마일스톤이 두 번 트리거되지 않는다", () => {
    setScroll({ scrollY: 0, innerHeight: 100, scrollHeight: 1000 });
    renderHook(() => useScrollDepth("test-slug"));

    setScroll({ scrollY: 200, innerHeight: 100, scrollHeight: 1000 });
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("scroll"));

    const calls25 = captureEventMock.mock.calls.filter(
      ([, props]) => (props as { depth: number }).depth === 25,
    );
    expect(calls25).toHaveLength(1);
  });

  it("100% 도달 시 모든 마일스톤이 순차적으로 발행된다", () => {
    setScroll({ scrollY: 0, innerHeight: 100, scrollHeight: 1000 });
    renderHook(() => useScrollDepth("test-slug"));

    setScroll({ scrollY: 900, innerHeight: 100, scrollHeight: 1000 });
    window.dispatchEvent(new Event("scroll"));

    const depths = captureEventMock.mock.calls.map(
      ([, props]) => (props as { depth: number }).depth,
    );
    expect(depths).toEqual([25, 50, 75, 100]);
  });

  it("scrollHeight가 0이면 아무 이벤트도 발생하지 않는다", () => {
    setScroll({ scrollY: 0, innerHeight: 100, scrollHeight: 0 });
    renderHook(() => useScrollDepth("test-slug"));

    window.dispatchEvent(new Event("scroll"));

    expect(captureEventMock).not.toHaveBeenCalled();
  });
});
