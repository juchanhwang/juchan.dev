import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * 본인 제외 쿠키를 설정하는 route handler.
 *
 * 사용법:
 * ```
 * GET /admin/exclude-views?key=<EXCLUDE_VIEWS_SECRET>
 * ```
 *
 * 쿼리의 `key`가 `EXCLUDE_VIEWS_SECRET` 환경변수와 일치하면
 * `views_excluded=1` HttpOnly 쿠키를 10년 만료로 설정한다.
 * 이후 `trackView` Server Action은 이 쿠키를 감지해 view count 증가를 스킵한다.
 *
 * - 비밀이 설정되지 않았거나(`EXCLUDE_VIEWS_SECRET` 미설정) 잘못된 경우 401 반환.
 * - 성공 시에도 비밀을 URL에 그대로 두면 로그에 남을 수 있으니
 *   사용 후 히스토리/로그를 정리할 것을 권장한다.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const expected = process.env.EXCLUDE_VIEWS_SECRET;

  // Secret 미설정 또는 불일치 — 존재 여부를 노출하지 않도록 동일 401 응답.
  if (!expected || key !== expected) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("views_excluded", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365 * 10, // 10년
    path: "/",
  });

  return new NextResponse(
    "View tracking excluded for this device. You can close this tab.",
    { status: 200 },
  );
}
