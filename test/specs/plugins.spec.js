"use strict";

const { CodeEngineCLI } = require("../../lib");
const MockProcess = require("../utils/process");
const createDir = require("../utils/create-dir");
const { expect } = require("chai");
const { join } = require("path");

describe("Plugins", () => {

  it("should run a main-thread plugin", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          const myPlugin = require("./my-plugin");

          module.exports = {
            source: "**/*.txt",
            plugins: [
              myPlugin,
            ]
          }
        `
      },
      {
        path: "my-plugin.js",
        contents: `
          module.exports = function(file) {
            file.text += "\\nMy Plugin was here";
            return file;
          }
        `
      },
      { path: "file.txt", contents: "Hello, world!" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents(["file.txt"]);
    expect(join(dir, "dist/file.txt")).to.be.a.file().with.contents(
      "Hello, world!\n" +
      "My Plugin was here"
    );
  });

  it("should run a worker-thread plugin", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          const myPlugin = require("./my-plugin");

          module.exports = {
            source: "**/*.txt",
            plugins: [
              myPlugin,
            ]
          }
        `
      },
      {
        path: "my-plugin/index.js",
        contents: `
          const path = require("path");

          module.exports = {
            name: "My Plugin",
            processFile: path.join(__dirname, "process-file")
          };
        `
      },
      {
        path: "my-plugin/process-file.js",
        contents: `
          module.exports = function processFile(file) {
            file.text += "\\nMy Plugin was here";
            return file;
          };
        `
      },
      { path: "file.txt", contents: "Hello, world!" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents(["file.txt"]);
    expect(join(dir, "dist/file.txt")).to.be.a.file().with.contents(
      "Hello, world!\n" +
      "My Plugin was here"
    );
  });

  it("should run a plugin that's referenced by its file name", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "**/*.txt",
            plugins: [
              "./my-plugin"
            ]
          }
        `
      },
      {
        path: "my-plugin.js",
        contents: `
          module.exports = function(file) {
            file.text += "\\nMy Plugin was here";
            return file;
          }
        `
      },
      { path: "file.txt", contents: "Hello, world!" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents(["file.txt"]);
    expect(join(dir, "dist/file.txt")).to.be.a.file().with.contents(
      "Hello, world!\n" +
      "My Plugin was here"
    );
  });

  it("should run a plugin that's referenced by its folder", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "**/*.txt",
            plugins: [
              "./my/plugin"
            ]
          }
        `
      },
      {
        path: "my/plugin/index.js",
        contents: `
          module.exports = function(file) {
            file.text += "\\nMy Plugin was here";
            return file;
          }
        `
      },
      { path: "file.txt", contents: "Hello, world!" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents(["file.txt"]);
    expect(join(dir, "dist/file.txt")).to.be.a.file().with.contents(
      "Hello, world!\n" +
      "My Plugin was here"
    );
  });

  it("should throw an error if a main-thread plugin has syntax errors", async () => {
    let dir = await createDir([
      {
        path: "index.ts",
        contents: `
          import { myPlugin } from "./my-plugin";

          export default {
            source: "**/*.txt",
            plugins: [
              myPlugin,
            ]
          }
        `
      },
      {
        path: "my-plugin.ts",
        contents: `
          export default function(file: File): File<T = File> {
            return file;
          }
        `
      },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr(/Error in CodeEngine generator: /);
    process.assert.stderr(/Unable to compile TypeScript:/);
    process.assert.stderr(/TS1005: .*'>' expected\./);
    process.assert.stderr(/TS1005: .*',' expected\./);
    process.assert.exitCode(1);
  });

  it("should throw an error if a worker-thread plugin has syntax errors", async () => {
    let dir = await createDir([
      {
        path: "index.ts",
        contents: `
          export default {
            source: "**/*.txt",
            plugins: [
              "./my-plugin",
            ]
          }
        `
      },
      {
        path: "my-plugin.ts",
        contents: `
          export default function(file: File): File<T = File> {
            return file;
          }
        `
      },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr(/Error in Plugin 2. /);
    process.assert.stderr(/Error importing module: \.\/my-plugin /);
    process.assert.stderr(/Unable to compile TypeScript:/);
    process.assert.stderr(/TS1005: .*'>' expected\./);
    process.assert.stderr(/TS1005: .*',' expected\./);
    process.assert.exitCode(1);
  });

  it("should throw an error if a worker-thread plugin does not exist", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "**/*.txt",
            plugins: [
              "./my-plugin"
            ]
          }
        `
      },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr(
      "Error in Plugin 2. \n" +
      "Error importing module: ./my-plugin \n" +
      "Cannot find module: ./my-plugin\n"
    );
    process.assert.exitCode(1);
  });


});
