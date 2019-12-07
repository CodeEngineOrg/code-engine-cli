import * as commandLineArgs from "command-line-args";

/**
 * The parsed command-line arguments
 * @internal
 */
export interface ParsedArgs {
  dev: boolean;
  watch: boolean;
  debug: boolean;
  quiet: boolean;
  version: boolean;
  help: boolean;
  generator: string | undefined;
  sources: string[];
}

/**
 * Parses the command-line arguments
 * @internal
 */
export function parseArgs(argv: string[], env: NodeJS.ProcessEnv): ParsedArgs {
  let args = commandLineArgs(
    [
      { name: "dev", type: Boolean },
      { name: "watch", alias: "w", type: Boolean },
      { name: "debug", alias: "d", type: Boolean },
      { name: "quiet", alias: "q", type: Boolean },
      { name: "version", alias: "v", type: Boolean },
      { name: "help", alias: "h", type: Boolean },
      { name: "positionals", type: String, defaultValue: [], multiple: true, defaultOption: true },
    ],
    { argv }
  );

  // Positional arguments
  let [generator, ...sources] = args.positionals as string[];

  return {
    dev: Boolean(args.dev) || env.NODE_ENV === "development",
    watch: Boolean(args.watch),
    debug: Boolean(args.debug || env.DEBUG),
    quiet: Boolean(args.quiet),
    version: Boolean(args.version),
    help: Boolean(args.help),
    generator,
    sources,
  };
}
