/**
 * CodeEngine CLI configuration
 */
export interface Config {
  /**
   * The CLI manifest. This is usually the parsed contents of the package.json file.
   * If not set, then the CLI will not notify users of new versions.
   */
  manifest: Manifest;

  /**
   * Allows overriding the `process` object's properties and methods.
   */
  process?: NodeJS.Process;
}

/**
 * An npm package manifest (package.json)
 */
export interface Manifest {
  name: string;
  version: string;
  description: string;
  [key: string]: unknown;
}
