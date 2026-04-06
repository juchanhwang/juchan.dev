/**
 * View counter 대상 리소스 타입.
 * - `blog`: 블로그 포스트
 * - `project`: 프로젝트 케이스 스터디
 */
export type ViewType = "blog" | "project";

/** `trackView` Server Action 결과. */
export interface TrackViewResult {
  /** 현재 카운트. 스킵된 경우에도 현재 값을 반환한다. */
  count: number;
  /**
   * 증가가 스킵된 이유.
   * - `bot`: User-Agent가 봇으로 판정됨
   * - `owner`: `views_excluded` 쿠키가 설정된 본인
   * - `disabled`: Redis 환경변수 미설정 (주로 로컬 개발)
   * - `null`: 정상적으로 증가됨
   */
  skipped: "bot" | "owner" | "disabled" | null;
}
