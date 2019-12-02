import * as findUp from "find-up";
import { dirname } from "path";

/**
 * Enables support for loading generators and plugins written in TypeScript.
 * @internal
 */
export async function enableTypeScript(generatorPath: string) {
  let [tsNode, tsConfig] = await Promise.all([
    import("ts-node"),
    findTSConfig(generatorPath),
  ]);

  tsNode!.register({
    compilerOptions: {
      target: "esnext",
      resolveJsonModule: true,
      esModuleInterop: true,
      sourceMap: true,
    },

    // Transpile ALL TypeScript files, even ones in directories
    // that are usually ignored, like node_modules
    skipIgnore: true,

    // If we found a TSConfig file, then point to its path
    dir: tsConfig && dirname(tsConfig),

    // If there's no tsconfig.json, then disable type-checking
    transpileOnly: !tsConfig,
  });
}

/**
 * Finds the path of the "tsconfig.json" file, if any.
 */
async function findTSConfig(generatorPath: string): Promise<string | undefined> {
  let dir = dirname(generatorPath);
  return findUp("tsconfig.json", { cwd: dir });
}
