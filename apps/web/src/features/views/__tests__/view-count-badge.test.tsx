import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ViewCountBadge } from "../components/view-count-badge";

describe("ViewCountBadge", () => {
  it("count가 양수면 compact 포맷으로 숫자를 렌더한다", () => {
    render(<ViewCountBadge count={1234} />);
    const el = screen.getByLabelText("조회수 1,234회");
    expect(el).toHaveTextContent("1.2k");
  });

  it("count가 0이어도 '0'을 렌더한다 (일관성 — 뱃지 누락 방지)", () => {
    // 리스팅 카드에서 "뱃지가 있는 카드 / 없는 카드"의 비일관성을 피하기 위해
    // 0도 그대로 표시한다. Redis 비활성 등 "표시 자체가 부적절한" 경우에는
    // 부모가 prop 자체를 전달하지 않는 것으로 처리한다.
    render(<ViewCountBadge count={0} />);
    const el = screen.getByLabelText("조회수 0회");
    expect(el).toHaveTextContent("0");
  });

  it("className이 루트 span에 병합된다", () => {
    render(<ViewCountBadge count={5} className="mt-1 text-xs" />);
    const el = screen.getByLabelText("조회수 5회");
    expect(el.className).toContain("mt-1");
    expect(el.className).toContain("text-xs");
    expect(el.className).toContain("inline-flex");
  });

  it("스크린리더용 aria-label에는 천 단위 구분 기호가 들어간다", () => {
    // compact 포맷("1.2k")은 시각적 표시, 보조공학엔 원래 숫자를 전달한다.
    render(<ViewCountBadge count={12345} />);
    expect(screen.getByLabelText("조회수 12,345회")).toBeInTheDocument();
  });
});
