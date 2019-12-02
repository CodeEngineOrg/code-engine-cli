import { importModule, ModuleExports, resolveModule } from "@code-engine/utils";
import { validate } from "@code-engine/validate";
import { ono } from "ono";
import { dirname, resolve } from "path";
import { Generator } from "./generator";
import { ParsedArgs } from "./parse-args";
import { enableTypeScript } from "./typescript";

/**
 * Loads the specified CodeEngine generator.
 * @internal
 */
export async function loadGenerator(cwd: string, options: ParsedArgs): Promise<Generator> {
  let generatorPath = resolveGenerator(cwd, options.generator);
  let generatorDir = dirname(generatorPath);

  if (options.typeScript) {
    await enableTypeScript(generatorPath);
  }

  let generator = await importGenerator(options.generator, generatorPath);

  if (!generator.cwd) {
    // The "cwd" path defaults to the directory of the generator's main file.
    // This allows the generator to contain relative paths that resolve correctly.
    generator.cwd = generatorDir;
  }
  else {
    // Resolve the "cwd", relative to the generator's main file.
    // This allows the generator to contain a relative "cwd" path.
    generator.cwd = resolve(generatorDir, generator.cwd);
  }

  if (options.sources.length > 0) {
    // Override the generator's sources with the ones specified on the command-line
    generator.source = options.sources;
  }
  else if (!generator.source) {
    // Include all files in the CWD by default
    generator.source = "**/*";
  }

  if (!generator.destination) {
    // Output to "./dist" by default
    generator.destination = resolve(cwd, "dist");
  }

  return generator;
}

/**
 * Resolves the path of the specified CodeEngine generator
 */
function resolveGenerator(cwd: string, moduleId: string): string {
  let generatorPath = resolveModule(options.generator || ".", cwd);

  if (!generatorPath) {
    throw ono(`Cannot find the CodeEngine generator: ${options.generator || dirname(cwd)}`);
  }
  }

  return generatorPath;
}

/**
 * Imports the specified generator and returns it's exported `Generator` object.
 */
async function importGenerator(moduleId: string | undefined, path: string): Promise<Generator> {
  let exports: ModuleExports;

  try {
    exports = await importModule(path);
  }
  catch (error) {
    throw ono(error, `Error in CodeEngine generator: ${moduleId || path}`);
  }

  // The generator can be exported as the default export or a named export
  let generator = (exports.generator || exports.default || exports) as Generator;

  // Make sure it's an object
  validate.type.object(generator, "CodeEngine generator");

  // Shallow clone the generator so we can safely modify its properties
  return { ...generator };
}
