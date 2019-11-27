import { manifest } from "./manifest";

/**
 * Banner text displayed at startup
 */
export const bannerText =
  " ______            __          ______                                 \n" +
  "|   ___|          |  |        |   ___|               __               \n" +
  "|  |     _____  __|  | _____  |  |_    __ __  _____ |__| __ __  _____ \n" +
  "|  |    |  _  ||  _  ||  __ | |   _|  |  \\  ||  _  ||  ||  \\  ||  __ |\n" +
  "|  |___ | |_| || |_| ||  __|  |  |___ |     || |_| ||  ||     ||  __| \n" +
  "|______||_____||_____||_____| |______||__\\__||___  ||__||__\\__||_____|\n" +
  "                                             |_____|                  \n" +
  center(manifest.description, 70) + "\n" +
  center(`v${manifest.version}`, 70) + "\n"
;

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
export const helpText = `\n${bannerText}${usageText}`;

/**
 * Centers a string
 */
function center(text: string, length: number): string {
  let padding = Math.max(0, length - text.length);
  let right = " ".repeat(Math.floor(padding / 2));
  let left = " ".repeat(padding - right.length);
  return `${left}${text}${right}`;
}
