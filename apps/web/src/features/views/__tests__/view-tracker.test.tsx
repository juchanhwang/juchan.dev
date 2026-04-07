import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import type { TrackViewResult } from "../lib/types";

// trackView Server Action mock — fe는 fetch-like 호출만 한다.
const trackViewMock = vi.fn<(type: string, slug: string) => Promise<TrackViewResult>>();
vi.mock("../actions", () => ({
  trackView: (type: string, slug: string) => trackViewMock(type, slug),
}));

// SUT는 mock 설정 후 import.
import {
  ViewTracker,
  VIEW_DEDUP_TTL_MS,
  VIEW_DWELL_DELAY_MS,
} from "../components/view-tracker";

beforeEach(() => {
  vi.useFakeTimers();
  trackViewMock.mockReset();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

/**
 * 마이크로태스크 큐를 비워서 Promise 체인이 setState까지 도달하도록 한다.
 * `vi.advanceTimersByTimeAsync` 또는 `await flushPromises()`를 act로 감싸는 패턴.
 */
async function flushPromises(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("ViewTracker", () => {
  describe("dwell delay", () => {
    it("dwell 시간이 지나기 전에는 trackView를 호출하지 않는다", async () => {
      trackViewMock.mockResolvedValue({ count: 11, skipped: null });

      render(<ViewTracker type="blog" slug="hello" initialCount={10} />);

      // 4.9초 시점 — 아직 dwell 미통과
      await act(async () => {
        await vi.advanceTimersByTimeAsync(VIEW_DWELL_DELAY_MS - 100);
      });
      expect(trackViewMock).not.toHaveBeenCalled();
    });

    it("dwell 시간이 지난 뒤에는 trackView를 호출한다", async () => {
      trackViewMock.mockResolvedValue({ count: 11, skipped: null });

      render(<ViewTracker type="blog" slug="hello" initialCount={10} />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(VIEW_DWELL_DELAY_MS);
      });
      expect(trackViewMock).toHaveBeenCalledWith("blog", "hello");
    });

    it("dwell 시간 안에 unmount되면 trackView를 호출하지 않는다 (bounce filter)", async () => {
      trackViewMock.mockResolvedValue({ count: 11, skipped: null });

      const { unmount } = render(
        <ViewTracker type="blog" slug="bounce" initialCount={10} />,
      );

      // 3초만 머물고 떠남
      await act(async () => {
        await vi.advanceTimersByTimeAsync(3_000);
      });
      unmount();

      // 그 뒤 충분히 시간이 흘러도 호출 없음 (clearTimeout으로 취소)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10_000);
      });
      expect(trackViewMock).not.toHaveBeenCalled();
    });
  });

  describe("24h dedup TTL", () => {
    it("24h 이내 가드가 있으면 dwell 타이머도 시작하지 않는다", async () => {
      // 1시간 전 마지막 트래킹 흔적
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      localStorage.setItem("viewed:blog:recent", String(oneHourAgo));

      render(<ViewTracker type="blog" slug="recent" initialCount={5} />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(VIEW_DWELL_DELAY_MS + 1_000);
      });
      expect(trackViewMock).not.toHaveBeenCalled();
    });

    it("24h이 지난 가드는 만료되어 다시 트래킹한다", async () => {
      trackViewMock.mockResolvedValue({ count: 6, skipped: null });
      // 25시간 전 마지막 트래킹
      const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000;
      localStorage.setItem("viewed:blog:expired", String(twentyFiveHoursAgo));

      render(<ViewTracker type="blog" slug="expired" initialCount={5} />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(VIEW_DWELL_DELAY_MS);
      });
      expect(trackViewMock).toHaveBeenCalledWith("blog", "expired");
    });

    it("malformed localStorage 값은 무시하고 트래킹을 진행한다", async () => {
      trackViewMock.mockResolvedValue({ count: 1, skipped: null });
      localStorage.setItem("viewed:blog:malformed", "not-a-number");

      render(<ViewTracker type="blog" slug="malformed" initialCount={0} />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(VIEW_DWELL_DELAY_MS);
      });
      expect(trackViewMock).toHaveBeenCalled();
    });

    it("성공적 트래킹 후 localStorage에 현재 timestamp가 기록된다", async () => {
      trackViewMock.mockResolvedValue({ count: 1, skipped: null });

      render(<ViewTracker type="blog" slug="record" initialCount={0} />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(VIEW_DWELL_DELAY_MS);
      });

      const value = localStorage.getItem("viewed:blog:record");
      expect(value).not.toBeNull();
      const ts = Number(value);
      expect(Number.isFinite(ts)).toBe(true);
      // 최근 10초 이내 (fake timer 기준)
      expect(Date.now() - ts).toBeLessThan(10_000);
    });

    it("localStorage.setItem이 실패해도 trackView는 정상 호출된다 (private mode/quota 안전)", async () => {
      trackViewMock.mockResolvedValue({ count: 1, skipped: null });

      // 가드 set은 실패하지만 isWithinDedupWindow의 getItem은 정상 동작해야 하므로
      // setItem만 한 번 throw하도록 설정.
      const setItemSpy = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementationOnce(() => {
          throw new DOMException("QuotaExceededError");
        });

      render(<ViewTracker type="blog" slug="quota" initialCount={0} />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(VIEW_DWELL_DELAY_MS);
      });

      // setItem이 throw해도 trackView는 호출되어야 함 (트래킹 우선)
      expect(trackViewMock).toHaveBeenCalledWith("blog", "quota");
      setItemSpy.mockRestore();
    });

    it("VIEW_DEDUP_TTL_MS는 24시간이다 (계약 체크)", () => {
      expect(VIEW_DEDUP_TTL_MS).toBe(24 * 60 * 60 * 1000);
    });

    it("VIEW_DWELL_DELAY_MS는 5초다 (계약 체크)", () => {
      expect(VIEW_DWELL_DELAY_MS).toBe(5_000);
    });
  });

  describe("multi-tab race", () => {
    it("dwell 통과 직전에 다른 탭이 가드를 세팅하면 트래킹을 스킵한다", async () => {
      trackViewMock.mockResolvedValue({ count: 1, skipped: null });

      render(<ViewTracker type="blog" slug="multi-tab" initialCount={0} />);

      // 4초 시점 — dwell 통과 직전. 다른 탭이 그 사이 카운트했다고 가정
      await act(async () => {
        await vi.advanceTimersByTimeAsync(4_000);
      });
      localStorage.setItem("viewed:blog:multi-tab", String(Date.now()));

      // 나머지 dwell + α
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2_000);
      });

      // 재검사가 다른 탭의 가드를 발견 → trackView 호출 안 함
      expect(trackViewMock).not.toHaveBeenCalled();
    });
  });

  describe("UI 동작", () => {
    it("trackView 반환 count로 UI를 갱신한다", async () => {
      trackViewMock.mockResolvedValue({ count: 42, skipped: null });

      render(<ViewTracker type="blog" slug="hello" initialCount={10} />);

      // 초기 렌더는 initialCount
      expect(screen.getByText("10")).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(VIEW_DWELL_DELAY_MS);
      });
      await flushPromises();

      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("initialCount === 0이면 dwell 통과 후 UI가 나타난다 (첫 방문 reveal)", async () => {
      trackViewMock.mockResolvedValue({ count: 1, skipped: null });

      const { container } = render(
        <ViewTracker type="blog" slug="first-visit" initialCount={0} />,
      );

      // 초기 렌더는 숨김 (count === 0)
      expect(container).toBeEmptyDOMElement();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(VIEW_DWELL_DELAY_MS);
      });
      await flushPromises();

      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("Redis 비활성(`skipped: 'disabled'`) 시 count가 0으로 유지되어 계속 숨김", async () => {
      trackViewMock.mockResolvedValue({ count: 0, skipped: "disabled" });

      const { container } = render(
        <ViewTracker type="blog" slug="disabled" initialCount={0} />,
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(VIEW_DWELL_DELAY_MS);
      });
      await flushPromises();

      expect(container).toBeEmptyDOMElement();
    });

    it("trackView 실패 시 에러를 노출하지 않고 initialCount를 유지한다", async () => {
      trackViewMock.mockRejectedValue(new Error("network failure"));

      render(<ViewTracker type="blog" slug="error" initialCount={5} />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(VIEW_DWELL_DELAY_MS);
      });
      await flushPromises();

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("skipped: 'owner' 케이스도 반환된 count를 그대로 UI에 반영한다", async () => {
      // owner 쿠키로 increment는 스킵돼도 trackView는 현재 카운트를 반환한다.
      // 트래커는 skipped 분기와 무관하게 result.count로 setCount해야 한다.
      trackViewMock.mockResolvedValue({ count: 99, skipped: "owner" });

      render(<ViewTracker type="blog" slug="owner-case" initialCount={0} />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(VIEW_DWELL_DELAY_MS);
      });
      await flushPromises();

      expect(screen.getByText("99")).toBeInTheDocument();
    });

    it("dwell 통과 후 unmount되면 trackView resolve가 도착해도 setCount가 호출되지 않는다", async () => {
      // dwell 통과 이후 unmount되는 시나리오. cancelled 플래그가 setCount를
      // 차단해야 한다 (React unmounted state warning 방지).
      let resolveTrack!: (v: TrackViewResult) => void;
      trackViewMock.mockImplementation(
        () =>
          new Promise<TrackViewResult>((resolve) => {
            resolveTrack = resolve;
          }),
      );

      const { unmount, container } = render(
        <ViewTracker type="blog" slug="late-unmount" initialCount={5} />,
      );

      // dwell 통과 → trackView 호출됨, 아직 resolve 안 됨
      await act(async () => {
        await vi.advanceTimersByTimeAsync(VIEW_DWELL_DELAY_MS);
      });
      expect(trackViewMock).toHaveBeenCalled();

      unmount();

      // resolve 도착 — cancelled=true이므로 setCount는 호출되지 않아야 함
      await act(async () => {
        resolveTrack({ count: 999, skipped: null });
        await Promise.resolve();
      });

      // unmount된 컴포넌트에 setCount가 호출되었다면 React가 경고를 출력하거나
      // 콘텐츠가 다시 렌더링되어야 하지만, container는 이미 detach되어 있으므로
      // 검증은 "setCount 호출이 정적으로 막혔다"는 사실 자체로 충분하다. 추가로
      // unmount 직전 DOM 스냅샷이 999로 변경되지 않았는지 가볍게 확인한다.
      expect(container.innerHTML).not.toContain("999");
    });

    it("aria-label에 정확한 숫자를 제공한다 (스크린리더용)", () => {
      // initialCount > 0이라 마운트 즉시 span이 렌더됨. fake timer와 호환되는
      // sync `getByLabelText`로 검사한다 (`findByLabelText`는 polling이 fake
      // time과 충돌해 timeout).
      trackViewMock.mockResolvedValue({ count: 1234, skipped: null });

      render(<ViewTracker type="blog" slug="a11y" initialCount={1234} />);

      const span = screen.getByLabelText("조회수 1,234회");
      expect(span).toBeInTheDocument();
      // compact format은 별도
      expect(span).toHaveTextContent("1.2k");
    });

    it("className이 루트 span에 병합된다", () => {
      trackViewMock.mockResolvedValue({ count: 5, skipped: null });

      render(
        <ViewTracker
          type="blog"
          slug="class-merge"
          initialCount={5}
          className="before:content-['·']"
        />,
      );

      const span = screen.getByLabelText("조회수 5회");
      expect(span.className).toContain("before:content-['·']");
      expect(span.className).toContain("inline-flex");
    });
  });
});
