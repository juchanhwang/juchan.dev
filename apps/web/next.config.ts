import type { NextConfig } from "next";

const isDev = process.argv.indexOf("dev") !== -1;
if (!process.env.VELITE_STARTED && isDev) {
  process.env.VELITE_STARTED = "1";
  import("velite").then((m) => m.build({ watch: true, clean: false }));
}

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/resume",
        destination:
          "https://juchan-about.notion.site/Ju-Chan-Hwang-f36abb2007f243c89e3809716b050122",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
