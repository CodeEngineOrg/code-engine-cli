"use strict";

const { CodeEngineCLI } = require("../../");
const manifest = require("../../package.json");
const MockProcess = require("../utils/process");
const createDir = require("../utils/create-dir");
const { expect } = require("chai");
const { join } = require("path");

describe("cwd", () => {

  it("should default to the current directory", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          exports.generator = {
            source: "file.txt"
          }
        `
      },
      { path: "file.txt", contents: "Hello, world!" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents(["file.txt"]);
    expect(join(dir, "dist/file.txt")).to.be.a.file().with.contents("Hello, world!");
  });

  it("should use the directory specified by the generator", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          exports.generator = {
            cwd: "my/files",
            source: "file.txt"
          }
        `
      },
      { path: "my/files/file.txt", contents: "Hello, world!" },
      { path: "my/file.txt", contents: "WRONG FILE" },
      { path: "file.txt", contents: "WRONG FILE" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents(["file.txt"]);
    expect(join(dir, "dist/file.txt")).to.be.a.file().with.contents("Hello, world!");
  });

  it("should use the CWD for the destination path", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          exports.generator = {
            cwd: "my/files",
            source: "file.txt",
            destination: "output/files"
          }
        `
      },
      { path: "my/files/file.txt", contents: "Hello, world!" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "my/files/output/files")).to.be.a.directory().with.deep.contents(["file.txt"]);
    expect(join(dir, "my/files/output/files/file.txt")).to.be.a.file().with.contents("Hello, world!");
  });

  it("should error if the CWD doesn't exist", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          exports.generator = {
            cwd: "this/path/does/not/exist",
            source: "*.txt",
          }
        `
      },
      { path: "file.txt", contents: "Hello, world!" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr(
      "An error occurred in Filesystem Source while it was initializing. \n" +
      `ENOENT: no such file or directory, stat '${join(dir, "this/path/does/not/exist")}'\n`
    );
    process.assert.exitCode(1);

    expect(join(dir, "dist")).not.to.be.a.path();
    expect(join(dir, "this/path/does/not/exist")).not.to.be.a.path();
    expect(join(dir, "this/path/does/not/exist/dist")).not.to.be.a.path();
  });

});
