import { importModule, ModuleExports, resolveModule } from "@code-engine/utils";
import { validate } from "@code-engine/validate";
import { ono } from "ono";
import { dirname } from "path";
import { Generator } from "./generator";
import { ParsedArgs } from "./parse-args";
import { enableTypeScript } from "./typescript";

/**
 * Loads the specified CodeEngine generator.
 */
export async function loadGenerator(cwd: string, options: ParsedArgs): Promise<Generator> {
  let generatorPath = resolveGenerator(cwd, options.generator);

  if (options.typeScript) {
    await enableTypeScript(generatorPath);
  }

  let generator = await importGenerator(options.generator, generatorPath);

  if (!generator.cwd) {
    // The "cwd" path defaults to the directory of the generator's main file.
    // This allows the generator to contain relative paths that resolve correctly.
    generator.cwd = dirname(generatorPath);
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
    generator.destination = "./dist/";
  }

  return generator;
}

/**
 * Resolves the path of the specified CodeEngine generator
 */
function resolveGenerator(cwd: string, moduleId: string): string {
  let generatorPath = resolveModule(moduleId, cwd);

  if (!generatorPath) {
    throw ono(`Cannot find the CodeEngine generator: ${moduleId}`);
  }

  return generatorPath;
}

/**
 * Imports the specified generator and returns it's exported `Generator` object.
 */
async function importGenerator(moduleId: string, path: string): Promise<Generator> {
  let exports: ModuleExports;

  try {
    exports = await importModule(path);
  }
  catch (error) {
    throw ono(error, `Error in CodeEngine generator: ${moduleId}`);
  }

  // The generator can be exported as the default export or a named export
  let generator = (exports.generator || exports.default || exports) as Generator;

  // Make sure it's an object
  validate.type.object(generator, "CodeEngine generator");

  // Shallow clone the generator so we can safely modify its properties
  return { ...generator };
}
