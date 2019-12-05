import { PluginDefinition } from "@code-engine/types";

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
   * Defaults to all files in the current directory.
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
