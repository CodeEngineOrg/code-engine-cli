// tslint:disable: no-default-export
import * as findUp from "find-up";
import { dirname } from "path";
import * as sourceMapSupport from "source-map-support";
import { RegisterOptions } from "ts-node";

/**
 * @internal
 */
export { enableTranspiledLanguageSupport };

/**
 * Enables support for compile-to-javascript languages (TypeScript, CoffeeScript, Babel, etc.)
 * @internal
 */
export default async function enableTranspiledLanguageSupport(generatorPath: string): Promise<void> {
  let isTypeScript = /\.tsx?/.test(generatorPath);

  if (isTypeScript) {
    // Enable runtime TypeScript support.
    // NOTE: This also enables source-map support
    await enableTypeScript(generatorPath);
  }
  else {
    // Enable sourcemaps, so errors include proper stack traces and function names
    enableSourceMaps();
  }
}

/**
 * Enables support for loading generators and plugins written in TypeScript.
 */
async function enableTypeScript(generatorPath: string): Promise<void> {
  let [tsNode, tsConfigPath] = await Promise.all([
    import("ts-node"),
    findTSConfig(generatorPath),
  ]);

  let tsConfig: RegisterOptions = {
    // Don't do full type checking. Just transpile TS to JS.
    transpileOnly: true,

    // Allow importing TypeScript packages (normally anythign in node_modules is ignored)
    skipIgnore: true,
  };

  if (tsConfigPath) {
    // Use the compiler options that are specified in the tsconfig.json file
    tsConfig.dir = dirname(tsConfigPath);
  }
  else {
    // Default compiler options
    tsConfig.compilerOptions = {
      target: "ES2019",
      module: "CommonJS",
      moduleResolution: "Node",
      resolveJsonModule: true,
      esModuleInterop: true,
      sourceMap: true,
    };
  }

  tsNode!.register(tsConfig);
}

/**
 * Finds the path of the "tsconfig.json" file, if any.
 */
async function findTSConfig(generatorPath: string): Promise<string | undefined> {
  let cwd = dirname(generatorPath);
  return findUp("tsconfig.json", { cwd });
}

/**
 * Enables support for sourcemaps, so errors include the original stack trace and function names.
 */
function enableSourceMaps() {
  sourceMapSupport.install({
    environment: "node",
    handleUncaughtExceptions: false,
  });
}
