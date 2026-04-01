import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

export const pretendard = localFont({
  src: [
    {
      path: "../app/fonts/PretendardVariable.woff2",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "sans-serif",
  ],
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
