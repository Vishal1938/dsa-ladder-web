import type { Param, Status } from "../api/types";

export const STATUS_LABEL: Record<Status, string> = {
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  COMPILE_ERROR: "Compile Error",
  RUNTIME_ERROR: "Runtime Error",
  TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
  OUTPUT_LIMIT_EXCEEDED: "Output Limit Exceeded",
  INTERNAL_ERROR: "Judge Error",
};

/** "[[1,2],3]" + params → [{name:"nums", value:"[1,2]"}, {name:"k", value:"3"}] */
export function splitArgs(inputJson: string | undefined, params: Param[]): { name: string; value: string }[] {
  if (!inputJson) return [];
  try {
    const arr = JSON.parse(inputJson) as unknown[];
    return arr.map((v, i) => ({ name: params[i]?.name ?? `arg${i}`, value: JSON.stringify(v) }));
  } catch {
    return [{ name: "input", value: inputJson }];
  }
}

export function shorten(s: string | undefined, max = 600): string {
  if (!s) return "";
  return s.length > max ? s.slice(0, max) + ` … (${s.length - max} more characters)` : s;
}

export function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString();
}
