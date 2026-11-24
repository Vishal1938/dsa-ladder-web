import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

/** Problem statements are our own content from the repo, so no sanitiser is needed. */
export function renderMarkdown(src: string): string {
  return marked.parse(src, { async: false }) as string;
}
