import { Manifest } from "./config";

/**
 * Retruns the CodeEngine ASCII art banner
 * @internal
 */
export function getBanner(manifest: Manifest) {
  return " ______            __          ______                                 \n" +
         "|   ___|          |  |        |   ___|               __               \n" +
         "|  |     _____  __|  | _____  |  |_    __ __  _____ |__| __ __  _____ \n" +
         "|  |    |  _  ||  _  ||  __ | |   _|  |  \\  ||  _  ||  ||  \\  ||  __ |\n" +
         "|  |___ | |_| || |_| ||  __|  |  |___ |     || |_| ||  ||     ||  __| \n" +
         "|______||_____||_____||_____| |______||__\\__||___  ||__||__\\__||_____|\n" +
         "                                             |_____|                  \n" +
         center(manifest.description, 70) + "\n" +
         center(`v${manifest.version}`, 70) + "\n";
}

/**
 * Text explaining how to use the CLI
 * @internal
 */
export const usageText = `
Usage: code-engine [options] [generator] [sources...]

options:
  --dev                 Run for local development instead of production

  -w, --watch           Watch source files and automatically re-run when changed

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
 * Centers a string
 */
function center(text: string, length: number): string {
  let padding = Math.max(0, length - text.length);
  let right = " ".repeat(Math.floor(padding / 2));
  let left = " ".repeat(padding - right.length);
  return `${left}${text}${right}`;
}
