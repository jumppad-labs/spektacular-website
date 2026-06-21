import { defineEcConfig } from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";

export default defineEcConfig({
  themes: ["github-dark"],
  plugins: [pluginLineNumbers()],
  defaultProps: {
    // Wrap long lines instead of horizontal scroll. Prose-style blocks
    // (requirements, terminal transcripts) read far better wrapped.
    wrap: true,
    // Line numbers off by default; opt in per block with `showLineNumbers`.
    showLineNumbers: false,
    // Shell commands shouldn't preserve indent on wrapped continuation lines.
    overridesByLang: {
      "bash,sh,shell,ps,powershell": { preserveIndent: false },
    },
  },
  // Match the existing dark palette so the migration doesn't change the look.
  styleOverrides: {
    codeBackground: "#1c2128",
    borderColor: "#30363d",
    borderRadius: "0.5rem",
    codeFontSize: "0.8125rem",
    codeLineHeight: "1.625",
    frames: {
      editorBackground: "#1c2128",
      terminalBackground: "#1c2128",
      terminalTitlebarBackground: "#161b22",
      terminalTitlebarBorderBottom: "#30363d",
    },
  },
});
