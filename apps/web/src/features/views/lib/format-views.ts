/**
 * View count를 사람이 읽기 편한 compact 포맷으로 변환한다.
 *
 * - `< 1000`: 정수 그대로 (예: `0`, `42`, `999`)
 * - `>= 1000`: `k`/`m` 접미사, 소수점 1자리 (정수면 소수점 생략)
 *   - `1000` → `"1k"`
 *   - `1234` → `"1.2k"`
 *   - `12345` → `"12.3k"`
 *   - `1234567` → `"1.2m"`
 *
 * 음수, `NaN`, `Infinity` 등 비정상 입력은 `"0"`으로 폴백한다 — UI에서
 * 깨지거나 `-Infinity` 같은 문자열이 그대로 노출되는 사고를 방지한다.
 *
 * ⚠️ `Intl.NumberFormat`은 기본적으로 반올림을 적용한다.
 * 예: `999999 → "1M"` (반올림). 이 동작은 의도된 것이며, 세그먼트 경계에서
 * 사용자에게 혼란을 주지 않도록 그대로 사용한다.
 *
 * @example
 * formatViewCount(0);       // "0"
 * formatViewCount(999);     // "999"
 * formatViewCount(1000);    // "1k"
 * formatViewCount(1234);    // "1.2k"
 * formatViewCount(1234567); // "1.2m"
 */
export function formatViewCount(count: number): string {
  if (!Number.isFinite(count) || count < 0) {
    return "0";
  }

  const safe = Math.floor(count);

  if (safe < 1000) {
    return String(safe);
  }

  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  return formatter.format(safe).toLowerCase();
}
