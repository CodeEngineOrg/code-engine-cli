import { manifest } from "./manifest";

/**
 * Text explaining how to use the CLI
 */
export const usageText = `
Usage: code-engine [options] [files...]

options:
  -v, --version             Show the version number

  -q, --quiet               Suppress unnecessary output

  -h, --help                Show usage information

files...
  One or more files and/or globs to process (ex: README.md *.txt docs/**/*).
`;

/**
 * Text describing the program and how to use it
 */
export const helpText = `
CodeEngine - ${manifest.description}
${usageText}`;
