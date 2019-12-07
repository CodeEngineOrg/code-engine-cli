"use strict";

const CodeEngineCLI = require("../../");
const MockProcess = require("../utils/process");
const createDir = require("../utils/create-dir");
const { expect } = require("chai");
const { join } = require("path");

describe("code-engine [generator]", () => {

  it("should default to the current directory", async () => {
    let dir = await createDir([
      "index.js",
      "src/file.txt",
    ]);
    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });

    // Running CodeEngine without any arguments should default to using the current directory
    // as the generator, the source, and the destination
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents(["file.txt"]);
    expect(join(dir, "dist/file.txt")).to.be.a.file().and.empty;
  });

  it("should use the generator specified by directory path", async () => {
    let dir = await createDir([
      {
        path: "my-generator/package.json",
        contents: `{
          "name": "my-generator",
          "main": "lib/generator.js"
        }`
      },
      {
        path: "my-generator/lib/generator.js",
        contents: `
          module.exports = {
            source: "file.txt",
            destination: "../../output",
          }
        `
      },
      { path: "my-generator/lib/file.txt", contents: "Hello, world!" },

      // None of these files should get used
      { path: "my-generator/generator.js", contents: "WRONG FILE" },
      { path: "my-generator/index.js", contents: "WRONG FILE" },
      { path: "my-generator/file.txt", contents: "WRONG FILE" },
      { path: "generator.js", contents: "WRONG FILE" },
      { path: "index.js", contents: "WRONG FILE" },
      { path: "file.txt", contents: "WRONG FILE" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });

    // Explicitly specifying a generator directory path
    await cli.main(["./my-generator"]);

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "output")).to.be.a.directory().with.deep.contents(["file.txt"]);
    expect(join(dir, "output/file.txt")).to.be.a.file().with.contents("Hello, world!");
  });

  it("should use the generator specified by file path", async () => {
    let dir = await createDir([
      {
        path: "my-generator/lib/generator.js",
        contents: `
          module.exports = {
            source: "file.txt",
            destination: "../../output",
          }
        `
      },
      { path: "my-generator/lib/file.txt", contents: "Hello, world!" },

      // None of these files should get used
      { path: "my-generator/generator.js", contents: "WRONG FILE" },
      { path: "my-generator/index.js", contents: "WRONG FILE" },
      { path: "my-generator/file.txt", contents: "WRONG FILE" },
      { path: "generator.js", contents: "WRONG FILE" },
      { path: "index.js", contents: "WRONG FILE" },
      { path: "file.txt", contents: "WRONG FILE" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });

    // Explicitly specifying a generator file path
    await cli.main(["./my-generator/lib/generator.js"]);

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "output")).to.be.a.directory().with.deep.contents(["file.txt"]);
    expect(join(dir, "output/file.txt")).to.be.a.file().with.contents("Hello, world!");
  });

  it("should use the generator specified by package name", async () => {
    let dir = await createDir([
      {
        path: "node_modules/my-generator/package.json",
        contents: `{
          "name": "my-generator",
          "main": "lib/generator.js"
        }`
      },
      {
        path: "node_modules/my-generator/lib/generator.js",
        contents: `
          module.exports = {
            source: "file.txt",
            destination: "../../../output",
          }
        `
      },
      { path: "node_modules/my-generator/lib/file.txt", contents: "Hello, world!" },

      // None of these files should get used
      { path: "node_modules/my-generator/generator.js", contents: "WRONG FILE" },
      { path: "node_modules/my-generator/index.js", contents: "WRONG FILE" },
      { path: "node_modules/my-generator/file.txt", contents: "WRONG FILE" },
      { path: "package.json", contents: "WRONG FILE" },
      { path: "index.js", contents: "WRONG FILE" },
      { path: "file.txt", contents: "WRONG FILE" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });

    // Explicitly specifying a generator package name
    await cli.main(["my-generator"]);

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "output")).to.be.a.directory().with.deep.contents(["file.txt"]);
    expect(join(dir, "output/file.txt")).to.be.a.file().with.contents("Hello, world!");
  });

  it("should error if the default directory is not a generator", async () => {
    let dir = await createDir();
    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });

    // Defaulting to the current directory, which has no generator
    await cli.main();

    process.assert.stderr(`Cannot find the CodeEngine generator: ${dir}\n`);
    process.assert.exitCode(1);
  });

  it("should error if the specified generator doesn't exist", async () => {
    let dir = await createDir();
    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });

    // Explicitly specifying a generator that doesn't exist
    await cli.main(["my-generator"]);

    process.assert.stderr("Cannot find the CodeEngine generator: my-generator\n");
    process.assert.exitCode(1);
  });

  it("should error if the generator has a syntax error", async () => {
    let dir = await createDir([
      {
        path: "node_modules/my-generator/index.js",
        contents: "Hello World"
      }
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main(["my-generator"]);

    process.assert.stderr("Error in CodeEngine generator: my-generator \nUnexpected identifier\n");
    process.assert.exitCode(1);
  });

  it("should error if the specified package isn't a generator", async () => {
    let dir = await createDir([
      {
        path: "node_modules/my-generator/index.js",
        contents: "module.exports = Math.PI"
      }
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main(["my-generator"]);

    process.assert.stderr("Invalid CodeEngine generator: 3.141592653589793. Expected an object.\n");
    process.assert.exitCode(1);
  });

});
