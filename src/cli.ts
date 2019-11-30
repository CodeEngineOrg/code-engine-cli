import { CodeEngine } from "@code-engine/lib";
import { Config } from "./config";
import { ExitCode } from "./exit-code";
import { helpText, usageText } from "./help";
import { manifest } from "./manifest";
import { parseArgs, ParsedArgs } from "./parse-args";

/**
 * The CodeEngine command-line interface.
 */
export class CodeEngineCLI {
  /** @internal */
  private _process: NodeJS.Process;

  public constructor(config: Config = {}) {
    // Use a custom Process object, if provided. Otherwise, use the real one.
    this._process = (config.process as NodeJS.Process) || process;

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
    let parsedArgs = this._parseArgs(args);

    if (parsedArgs) {
      try {
        let { help, version, quiet } = parsedArgs;

        if (help) {
          // Show the help text and exit
          this.log(helpText);
        }
        else if (version) {
          // Show the version number and exit
          this.log(manifest.version);
        }
        else {
          let engine = new CodeEngine();
          let summary = await engine.build();

          if (!quiet) {
            this.log(JSON.stringify(summary, undefined, 2));
          }

          await engine.dispose();
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
   * Waits for the program to be terminated.
   */
  public async awaitExit(): Promise<void> {
    await new Promise((resolve) => {
      this._process.on("exit", resolve);
    });
  }

  /**
   * Immediately terminates the process with the given error.
   */
  public crash(error: Error): never {
    error = error || "An unknown error occurred";
    let message = String(error.message || error);

    if (this._process.env.DEBUG || this._process.env.NODE_ENV === "development") {
      message = String(error.stack) || message;
    }

    this._process.stderr.write(`${message}\n`);
    this._process.exit(ExitCode.FatalError);
  }

  /**
   * Parses the command-line arguments, or prints usage text if the args are invalid.
   */
  private _parseArgs(args: string[]): ParsedArgs | undefined {
    try {
      return parseArgs(args);
    }
    catch (error) {
      let message = String((error as Error).message || error);
      this._process.stderr.write(`${message}\n${usageText}`);
      return this._process.exit(ExitCode.InvalidArgument) as undefined;
    }
  }
}
