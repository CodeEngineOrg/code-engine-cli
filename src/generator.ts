import { BuildFinishedEventListener, BuildStartingEventListener, ErrorEventListener, FileChangedEventListener, LogEventListener, PluginDefinition } from "@code-engine/types";

/**
 * A CodeEngine generator
 */
export interface Generator {
  /**
   * The root directory used to resolve all relative paths.
   *
   * Defaults to `process.cwd()`.
   */
  cwd?: string;

  /**
   * The number of worker threads that CodeEngine should use to process files.
   *
   * Defaults to the number of CPU cores available.
   */
  concurrency?: number;

  /**
   * The source files to be built. Can be any of the following:
   *
   *   - A file or directory path
   *   - A glob pattern
   *   - A CodeEngine source plugin
   *   - An array of any combination of these
   *
   * Defaults to all files in the "./src/" directory.
   */
  source?: PluginDefinition | PluginDefinition[];

  /**
   * The destination(s) that that files should be generated to. Can be any of the following:
   *
   *   - A directory path
   *   - A CodeEngine destination plugin
   *   - An array of any combination of these
   *
   * Defaults to "./dist/"
   */
  destination?: PluginDefinition | PluginDefinition[];

  /**
   * CodeEngine plugins to use.
   */
  plugins?: PluginDefinition[];

  /**
   * Configuration options for source file watchers.
   */
  watch?: WatchConfig;

  /**
   * This event is fired whenever a build starts. It receives a `BuildContext` object,
   * which has information about the build.
   */
  onBuildStarting?: BuildStartingEventListener;

  /**
   * This event is fired when a build completes. It receives a `BuildSummary` object
   * with the results of the build.
   */
  onBuildFinished?: BuildFinishedEventListener;

  /**
   * This event is fired when a file change is detected. It receives a `ChangedFile` object.
   */
  onFileChanged?: FileChangedEventListener;

  /**
   * This event is fired whenever an unhandled error occurs.
   */
  onError?: ErrorEventListener;

  /**
   * This event is fired whenever CodeEngine or a plugin calls any `Logger` method.
   * It receives the message that was logged, the severity level, the error (if any),
   * and any other data that was provided.
   */
  onLog?: LogEventListener;
}

/**
 * Configuration options for source file watchers.
 */
export interface WatchConfig {
  /**
   * The time (in milliseconds) to wait after a file change is detected before starting a build.
   * This allows multiple files that are changed together to all be re-built together.
   *
   * Defaults to 300ms.
   */
  delay?: number;
}
