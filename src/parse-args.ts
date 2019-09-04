// tslint:disable: no-console
import * as commandLineArgs from "command-line-args";
import { ExitCode } from "./exit-code";
import { usageText } from "./help";

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
  try {
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
  catch (error) {
    // There was an error parsing the command-line args
    return errorHandler(error as Error);
  }
}

function errorHandler(error: Error): never {
  console.error(error.message);
  console.error(usageText);
  return process.exit(ExitCode.InvalidArgument);
}
