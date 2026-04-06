import { describe, expect, it } from "vitest";

import { formatViewCount } from "../lib/format-views";

describe("formatViewCount", () => {
  describe("1000 미만 — 정수 그대로", () => {
    it("0을 '0'으로 반환한다", () => {
      expect(formatViewCount(0)).toBe("0");
    });

    it("1을 '1'로 반환한다", () => {
      expect(formatViewCount(1)).toBe("1");
    });

    it("999를 '999'로 반환한다", () => {
      expect(formatViewCount(999)).toBe("999");
    });

    it("소수점이 있는 입력은 내림 처리한다", () => {
      expect(formatViewCount(42.7)).toBe("42");
    });
  });

  describe("1000 이상 — k 접미사", () => {
    it("1000을 '1k'로 반환한다 (정수면 소수점 생략)", () => {
      expect(formatViewCount(1000)).toBe("1k");
    });

    it("1099를 '1.1k'로 반환한다", () => {
      expect(formatViewCount(1099)).toBe("1.1k");
    });

    it("1234를 '1.2k'로 반환한다", () => {
      expect(formatViewCount(1234)).toBe("1.2k");
    });

    it("12345를 '12.3k'로 반환한다", () => {
      expect(formatViewCount(12345)).toBe("12.3k");
    });

    it("99999는 반올림으로 '100k'가 된다", () => {
      expect(formatViewCount(99999)).toBe("100k");
    });
  });

  describe("1000000 이상 — m 접미사", () => {
    it("999999는 반올림으로 '1m'이 된다 (Intl 동작)", () => {
      // Intl.NumberFormat compact + maximumFractionDigits:1 은 경계값을
      // 반올림해 상위 단위로 올린다. 이 동작은 의도된 것으로 그대로 둔다.
      expect(formatViewCount(999999)).toBe("1m");
    });

    it("1000000을 '1m'으로 반환한다", () => {
      expect(formatViewCount(1000000)).toBe("1m");
    });

    it("1234567을 '1.2m'으로 반환한다", () => {
      expect(formatViewCount(1234567)).toBe("1.2m");
    });

    it("12345678을 '12.3m'으로 반환한다", () => {
      expect(formatViewCount(12345678)).toBe("12.3m");
    });
  });

  describe("비정상 입력 — '0'으로 폴백", () => {
    it("음수는 '0'으로 반환한다", () => {
      expect(formatViewCount(-1)).toBe("0");
      expect(formatViewCount(-1234)).toBe("0");
    });

    it("NaN은 '0'으로 반환한다", () => {
      expect(formatViewCount(Number.NaN)).toBe("0");
    });

    it("Infinity는 '0'으로 반환한다", () => {
      expect(formatViewCount(Number.POSITIVE_INFINITY)).toBe("0");
      expect(formatViewCount(Number.NEGATIVE_INFINITY)).toBe("0");
    });
  });
});
