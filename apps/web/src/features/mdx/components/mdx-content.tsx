"use client";

import * as runtime from "react/jsx-runtime";
import type { ComponentPropsWithoutRef, ComponentType, JSX } from "react";
import { CopyButton } from "./copy-button";

// MDX 컴파일 결과(code)는 post 단위로 고정이므로 모듈 스코프에서 캐시한다.
// 이렇게 해야 "렌더 중 컴포넌트 생성" 패턴을 피할 수 있다.
const mdxComponentCache = new Map<
  string,
  ComponentType<{ components?: Record<string, unknown> }>
>();

function getMDXComponent(code: string) {
  const cached = mdxComponentCache.get(code);
  if (cached) return cached;

  const fn = new Function(code);
  const Component = fn({ ...runtime }).default as ComponentType<{
    components?: Record<string, unknown>;
  }>;
  mdxComponentCache.set(code, Component);
  return Component;
}

function Pre({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  const codeElement = children as JSX.Element;
  const rawCode =
    typeof codeElement === "object" && codeElement?.props?.children
      ? extractTextFromChildren(codeElement.props.children)
      : "";

  return (
    <div className="group relative">
      <pre {...props}>{children}</pre>
      <CopyButton text={rawCode} />
    </div>
  );
}

function extractTextFromChildren(children: unknown): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractTextFromChildren).join("");
  if (typeof children === "object" && children !== null && "props" in children) {
    const el = children as JSX.Element;
    return extractTextFromChildren(el.props?.children ?? "");
  }
  return "";
}

const mdxComponents = {
  pre: Pre,
};

interface MDXContentProps {
  code: string;
}

/* eslint-disable react-hooks/static-components --
 * MDX 컴파일 결과(code)는 post 단위로 불변이며 모듈 스코프 Map에 캐시되므로
 * 동일 code 문자열에 대해서는 렌더마다 같은 컴포넌트 참조가 반환된다.
 * react-hooks/static-components 룰이 우려하는 "렌더마다 state 리셋" 문제는
 * 발생하지 않는다. MDX 런타임 특성상 정적 선언이 불가능한 정당한 예외. */
export function MDXContent({ code }: MDXContentProps) {
  const Component = getMDXComponent(code);
  return <Component components={mdxComponents} />;
}
/* eslint-enable react-hooks/static-components */
