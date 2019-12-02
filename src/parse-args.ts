import * as commandLineArgs from "command-line-args";

/**
 * The parsed command-line arguments
 * @internal
 */
export interface ParsedArgs {
  dev: boolean;
  watch: boolean;
  serve: boolean;
  debug: boolean;
  quiet: boolean;
  typeScript: boolean;
  version: boolean;
  help: boolean;
  generator: string | undefined;
  sources: string[];
}

/**
 * Parses the command-line arguments
 * @internal
 */
export function parseArgs(argv: string[]): ParsedArgs {
  let args = commandLineArgs(
    [
      { name: "dev", type: Boolean },
      { name: "watch", alias: "w", type: Boolean },
      { name: "serve", alias: "s", type: Boolean },
      { name: "debug", alias: "d", type: Boolean },
      { name: "quiet", alias: "q", type: Boolean },
      { name: "no-typescript", alias: "T", type: Boolean },
      { name: "version", alias: "v", type: Boolean },
      { name: "help", alias: "h", type: Boolean },
      { name: "positionals", type: String, defaultValue: [], multiple: true, defaultOption: true },
    ],
    { argv }
  );

  // Positional arguments
  let [generator, ...sources] = args.positionals as string[];

  return {
    dev: Boolean(args.dev),
    watch: Boolean(args.watch),
    serve: Boolean(args.serve),
    debug: Boolean(args.debug),
    quiet: Boolean(args.quiet),
    typeScript: !args["no-typescript"],
    version: Boolean(args.version),
    help: Boolean(args.help),
    generator,
    sources,
  };
}
