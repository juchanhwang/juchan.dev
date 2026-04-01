"use client";

import * as runtime from "react/jsx-runtime";
import { type ComponentPropsWithoutRef, type JSX, useMemo } from "react";
import { CopyButton } from "./copy-button";

function useMDXComponent(code: string) {
  return useMemo(() => {
    const fn = new Function(code);
    return fn({ ...runtime }).default;
  }, [code]);
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

export function MDXContent({ code }: MDXContentProps) {
  const Component = useMDXComponent(code);
  return <Component components={mdxComponents} />;
}
