import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import type { TrackViewResult } from "../lib/types";

// trackView Server Action mock — fe는 fetch-like 호출만 한다.
const trackViewMock = vi.fn<(type: string, slug: string) => Promise<TrackViewResult>>();
vi.mock("../actions", () => ({
  trackView: (type: string, slug: string) => trackViewMock(type, slug),
}));

// SUT는 mock 설정 후 import.
import { ViewTracker } from "../components/view-tracker";

beforeEach(() => {
  trackViewMock.mockReset();
  sessionStorage.clear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("ViewTracker", () => {
  it("마운트 시 trackView를 호출한다", async () => {
    trackViewMock.mockResolvedValue({ count: 11, skipped: null });

    render(<ViewTracker type="blog" slug="hello" initialCount={10} />);

    await waitFor(() => {
      expect(trackViewMock).toHaveBeenCalledWith("blog", "hello");
    });
  });

  it("trackView 반환 count로 UI를 갱신한다", async () => {
    trackViewMock.mockResolvedValue({ count: 42, skipped: null });

    render(<ViewTracker type="blog" slug="hello" initialCount={10} />);

    // 초기 렌더는 initialCount
    expect(screen.getByText("10")).toBeInTheDocument();

    // 비동기 업데이트 이후
    await waitFor(() => {
      expect(screen.getByText("42")).toBeInTheDocument();
    });
  });

  it("세션 가드 — 이미 마크된 키면 trackView를 호출하지 않는다", async () => {
    sessionStorage.setItem("viewed:blog:hello", "1");

    render(<ViewTracker type="blog" slug="hello" initialCount={7} />);

    // 짧게 대기해도 호출 없음을 확인
    await new Promise((r) => setTimeout(r, 20));
    expect(trackViewMock).not.toHaveBeenCalled();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("세션 가드 — 첫 호출 후 sessionStorage에 키가 기록된다", async () => {
    trackViewMock.mockResolvedValue({ count: 1, skipped: null });

    render(<ViewTracker type="blog" slug="first-visit" initialCount={0} />);

    await waitFor(() => {
      expect(sessionStorage.getItem("viewed:blog:first-visit")).toBe("1");
    });
  });

  it("skipped 케이스도 반환된 count를 그대로 반영한다", async () => {
    // owner 스킵 — count는 현재값이 들어온다
    trackViewMock.mockResolvedValue({ count: 99, skipped: "owner" });

    render(<ViewTracker type="blog" slug="owner-case" initialCount={0} />);

    await waitFor(() => {
      expect(screen.getByText("99")).toBeInTheDocument();
    });
  });

  it("trackView 실패 시 에러를 노출하지 않고 initialCount를 유지한다", async () => {
    trackViewMock.mockRejectedValue(new Error("network failure"));

    render(<ViewTracker type="blog" slug="error-case" initialCount={5} />);

    // 잠깐 대기 후에도 초기값 유지
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("hidden prop이 true면 렌더하지 않는다 (increment는 수행)", async () => {
    trackViewMock.mockResolvedValue({ count: 1, skipped: null });

    const { container } = render(
      <ViewTracker type="blog" slug="hidden-case" initialCount={0} hidden />,
    );

    await waitFor(() => {
      expect(trackViewMock).toHaveBeenCalled();
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("count === 0이고 hidden이 false여도 (initialCount 시점에) 렌더하지 않는다", () => {
    // trackView가 resolve되기 전의 동기 시점을 관찰한다. mock을 pending
    // Promise로 만들어 업데이트를 지연시키고, 초기 렌더 결과만 검증.
    trackViewMock.mockReturnValue(new Promise(() => {}));

    const { container } = render(
      <ViewTracker type="blog" slug="zero-case" initialCount={0} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("aria-label에 정확한 숫자를 제공한다 (스크린리더용)", async () => {
    trackViewMock.mockResolvedValue({ count: 1234, skipped: null });

    render(<ViewTracker type="blog" slug="a11y" initialCount={1234} />);

    const span = await screen.findByLabelText("조회수 1,234회");
    expect(span).toBeInTheDocument();
    // compact format은 별도
    expect(span).toHaveTextContent("1.2k");
  });

  it("className이 루트 span에 병합된다", async () => {
    trackViewMock.mockResolvedValue({ count: 5, skipped: null });

    render(
      <ViewTracker
        type="blog"
        slug="class-merge"
        initialCount={5}
        className="before:content-['·']"
      />,
    );

    const span = await screen.findByLabelText("조회수 5회");
    expect(span.className).toContain("before:content-['·']");
    expect(span.className).toContain("inline-flex");
  });
});
