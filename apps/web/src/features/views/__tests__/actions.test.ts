import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// server-only noop
vi.mock("server-only", () => ({}));

// Redis 가용성 및 views 헬퍼 mock
const redisState = { available: true };
vi.mock("@/lib/redis", () => ({
  get redis() {
    return redisState.available ? {} : null;
  },
  isRedisAvailable: () => redisState.available,
}));

const viewsMock = {
  getViewCount: vi.fn(),
  incrementViewCount: vi.fn(),
};
vi.mock("../lib/views", () => ({
  getViewCount: (...args: unknown[]) => viewsMock.getViewCount(...args),
  incrementViewCount: (...args: unknown[]) =>
    viewsMock.incrementViewCount(...args),
}));

// next/headers mock — cookies/headers는 Next.js 16에서 async 함수.
const cookieStore = { get: vi.fn() };
const headerStore = { get: vi.fn() };
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
  headers: vi.fn(async () => headerStore),
}));

// isbot mock
const isbotMock = vi.fn();
vi.mock("isbot", () => ({
  isbot: (ua: string) => isbotMock(ua),
}));

// SUT import (mock 설정 후)
import { trackView } from "../actions";

beforeEach(() => {
  redisState.available = true;
  cookieStore.get.mockReset();
  headerStore.get.mockReset();
  viewsMock.getViewCount.mockReset();
  viewsMock.incrementViewCount.mockReset();
  isbotMock.mockReset();
  isbotMock.mockReturnValue(false);
  headerStore.get.mockReturnValue(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("trackView", () => {
  it("정상 케이스: INCR 후 새 카운트를 반환한다", async () => {
    viewsMock.incrementViewCount.mockResolvedValue(10);

    const result = await trackView("blog", "hello");

    expect(result).toEqual({ count: 10, skipped: null });
    expect(viewsMock.incrementViewCount).toHaveBeenCalledWith("blog", "hello");
    expect(viewsMock.getViewCount).not.toHaveBeenCalled();
  });

  it("Redis 환경변수 미설정 시 skipped='disabled'와 count=0 반환", async () => {
    redisState.available = false;

    const result = await trackView("blog", "hello");

    expect(result).toEqual({ count: 0, skipped: "disabled" });
    expect(viewsMock.incrementViewCount).not.toHaveBeenCalled();
    expect(viewsMock.getViewCount).not.toHaveBeenCalled();
  });

  it("본인 쿠키가 있으면 skipped='owner'와 현재 카운트 반환", async () => {
    cookieStore.get.mockImplementation((name: string) =>
      name === "views_excluded" ? { value: "1" } : undefined,
    );
    viewsMock.getViewCount.mockResolvedValue(42);

    const result = await trackView("blog", "hello");

    expect(result).toEqual({ count: 42, skipped: "owner" });
    expect(cookieStore.get).toHaveBeenCalledWith("views_excluded");
    expect(viewsMock.getViewCount).toHaveBeenCalledWith("blog", "hello");
    expect(viewsMock.incrementViewCount).not.toHaveBeenCalled();
  });

  it("쿠키 값이 '1'이 아니면 본인으로 판단하지 않는다", async () => {
    cookieStore.get.mockImplementation((name: string) =>
      name === "views_excluded" ? { value: "0" } : undefined,
    );
    viewsMock.incrementViewCount.mockResolvedValue(11);

    const result = await trackView("blog", "hello");

    expect(result).toEqual({ count: 11, skipped: null });
    expect(viewsMock.incrementViewCount).toHaveBeenCalledOnce();
  });

  it("봇 User-Agent면 skipped='bot'과 현재 카운트 반환", async () => {
    headerStore.get.mockReturnValue(
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    );
    isbotMock.mockReturnValue(true);
    viewsMock.getViewCount.mockResolvedValue(7);

    const result = await trackView("project", "my-harness");

    expect(result).toEqual({ count: 7, skipped: "bot" });
    expect(isbotMock).toHaveBeenCalledWith(
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    );
    expect(viewsMock.getViewCount).toHaveBeenCalledWith(
      "project",
      "my-harness",
    );
    expect(viewsMock.incrementViewCount).not.toHaveBeenCalled();
  });

  it("User-Agent가 비어 있어도 isbot 검사를 거친다", async () => {
    headerStore.get.mockReturnValue(null);
    isbotMock.mockReturnValue(false);
    viewsMock.incrementViewCount.mockResolvedValue(1);

    const result = await trackView("blog", "edge");

    expect(isbotMock).toHaveBeenCalledWith("");
    expect(result).toEqual({ count: 1, skipped: null });
  });

  it("owner 검사가 bot 검사보다 우선한다", async () => {
    // 봇이면서 동시에 본인 쿠키도 있는 경우 → owner로 분류
    cookieStore.get.mockImplementation((name: string) =>
      name === "views_excluded" ? { value: "1" } : undefined,
    );
    isbotMock.mockReturnValue(true);
    viewsMock.getViewCount.mockResolvedValue(99);

    const result = await trackView("blog", "hello");

    expect(result.skipped).toBe("owner");
    expect(isbotMock).not.toHaveBeenCalled(); // owner에서 early return
  });
});
