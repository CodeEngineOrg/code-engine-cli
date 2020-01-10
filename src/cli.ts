import validate from "@code-engine/validate";
import { Config, Manifest } from "./config";
import { ExitCode } from "./exit-code";
import { getBanner, usageText } from "./help";
import { loadGenerator } from "./load-generator";
import { parseArgs, ParsedArgs } from "./parse-args";
import { runGenerator } from "./run-generator";

/**
 * The CodeEngine command-line interface.
 */
export class CodeEngineCLI {
  /** @internal */
  private _process: NodeJS.Process;

  /** @internal */
  private _manifest: Manifest;

  /** @internal */
  private _debug = false;

  public constructor(config: Config) {
    validate.type.object(config, "CLI config");

    // Validate the CLI manifest
    this._manifest = validate.type.object(config.manifest, "CLI manifest");
    validate.string.nonWhitespace(config.manifest.name, "CLI name");
    validate.string.nonWhitespace(config.manifest.version, "CLI version");
    validate.string.nonWhitespace(config.manifest.description, "CLI description");

    // Use a custom Process object, if provided. Otherwise, use the real one.
    this._process = config.process || process;

    // Set the process title
    this._process.title = "CodeEngine";

    // Setup global error handlers
    this._process.on("uncaughtException", this.crash.bind(this));
    this._process.on("unhandledRejection", this.crash.bind(this));
  }

  /**
   * The main entry point of the CLI
   *
   * @param args - The command-line arguments
   */
  public async main(args: string[] = []): Promise<void> {
    let options = this._parseArgs(args);

    if (options) {
      try {
        this._debug = options.debug;

        if (options.help) {
          // Show the help text and exit
          let bannerText = getBanner(this._manifest);
          this.log(`\n${bannerText}${usageText}`);
        }
        else if (options.version) {
          // Show the version number and exit
          this.log(this._manifest.version);
        }
        else {
          if (!options.quiet) {
            // Show the CodeEngine ASCII art banner
            let bannerText = getBanner(this._manifest);
            this.log(bannerText);
          }

          let generator = await loadGenerator(this._process.cwd(), options);
          await runGenerator(generator, this, options);
        }

        this._process.exit(ExitCode.Success);
      }
      catch (error) {
        this.crash(error as Error);
      }
    }
  }

  /**
   * Logs a message to stdout.
   */
  public log(message: string): void {
    this._process.stdout.write(`${message}\n`);
  }

  /**
   * Logs a message to stderr.
   */
  public error(message: string): void {
    this._process.stderr.write(`${message}\n`);
  }

  /**
   * Immediately terminates the process with the given error.
   */
  public crash(error: Error): never {
    error = error || "An unknown error occurred";
    let message = String(error.message || error);

    if (this._debug) {
      message = String(error.stack) || message;
    }

    this.error(message);
    this._process.exit(ExitCode.FatalError);
  }

  /**
   * Waits for the program to be terminated.
   */
  public async awaitExit(): Promise<void> {
    await new Promise((resolve) => {
      this._process.on("exit", resolve);
    });
  }

  /**
   * Parses the command-line arguments, or prints usage text if the args are invalid.
   */
  private _parseArgs(args: string[]): ParsedArgs | undefined {
    try {
      return parseArgs(args, this._process.env);
    }
    catch (error) {
      let message = String((error as Error).message || error);
      this.error(`${message}\n${usageText}`);
      return this._process.exit(ExitCode.InvalidArgument) as undefined;
    }
  }
}
