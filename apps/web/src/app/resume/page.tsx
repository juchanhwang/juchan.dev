import { redirect } from "next/navigation";

const NOTION_RESUME_URL =
  "https://juchanhwang.notion.site/resume";

export default function ResumePage() {
  redirect(NOTION_RESUME_URL);
}
