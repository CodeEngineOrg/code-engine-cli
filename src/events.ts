import CodeEngine from "@code-engine/lib";
import { EventName, LogEventData, LogLevel, Run, Summary } from "@code-engine/types";
import * as filesize from "filesize";
import { CodeEngineCLI } from "./cli";
import { LoadedGenerator } from "./load-generator";
import { ParsedArgs } from "./parse-args";

/**
 * Sets-up event handlers for CodeEngine events and maps them to CLI behavior.
 * @internal
 */
export function setupEvents(engine: CodeEngine, generator: LoadedGenerator, cli: CodeEngineCLI, options: ParsedArgs) {
  engine.on(EventName.Error, error(cli, engine));   // eslint-disable-line @typescript-eslint/no-misused-promises

  if (!options.quiet) {
    engine.on(EventName.Log, printToConsole(cli, options));
    engine.on(EventName.Start, printChangedFiles(cli, options));
    engine.on(EventName.Finish, printSummary(cli));
  }
}

/**
 * Safely terminates the program when an error occurs in CodeEngine.
 */
function error(cli: CodeEngineCLI, engine: CodeEngine) {
  return async(err: Error) => {
    await engine.dispose();
    cli.crash(err);
  };
}

/**
 * Prints log messages to the console
 */
function printToConsole(cli: CodeEngineCLI, _options: ParsedArgs) {
  return ({ level, message }: LogEventData) => {
    switch (level) {
      case LogLevel.Error:
      case LogLevel.Warning:
        cli.error(message);
        break;

      case LogLevel.Info:
      case LogLevel.Debug:
      default:
        cli.log(message);
    }
  };
}

/**
 * Prints the file changes that triggered a re-run
 */
function printChangedFiles(cli: CodeEngineCLI, options: ParsedArgs) {
  return ({ partial, changedFiles }: Run) => {
    if (partial) {
      let message = `\n${changedFiles.length} files changed`;

      if (options.debug) {
        message += "\n  " + changedFiles.map((file) => file.path).join("\n  ");
      }

      cli.log(message);
    }
  };
}

/**
 * Prints a summary of a finished run
 */
function printSummary(cli: CodeEngineCLI) {
  return ({ input, output, time }: Summary) => {
    let message =
    `input:  ${input.fileCount} files (${filesize(input.fileSize)})\n` +
    `output: ${output.fileCount} files (${filesize(output.fileSize)})\n` +
    `time:   ${(time.elapsed / 1000).toPrecision(3)} seconds`;

    cli.log(message);
  };
}
