import CodeEngine from "@code-engine/lib";
import { filesystem as filesystemDestination } from "code-engine-destination-filesystem";
import { filesystem as filesystemSource } from "code-engine-source-filesystem";
import { CodeEngineCLI } from "./cli";
import { setupEvents } from "./events";
import { Generator } from "./generator";
import { ParsedArgs } from "./parse-args";

/**
 * Runs a CodeEngine generator, either once or in watch mode.
 * @internal
 */
export async function runGenerator(generator: Generator, cli: CodeEngineCLI, options: ParsedArgs): Promise<void> {
  let engine = new CodeEngine({
    cwd: generator.cwd,
    concurrency: generator.concurrency,
    watchDelay: generator.watch && generator.watch.delay,
    debug: options.debug,
    dev: options.dev,
  });

  try {
    await addPlugins(engine, generator, options);
    setupEvents(engine, cli, options);

    // Run a full build
    await engine.build();

    if (options.watch) {
      // Watch sources for changes and re-build
      engine.watch();

      // Wait forever, or until the CLI exits
      await cli.awaitExit();
    }
  }
  finally {
    await engine.dispose();
  }
}

/**
 * Adds the CodeEngine plugins that are specified by the generator
 */
async function addPlugins(engine: CodeEngine, generator: Generator, options: ParsedArgs) {
  // Add file sources
  for (let source of arrayify(generator.source)) {
    if (typeof source === "string") {
      source = filesystemSource({ path: source });
    }

    await engine.use(source);
  }

  // Add plugins
  for (let plugin of arrayify(generator.plugins)) {
    await engine.use(plugin);
  }

  // Add output destinations
  for (let destination of arrayify(generator.destination)) {
    if (typeof destination === "string") {
      destination = filesystemDestination({ path: destination });
    }

    await engine.use(destination);
  }

  return engine;
}

/**
 * Normalizes zero or more values as an array.
 */
function arrayify<T>(value?: T | T[]): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  else if (value === undefined) {
    return [];
  }
  else {
    return [value];
  }
}
