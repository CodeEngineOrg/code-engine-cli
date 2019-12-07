"use strict";

const CodeEngineCLI = require("../../lib");
const MockProcess = require("../utils/process");
const createDir = require("../utils/create-dir");
const { expect } = require("chai");
const { join } = require("path");

describe("code-engine --dev", () => {

  it("should not set the dev flag by default", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "**/*.txt",
            plugins: [
              "./my-plugin"
            ]
          };
        `
      },
      {
        path: "my-plugin.js",
        contents: `
          module.exports = function myPlugin(file, context) {
            file.text = context.dev ? "The dev flag is set" : "The dev flag is NOT set";
            return file;
          }
        `
      },
      { path: "file.txt" },
    ]);
    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist/file.txt")).to.be.a.file().with.contents("The dev flag is NOT set");
  });

  it("should set the dev flag if --dev is set", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "**/*.txt",
            plugins: [
              "./my-plugin"
            ]
          };
        `
      },
      {
        path: "my-plugin.js",
        contents: `
          module.exports = function myPlugin(file, context) {
            file.text = context.dev ? "The dev flag is set" : "The dev flag is NOT set";
            return file;
          }
        `
      },
      { path: "file.txt" },
    ]);
    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main(["--dev"]);

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist/file.txt")).to.be.a.file().with.contents("The dev flag is set");
  });

  it('should set the dev flag if NODE_ENV is "development"', async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "**/*.txt",
            plugins: [
              "./my-plugin"
            ]
          };
        `
      },
      {
        path: "my-plugin.js",
        contents: `
          module.exports = function myPlugin(file, context) {
            file.text = context.dev ? "The dev flag is set" : "The dev flag is NOT set";
            return file;
          }
        `
      },
      { path: "file.txt" },
    ]);
    let process = new MockProcess(dir);
    process.env.NODE_ENV = "development";
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist/file.txt")).to.be.a.file().with.contents("The dev flag is set");
  });

  it('should not set the dev flag if NODE_ENV is "production"', async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "**/*.txt",
            plugins: [
              "./my-plugin"
            ]
          };
        `
      },
      {
        path: "my-plugin.js",
        contents: `
          module.exports = function myPlugin(file, context) {
            file.text = context.dev ? "The dev flag is set" : "The dev flag is NOT set";
            return file;
          }
        `
      },
      { path: "file.txt" },
    ]);
    let process = new MockProcess(dir);
    process.env.NODE_ENV = "production";
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist/file.txt")).to.be.a.file().with.contents("The dev flag is NOT set");
  });

  describe("--dev !== --debug", () => {

    it("should not print debug logs if --dev is set", async () => {
      let dir = await createDir(["index.js"]);
      let process = new MockProcess(dir);
      let cli = new CodeEngineCLI({ process });
      await cli.main(["--dev"]);

      process.assert.stderr("");
      process.assert.exitCode(0);

      expect(process.stdout.text).not.to.contain("CodeEngine worker #");
    });

    it('should not print debug logs if NODE_ENV is set to "development"', async () => {
      let dir = await createDir(["index.js"]);
      let process = new MockProcess(dir);
      process.env.NODE_ENV = "development";
      let cli = new CodeEngineCLI({ process });
      await cli.main();

      process.assert.stderr("");
      process.assert.exitCode(0);

      expect(process.stdout.text).not.to.contain("CodeEngine worker #");
    });

    it("should not print stack traces if --dev is set", async () => {
      let dir = await createDir();
      let process = new MockProcess(dir);
      let cli = new CodeEngineCLI({ process });

      // Explicitly specifying a generator that doesn't exist
      await cli.main(["--dev", "my-generator"]);

      process.assert.stderr("Cannot find the CodeEngine generator: my-generator\n");
      process.assert.exitCode(1);
    });

    it('should not print stack traces if NODE_ENV is set to "development"', async () => {
      let dir = await createDir();
      let process = new MockProcess(dir);
      process.env.NODE_ENV = "development";
      let cli = new CodeEngineCLI({ process });

      // Explicitly specifying a generator that doesn't exist
      await cli.main(["my-generator"]);

      process.assert.stderr("Cannot find the CodeEngine generator: my-generator\n");
      process.assert.exitCode(1);
    });

  });

});
