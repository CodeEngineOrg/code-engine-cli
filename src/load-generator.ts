import { importModule, ModuleExports, resolveModule, typedOno } from "@code-engine/utils";
import { validate } from "@code-engine/validate";
import { ono } from "ono";
import { dirname, resolve } from "path";
import { Generator } from "./generator";
import { ParsedArgs } from "./parse-args";
import { enableTranspiledLanguageSupport } from "./transpile-support";

/**
 * A user-defined generator, with additional metadata
 * @internal
 */
export interface LoadedGenerator extends Generator {
  path: string;
}

/**
 * Loads the specified CodeEngine generator.
 * @internal
 */
export async function loadGenerator(cwd: string, options: ParsedArgs): Promise<LoadedGenerator> {
  let path = resolveGenerator(cwd, options);
  let dir = dirname(path);

  // BEFORE importing the generator, enable support for compile-to-javascript languages
  await enableTranspiledLanguageSupport(path);

  let generator = await importGenerator(path, options.generator);

  if (!generator.cwd) {
    // The "cwd" path defaults to the directory of the generator's main file.
    // This allows the generator to contain relative paths that resolve correctly.
    generator.cwd = dir;
  }
  else {
    // Resolve the "cwd", relative to the generator's main file.
    // This allows the generator to contain a relative "cwd" path.
    generator.cwd = resolve(dir, generator.cwd);
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

  return { ...generator, path };
}

/**
 * Resolves the path of the specified CodeEngine generator
 */
function resolveGenerator(cwd: string, options: ParsedArgs): string {
  // Temporarily register TypeScript file extensions.
  // This allows the resolveModule() function to find TypeScript modules
  require.extensions[".ts"] = dummyTypeScriptResolver;        // tslint:disable-line: deprecation
  require.extensions[".tsx"] = dummyTypeScriptResolver;       // tslint:disable-line: deprecation

  let generatorPath = resolveModule(options.generator || ".", cwd);

  if (!generatorPath) {
    throw ono(`Cannot find the CodeEngine generator: ${options.generator || cwd}`);
  }

  // Remove the dummy TypeScript resolvers
  delete require.extensions[".ts"];                           // tslint:disable-line: deprecation
  delete require.extensions[".tsx"];                          // tslint:disable-line: deprecation

  return generatorPath;
}

/**
 * Imports the specified generator and returns it's exported `Generator` object.
 */
async function importGenerator(path: string, moduleId = path): Promise<Generator> {
  let exports: ModuleExports;

  try {
    exports = await importModule(path);
  }
  catch (error) {
    throw typedOno(error, { moduleId }, `Error in CodeEngine generator: ${moduleId}`);
  }

  // The generator can be exported as the default export or a named export
  let generator = (exports.generator || exports.default || exports) as Generator;

  // Make sure it's an object
  validate.type.object(generator, "CodeEngine generator");

  // Shallow clone the generator so we can safely add/modify properties
  return { ...generator };
}

/**
 * A dummy TypeScript resolver that's used
 */
function dummyTypeScriptResolver(): void {}  // tslint:disable-line: no-empty
