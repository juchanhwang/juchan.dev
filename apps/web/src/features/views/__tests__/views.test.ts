import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// 1. server-only는 테스트 환경에서 noop으로 처리.
vi.mock("server-only", () => ({}));

// 2. @/lib/redis는 테스트마다 동적으로 mock 값을 주입할 수 있도록 구성.
const mockRedis = {
  get: vi.fn(),
  incr: vi.fn(),
  mget: vi.fn(),
};

vi.mock("@/lib/redis", () => ({
  get redis() {
    return mockRedisState.available ? mockRedis : null;
  },
  isRedisAvailable: () => mockRedisState.available,
}));

const mockRedisState = { available: true };

// 3. SUT는 mock 설정 이후에 import.
import { viewKey } from "../lib/keys";
import {
  getViewCount,
  getViewCounts,
  incrementViewCount,
} from "../lib/views";

beforeEach(() => {
  mockRedisState.available = true;
  mockRedis.get.mockReset();
  mockRedis.incr.mockReset();
  mockRedis.mget.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("viewKey", () => {
  it("blog 키를 생성한다", () => {
    expect(viewKey("blog", "hello-world")).toBe("views:blog:hello-world");
  });

  it("project 키를 생성한다", () => {
    expect(viewKey("project", "missionary")).toBe("views:project:missionary");
  });

  it("한글 슬러그도 그대로 보존한다", () => {
    expect(viewKey("blog", "리액트-입문")).toBe("views:blog:리액트-입문");
  });
});

describe("getViewCount", () => {
  it("Redis에서 조회한 값을 반환한다", async () => {
    mockRedis.get.mockResolvedValue(42);

    const count = await getViewCount("blog", "hello");

    expect(count).toBe(42);
    expect(mockRedis.get).toHaveBeenCalledWith("views:blog:hello");
  });

  it("키가 존재하지 않으면 0을 반환한다", async () => {
    mockRedis.get.mockResolvedValue(null);

    const count = await getViewCount("blog", "nonexistent");

    expect(count).toBe(0);
  });

  it("Redis 미사용 시 0을 반환하고 호출하지 않는다", async () => {
    mockRedisState.available = false;

    const count = await getViewCount("blog", "hello");

    expect(count).toBe(0);
    expect(mockRedis.get).not.toHaveBeenCalled();
  });
});

describe("incrementViewCount", () => {
  it("INCR 이후 새 카운트를 반환한다", async () => {
    mockRedis.incr.mockResolvedValue(43);

    const count = await incrementViewCount("blog", "hello");

    expect(count).toBe(43);
    expect(mockRedis.incr).toHaveBeenCalledWith("views:blog:hello");
  });

  it("project 타입도 올바른 키로 INCR", async () => {
    mockRedis.incr.mockResolvedValue(1);

    const count = await incrementViewCount("project", "my-harness");

    expect(count).toBe(1);
    expect(mockRedis.incr).toHaveBeenCalledWith("views:project:my-harness");
  });

  it("Redis 미사용 시 0을 반환하고 호출하지 않는다", async () => {
    mockRedisState.available = false;

    const count = await incrementViewCount("blog", "hello");

    expect(count).toBe(0);
    expect(mockRedis.incr).not.toHaveBeenCalled();
  });
});

describe("getViewCounts", () => {
  it("MGET 한 번으로 여러 키를 조회한다", async () => {
    mockRedis.mget.mockResolvedValue([10, 20, 30]);

    const counts = await getViewCounts("blog", ["a", "b", "c"]);

    expect(counts).toEqual({ a: 10, b: 20, c: 30 });
    expect(mockRedis.mget).toHaveBeenCalledWith(
      "views:blog:a",
      "views:blog:b",
      "views:blog:c",
    );
    expect(mockRedis.mget).toHaveBeenCalledOnce();
  });

  it("일부 키가 없으면 0으로 채운다", async () => {
    mockRedis.mget.mockResolvedValue([10, null, 30]);

    const counts = await getViewCounts("blog", ["a", "b", "c"]);

    expect(counts).toEqual({ a: 10, b: 0, c: 30 });
  });

  it("빈 슬러그 배열이면 Redis를 호출하지 않고 빈 객체를 반환한다", async () => {
    const counts = await getViewCounts("blog", []);

    expect(counts).toEqual({});
    expect(mockRedis.mget).not.toHaveBeenCalled();
  });

  it("Redis 미사용 시 모든 슬러그에 0을 반환한다", async () => {
    mockRedisState.available = false;

    const counts = await getViewCounts("blog", ["a", "b"]);

    expect(counts).toEqual({ a: 0, b: 0 });
    expect(mockRedis.mget).not.toHaveBeenCalled();
  });

  it("project 타입의 키로 조회한다", async () => {
    mockRedis.mget.mockResolvedValue([5]);

    const counts = await getViewCounts("project", ["my-harness"]);

    expect(counts).toEqual({ "my-harness": 5 });
    expect(mockRedis.mget).toHaveBeenCalledWith("views:project:my-harness");
  });
});
