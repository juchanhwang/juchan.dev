import type { ViewType } from "./types";

/**
 * Redis view counter 키 생성.
 *
 * 패턴:
 * - `views:blog:{slug}`
 * - `views:project:{slug}`
 *
 * @example
 * viewKey("blog", "hello-world") // "views:blog:hello-world"
 */
export function viewKey(type: ViewType, slug: string): string {
  return `views:${type}:${slug}`;
}
