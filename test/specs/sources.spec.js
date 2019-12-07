"use strict";

const CodeEngineCLI = require("../../lib");
const MockProcess = require("../utils/process");
const createDir = require("../utils/create-dir");
const { expect } = require("chai");
const { join } = require("path");

describe("code-engine [sources...]", () => {

  it("should default to all files in the src directory", async () => {
    let dir = await createDir([
      { path: "index.js", contents: "" },
      { path: "src/file.txt", contents: "Hello, world!" },
      { path: "src/subdir/index.html", contents: "<h1>Hello, World!</h1>" },
      { path: "src/sub/dir/file.txt", contents: "Helloooooooo" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents([
      "file.txt",
      "sub",
      "sub/dir",
      "sub/dir/file.txt",
      "subdir",
      "subdir/index.html",
    ]);

    expect(join(dir, "dist/file.txt")).to.be.a.file().with.contents("Hello, world!");
    expect(join(dir, "dist/subdir/index.html")).to.be.a.file().with.contents("<h1>Hello, World!</h1>");
    expect(join(dir, "dist/sub/dir/file.txt")).to.be.a.file().with.contents("Helloooooooo");
  });

  it("should use the sources specified in the generator", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "**/*.txt",
          }
        `
      },

      { path: "file1.txt", contents: "Hello, world!" },
      { path: "subdir/file2.html", contents: "<h1>Hello, World!</h1>" },
      { path: "sub/dir/file3.txt", contents: "Helloooooooo" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents([
      "file1.txt",
      "sub",
      "sub/dir",
      "sub/dir/file3.txt",
    ]);

    expect(join(dir, "dist/file1.txt")).to.be.a.file().with.contents("Hello, world!");
    expect(join(dir, "dist/sub/dir/file3.txt")).to.be.a.file().with.contents("Helloooooooo");
  });

  it("should use the sources specified on the command line", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "**/*.txt",
          }
        `
      },

      { path: "file1.txt", contents: "Hello, world!" },
      { path: "subdir/file2.html", contents: "<h1>Hello, World!</h1>" },
      { path: "sub/dir/file3.txt", contents: "Helloooooooo" },
      { path: "sub/dir/file4.html", contents: "<h1>Helloooooooo</h1>" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main([".", "**/*.html"]);

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents([
      "subdir",
      "subdir/file2.html",
      "sub",
      "sub/dir",
      "sub/dir/file4.html",
    ]);

    expect(join(dir, "dist/subdir/file2.html")).to.be.a.file().with.contents("<h1>Hello, World!</h1>");
    expect(join(dir, "dist/sub/dir/file4.html")).to.be.a.file().with.contents("<h1>Helloooooooo</h1>");
  });

  it("should support multiple sources on the command line", async () => {
    let dir = await createDir([
      "index.js",
      { path: "file1.txt", contents: "Hello, world!" },
      { path: "subdir/file2.html", contents: "<h1>Hello, World!</h1>" },
      { path: "sub/dir/file3.txt", contents: "Helloooooooo" },
      { path: "sub/dir/file4.html", contents: "<h1>Helloooooooo</h1>" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main([".", "*.txt", "**/*2.*", "*/*/*.html"]);

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents([
      "file1.txt",
      "subdir",
      "subdir/file2.html",
      "sub",
      "sub/dir",
      "sub/dir/file4.html",
    ]);

    expect(join(dir, "dist/file1.txt")).to.be.a.file().with.contents("Hello, world!");
    expect(join(dir, "dist/subdir/file2.html")).to.be.a.file().with.contents("<h1>Hello, World!</h1>");
    expect(join(dir, "dist/sub/dir/file4.html")).to.be.a.file().with.contents("<h1>Helloooooooo</h1>");
  });

  it("should error if no src directory exists", async () => {
    let dir = await createDir([
      "index.js",
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr(
      'No source was specified, and no "./src" directory was found. \n' +
      `ENOENT: no such file or directory, opendir '${join(dir, "src")}'\n`
    );
    process.assert.exitCode(1);

    expect(join(dir, "dist")).not.to.be.a.path();
  });

  it("should error if no src is not a directory", async () => {
    let dir = await createDir([
      "index.js",
      { path: "src", contents: "I'm a file, not a directory" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr(
      'No source was specified, and no "./src" directory was found. \n' +
      `ENOTDIR: not a directory, opendir '${join(dir, "src")}'\n`
    );
    process.assert.exitCode(1);

    expect(join(dir, "dist")).not.to.be.a.path();
  });

  it("should error if a source specified in the generator doesn't exist", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "file.txt",
          }
        `
      },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr(
      "An error occurred in Filesystem Source while reading source files. \n" +
      `ENOENT: no such file or directory, stat '${join(dir, "file.txt")}'\n`
    );
    process.assert.exitCode(1);

    expect(join(dir, "dist")).not.to.be.a.path();
  });

  it("should error if a source specified on the command-line doesn't exist", async () => {
    let dir = await createDir(["index.js"]);
    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main([".", "file.txt"]);

    process.assert.stderr(
      "An error occurred in Filesystem Source while reading source files. \n" +
      `ENOENT: no such file or directory, stat '${join(dir, "file.txt")}'\n`
    );
    process.assert.exitCode(1);

    expect(join(dir, "dist")).not.to.be.a.path();
  });

});
