import CodeEngine from "@code-engine/lib";
import { BuildContext, BuildFinishedEventData, EventName, LogEventData, LogLevel } from "@code-engine/types";
import * as filesize from "filesize";
import { CodeEngineCLI } from "./cli";
import { ParsedArgs } from "./parse-args";

/**
 * Sets-up event handlers for CodeEngine events and maps them to CLI behavior.
 * @internal
 */
export function setupEvents(engine: CodeEngine, cli: CodeEngineCLI, options: ParsedArgs) {
  engine.on(EventName.Error, cli.crash.bind(cli));

  if (!options.quiet) {
    engine.on(EventName.Log, log(cli, options));
    engine.on(EventName.BuildStarting, buildStarting(cli, options));
    engine.on(EventName.BuildFinished, buildFinished(cli, options));
  }
}

/**
 * Logs messages to the console
 */
function log(cli: CodeEngineCLI, options: ParsedArgs) {
  return ({ level, message }: LogEventData) => {
    switch (level) {
      case LogLevel.Error:
      case LogLevel.Warning:
        cli.error(message);
        break;

      case LogLevel.Debug:
        if (options.debug) {
          cli.log(message);
        }
        break;

      case LogLevel.Info:
      default:
        cli.log(message);
    }
  };
}

/**
 * Logs information at the start of a new build
 */
function buildStarting(cli: CodeEngineCLI, options: ParsedArgs) {
  return ({ partialBuild, changedFiles }: BuildContext) => {
    if (partialBuild) {
      let message = `${changedFiles.length} files changed`;

      if (options.debug) {
        message += "\n  " + changedFiles.map((file) => file.path).join("\n  ");
      }

      cli.log(message);
    }
  };
}

/**
 * Logs a summary of a finished build
 */
function buildFinished(cli: CodeEngineCLI, options: ParsedArgs) {
  return ({ input, output, time }: BuildFinishedEventData) => {
    let message =
    `input:  ${input.fileCount} files (${filesize(input.fileSize)})\n` +
    `output: ${output.fileCount} files (${filesize(output.fileSize)})\n` +
    `time:   ${(time.elapsed / 1000).toPrecision(3)} seconds`;

    cli.log(message);
  };
}
