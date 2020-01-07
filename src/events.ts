import CodeEngine from "@code-engine/lib";
import { BuildContext, BuildSummary, EventName, LogEventData, LogLevel } from "@code-engine/types";
import * as filesize from "filesize";
import { CodeEngineCLI } from "./cli";
import { LoadedGenerator } from "./load-generator";
import { ParsedArgs } from "./parse-args";

/**
 * Sets-up event handlers for CodeEngine events and maps them to CLI behavior.
 * @internal
 */
export function setupEvents(engine: CodeEngine, generator: LoadedGenerator, cli: CodeEngineCLI, options: ParsedArgs) {
  engine.on(EventName.Error, error(cli, engine));

  generator.onBuildStarting && engine.on(EventName.BuildStarting, generator.onBuildStarting);
  generator.onBuildFinished && engine.on(EventName.BuildFinished, generator.onBuildFinished);
  generator.onFileChanged && engine.on(EventName.FileChanged, generator.onFileChanged);
  generator.onError && engine.on(EventName.Error, generator.onError);
  generator.onLog && engine.on(EventName.Log, generator.onLog);

  if (!options.quiet) {
    engine.on(EventName.Log, printToConsole(cli, options));
    engine.on(EventName.BuildStarting, printChangedFiles(cli, options));
    engine.on(EventName.BuildFinished, printBuildSummary(cli));
  }
}

/**
 * Safely terminates the program when an error occurs in CodeEngine.
 */
function error(cli: CodeEngineCLI, engine: CodeEngine) {
  return async (err: Error) => {
    await engine.dispose();
    cli.crash(err);
  };
}

/**
 * Prints log messages to the console
 */
function printToConsole(cli: CodeEngineCLI, options: ParsedArgs) {
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
 * Prints the file changes that triggered a re-build
 */
function printChangedFiles(cli: CodeEngineCLI, options: ParsedArgs) {
  return ({ partialBuild, changedFiles }: BuildContext) => {
    if (partialBuild) {
      let message = `\n${changedFiles.length} files changed`;

      if (options.debug) {
        message += "\n  " + changedFiles.map((file) => file.path).join("\n  ");
      }

      cli.log(message);
    }
  };
}

/**
 * Prints a summary of a finished build
 */
function printBuildSummary(cli: CodeEngineCLI) {
  return ({ input, output, time }: BuildSummary) => {
    let message =
    `input:  ${input.fileCount} files (${filesize(input.fileSize)})\n` +
    `output: ${output.fileCount} files (${filesize(output.fileSize)})\n` +
    `time:   ${(time.elapsed / 1000).toPrecision(3)} seconds`;

    cli.log(message);
  };
}
