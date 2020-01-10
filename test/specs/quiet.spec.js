"use strict";

const { CodeEngineCLI } = require("../../");
const manifest = require("../../package.json");
const MockProcess = require("../utils/process");
const createDir = require("../utils/create-dir");

describe("code-engine --quiet", () => {

  it("should not print debug logs if --quiet is set, even though --debug is also set", async () => {
    let dir = await createDir([
      "index.js",
      "src/file.txt",
    ]);
    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main(["--quiet", "--debug"]);

    process.assert.stderr("");
    process.assert.stdout("");
    process.assert.exitCode(0);
  });

  it("should not print debug logs if --quiet is set, even though the DEBUG environment variable is also set", async () => {
    let dir = await createDir([
      "index.js",
      "src/file.txt",
    ]);
    let process = new MockProcess(dir);
    process.env.DEBUG = "yes";
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main(["--quiet"]);

    process.assert.stderr("");
    process.assert.stdout("");
    process.assert.exitCode(0);
  });

  it("should not print any logs from plugins if --quiet is set", async () => {
    let dir = await createDir([
      "src/file.txt",
      {
        path: "index.js",
        contents: `
          module.exports = {
            plugins: [
              (file, { log }) => {
                log("This is a log");
                log(new Error("This is an error log"));
                log.info("This is an info log");
                log.debug("This is a debug log");
                log.warn("This is a warning log");
                log.error("This is an error log");
              }
            ]
          };
        `
      },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main(["--quiet"]);

    process.assert.stderr("");
    process.assert.stdout("");
    process.assert.exitCode(0);
  });

  it("should print errors, even if --quiet is set", async () => {
    let dir = await createDir();
    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });

    // Explicitly specifying a generator that doesn't exist
    await cli.main(["--quiet", "my-generator"]);

    process.assert.stderr("Cannot find the CodeEngine generator: my-generator\n");
    process.assert.exitCode(1);
  });

  it("should print plugin errors, even if --quiet is set", async () => {
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
          module.exports = function myPlugin(file) {
            throw new RangeError("Boom!");
          }
        `
      },
      { path: "file.txt", contents: "Hello, world!" },
    ]);
    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main(["--quiet"]);

    process.assert.stderr("An error occurred in myPlugin while processing file.txt. \nBoom!\n");
    process.assert.exitCode(1);
  });

  it("should print stack traces, even if --quiet is set", async () => {
    let dir = await createDir();
    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });

    // Explicitly specifying a generator that doesn't exist
    await cli.main(["--quiet", "--debug", "my-generator"]);

    process.assert.stderr(/^Error: Cannot find the CodeEngine generator: my-generator\n    at resolveGenerator /);
    process.assert.exitCode(1);
  });

});
