// Bundle Monaco locally (no CDN) with only the Java language.
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
// editor.api is only the core; edcore.main adds the suggest widget, hovers, find, folding, etc.
import "monaco-editor/esm/vs/editor/edcore.main";
import "monaco-editor/esm/vs/basic-languages/java/java.contribution";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { loader } from "@monaco-editor/react";

(self as unknown as { MonacoEnvironment: unknown }).MonacoEnvironment = { getWorker: () => new EditorWorker() };
loader.config({ monaco });

monaco.editor.defineTheme("ladder", {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "keyword", foreground: "8fa6ff" },
    { token: "number", foreground: "f2b866" },
    { token: "string", foreground: "7fd9c4" },
    { token: "comment", foreground: "5f7183", fontStyle: "italic" },
  ],
  colors: {
    "editor.background": "#0c131a",
    "editor.lineHighlightBackground": "#121c25",
    "editorLineNumber.foreground": "#3b4b5a",
    "editorLineNumber.activeForeground": "#9fb0bf",
    "editorCursor.foreground": "#35d0b4",
    "editor.selectionBackground": "#25405c",
  },
});

export { monaco };
