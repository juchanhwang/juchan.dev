import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { jetbrainsMono } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "@/components/posthog-provider";
import { Header, Footer } from "@/features/layout";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "juchan.dev",
    template: "%s | juchan.dev",
  },
  description: "프론트엔드 개발자 주찬황의 기술 블로그 + 포트폴리오",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body
        className={`${jetbrainsMono.variable} min-h-dvh flex flex-col antialiased`}
        style={{
          fontFamily:
            '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PostHogProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </PostHogProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
