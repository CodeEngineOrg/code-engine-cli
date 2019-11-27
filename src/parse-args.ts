import * as commandLineArgs from "command-line-args";

/**
 * The parsed command-line arguments
 */
export interface ParsedArgs {
  help: boolean;
  version: boolean;
  quiet: boolean;
}

/**
 * Parses the command-line arguments
 */
export function parseArgs(argv: string[]): ParsedArgs {
  let args = commandLineArgs(
    [
      { name: "quiet", alias: "q", type: Boolean },
      { name: "version", alias: "v", type: Boolean },
      { name: "help", alias: "h", type: Boolean },
    ],
    { argv }
  );

  return {
    help: Boolean(args.help),
    version: Boolean(args.version),
    quiet: Boolean(args.quiet),
  };
}
