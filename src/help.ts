import { manifest } from "./manifest";

/**
 * Banner text displayed at startup
 * @internal
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
 * @internal
 */
export const usageText = `
Usage: code-engine [options] [generator] [sources...]

options:
  --dev                 Build for local development insted of production

  -w, --watch           Watch source files and automatically re-build when changed

  -d, --debug           Enable verbose debug logging

  -q, --quiet           Suppress unnecessary output

  -v, --version         Show the version number

  -h, --help            Show usage information

generator:
  The name or path of the CodeEngine generator to run. Generators are Node packages
  that configure CodeEngine plugins, sources, destinations, etc. Defaults to "./"

sources...
  One or more files, directories, and/or globs to process (eg: README.md *.txt docs/**/*).
  Defaults to all files in the current directory and subdirectories (i.e. **/*)
`;

/**
 * Text describing the program and how to use it
 * @internal
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
