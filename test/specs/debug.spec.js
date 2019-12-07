"use strict";

const CodeEngineCLI = require("../../lib");
const MockProcess = require("../utils/process");
const createDir = require("../utils/create-dir");
const { expect } = require("chai");

describe("code-engine --debug", () => {

  describe("Debug logging", () => {

    it("should not print debug logs by default", async () => {
      let dir = await createDir(["index.js"]);
      let process = new MockProcess(dir);
      let cli = new CodeEngineCLI({ process });
      await cli.main();

      process.assert.stderr("");
      process.assert.exitCode(0);

      expect(process.stdout.text).not.to.contain("CodeEngine worker #");
    });

    it("should print debug logs if --debug is set", async () => {
      let dir = await createDir(["index.js"]);
      let process = new MockProcess(dir);
      let cli = new CodeEngineCLI({ process });
      await cli.main(["--debug"]);

      process.assert.stderr("");
      process.assert.exitCode(0);

      expect(process.stdout.text).to.contain("CodeEngine worker #");
    });

    it("should print debug logs if the DEBUG environment variable is set", async () => {
      let dir = await createDir(["index.js"]);
      let process = new MockProcess(dir);
      process.env.DEBUG = "yes";
      let cli = new CodeEngineCLI({ process });
      await cli.main();

      process.assert.stderr("");
      process.assert.exitCode(0);

      expect(process.stdout.text).to.contain("CodeEngine worker #");
    });

  });

  describe("Error stack traces", () => {

    it("should not print stack traces by default", async () => {
      let dir = await createDir();
      let process = new MockProcess(dir);
      let cli = new CodeEngineCLI({ process });

      // Explicitly specifying a generator that doesn't exist
      await cli.main(["my-generator"]);

      process.assert.stderr("Cannot find the CodeEngine generator: my-generator\n");
      process.assert.exitCode(1);
    });

    it("should not print stack traces of plugin errors by default", async () => {
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
      let cli = new CodeEngineCLI({ process });
      await cli.main();

      process.assert.stderr("An error occurred in myPlugin while processing file.txt. \nBoom!\n");
      process.assert.exitCode(1);
    });

    it("should not print stack traces of logged errors by default", async () => {
      let dir = await createDir([
        {
          path: "index.js",
          contents: `
            module.exports = {
              plugins: [
                (file, { log }) => {
                  log.error(new RangeError("This is an error"));
                }
              ]
            };
          `
        },
      ]);

      let process = new MockProcess(dir);
      let cli = new CodeEngineCLI({ process });
      await cli.main();

      process.assert.stderr("This is an error\n");
      process.assert.exitCode(0);
    });

    it("should print stack traces if --debug is set", async () => {
      let dir = await createDir();
      let process = new MockProcess(dir);
      let cli = new CodeEngineCLI({ process });

      // Explicitly specifying a generator that doesn't exist
      await cli.main(["--debug", "my-generator"]);

      process.assert.stderr(/^Error: Cannot find the CodeEngine generator: my-generator\n    at resolveGenerator /);
      process.assert.exitCode(1);
    });

    it("should print stack traces if the DEBUG environment variable is set", async () => {
      let dir = await createDir();
      let process = new MockProcess(dir);
      process.env.DEBUG = "true";
      let cli = new CodeEngineCLI({ process });

      // Explicitly specifying a generator that doesn't exist
      await cli.main(["my-generator"]);

      process.assert.stderr(/^Error: Cannot find the CodeEngine generator: my-generator\n    at resolveGenerator /);
      process.assert.exitCode(1);
    });

    it("should print stack traces of plugin errors if --debug is set", async () => {
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
      let cli = new CodeEngineCLI({ process });
      await cli.main(["--debug"]);

      process.assert.stderr(/RangeError: An error occurred in myPlugin while processing file\.txt\. \nBoom!\n    at /);
      process.assert.exitCode(1);
    });

    it("should print warning errors with stack traces if --debug is set", async () => {
      let dir = await createDir([
        {
          path: "index.js",
          contents: `
            module.exports = {
              plugins: [
                (file, { log }) => {
                  log.warn(new RangeError("This is a warning error"));
                }
              ]
            };
          `
        },
      ]);

      let process = new MockProcess(dir);
      let cli = new CodeEngineCLI({ process });
      await cli.main(["--debug"]);

      process.assert.exitCode(0);
      expect(process.stderr.text).to.match(/^RangeError: This is a warning error\n    at /);
    });

    it("should print logged errors with stack traces if --debug is set", async () => {
      let dir = await createDir([
        {
          path: "index.js",
          contents: `
            module.exports = {
              plugins: [
                (file, { log }) => {
                  log.error(new RangeError("This is an error"));
                }
              ]
            };
          `
        },
      ]);

      let process = new MockProcess(dir);
      let cli = new CodeEngineCLI({ process });
      await cli.main(["--debug"]);

      process.assert.exitCode(0);
      expect(process.stderr.text).to.match(/^RangeError: This is an error\n    at /);
    });

  });
});
