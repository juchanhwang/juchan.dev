import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDwellTime } from "../lib/use-dwell-time";

const captureEventMock = vi.fn();

vi.mock("@/lib/posthog", () => ({
  captureEvent: (...args: unknown[]) => captureEventMock(...args),
}));

vi.mock("#velite", () => ({
  posts: [],
}));

function setVisibility(state: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("useDwellTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    captureEventMock.mockClear();
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("페이지를 떠날 때 머문 시간이 post_dwell_time으로 전송된다", () => {
    const { unmount } = renderHook(() => useDwellTime("test-slug"));

    vi.advanceTimersByTime(5_000);
    unmount();

    expect(captureEventMock).toHaveBeenCalledWith("post_dwell_time", {
      slug: "test-slug",
      seconds: 5,
    });
  });

  it("백그라운드로 전환된 시간은 누적되지 않는다", () => {
    const { unmount } = renderHook(() => useDwellTime("test-slug"));

    vi.advanceTimersByTime(3_000);
    setVisibility("hidden");

    vi.advanceTimersByTime(10_000); // 백그라운드 — 무시되어야 함
    setVisibility("visible");

    vi.advanceTimersByTime(2_000);
    unmount();

    expect(captureEventMock).toHaveBeenCalledWith("post_dwell_time", {
      slug: "test-slug",
      seconds: 5,
    });
  });

  it("머문 시간이 0초면 이벤트가 전송되지 않는다", () => {
    const { unmount } = renderHook(() => useDwellTime("test-slug"));

    unmount();

    expect(captureEventMock).not.toHaveBeenCalled();
  });

  it("pagehide 이벤트로도 머문 시간이 전송된다", () => {
    renderHook(() => useDwellTime("test-slug"));

    vi.advanceTimersByTime(4_000);
    window.dispatchEvent(new Event("pagehide"));

    expect(captureEventMock).toHaveBeenCalledWith("post_dwell_time", {
      slug: "test-slug",
      seconds: 4,
    });
  });
});
