"use strict";

const CodeEngineCLI = require("../../lib");
const MockProcess = require("../utils/process");
const createDir = require("../utils/create-dir");

describe("Logging", () => {

  it("should print logs to stdout", async () => {
    let dir = await createDir([
      "src/file.txt",
      {
        path: "index.js",
        contents: `
          module.exports = {
            plugins: [
              (file, { log }) => {
                log("This is a log");
              }
            ]
          };
        `
      },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);
    process.assert.stdout(/\nThis is a log\n/);
  });

  it("should print info logs to stdout", async () => {
    let dir = await createDir([
      "src/file.txt",
      {
        path: "index.js",
        contents: `
          module.exports = {
            plugins: [
              (file, { log }) => {
                log.info("This is an info log");
              }
            ]
          };
        `
      },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);
    process.assert.stdout(/\nThis is an info log\n/);
  });

  it("should print debug logs to stdout", async () => {
    let dir = await createDir([
      "src/file.txt",
      {
        path: "index.js",
        contents: `
          module.exports = {
            plugins: [
              (file, { log }) => {
                log.debug("This is a debug log");
              }
            ]
          };
        `
      },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main(["--debug"]);

    process.assert.stderr("");
    process.assert.exitCode(0);
    process.assert.stdout(/\nThis is a debug log\n/);
  });

  it("should print warning logs to stderr", async () => {
    let dir = await createDir([
      "src/file.txt",
      {
        path: "index.js",
        contents: `
          module.exports = {
            plugins: [
              (file, { log }) => {
                log.warn("This is a warning log");
              }
            ]
          };
        `
      },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr("This is a warning log\n");
    process.assert.exitCode(0);
  });

  it("should print warning errors to stderr", async () => {
    let dir = await createDir([
      "src/file.txt",
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
    await cli.main();

    process.assert.stderr("This is a warning error\n");
    process.assert.exitCode(0);
  });

  it("should print error logs to stderr", async () => {
    let dir = await createDir([
      "src/file.txt",
      {
        path: "index.js",
        contents: `
          module.exports = {
            plugins: [
              (file, { log }) => {
                log.error("This is an error log");
              }
            ]
          };
        `
      },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr("This is an error log\n");
    process.assert.exitCode(0);
  });

  it("should print errors to stderr", async () => {
    let dir = await createDir([
      "src/file.txt",
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

  it("should print shorthand errors to stderr", async () => {
    let dir = await createDir([
      "src/file.txt",
      {
        path: "index.js",
        contents: `
          module.exports = {
            plugins: [
              (file, { log }) => {
                log(new RangeError("This is an error"));
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

});
