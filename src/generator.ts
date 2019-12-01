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

  /**
   * Configuration options for CodeEngine's built-in web server.
   */
  serve?: HttpServerConfig;

  /**
   * Configuration options for CodeEngine's built-in LiveReload server.
   */
  liveReload?: LiveReloadConfig;
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

/**
 * Configuration options for CodeEngine's built-in web server.
 */
export interface HttpServerConfig {
  /**
   * The port that the server is hosted on.
   *
   * Defaults to 8080.
   */
  port?: number;

  /**
   * The path at which the website is served.
   *
   * Defaults to "/"
   */
  path?: string;

  /**
   * Other options are passed directly to the `http.createServer()` and `express.static()` functions.
   */
  [key: string]: unknown;
}

/**
 * Configuration options for CodeEngine's built-in LiveReload server.
 */
export interface LiveReloadConfig {
  /**
   * The port that the server is hosted on.
   *
   * Defaults to 35729.
   */
  port?: number;

  /**
   * The path at which the LiveReload server is served.
   *
   * Defaults to "/"
   */
  path?: string;

  /**
   * Other options are passed directly to the LiveReload server.
   */
  [key: string]: unknown;
}
