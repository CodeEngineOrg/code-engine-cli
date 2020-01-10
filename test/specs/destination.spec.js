"use strict";

const { CodeEngineCLI } = require("../../lib");
const manifest = require("../../package.json");
const MockProcess = require("../utils/process");
const createDir = require("../utils/create-dir");
const { expect } = require("chai");
const { join } = require("path");

describe("Destination", () => {

  it('should default to the "dist" directory', async () => {
    let dir = await createDir([
      { path: "index.js", contents: "" },
      { path: "src/file.txt", contents: "Hello, world!" },
      { path: "src/subdir/index.html", contents: "<h1>Hello, World!</h1>" },
      { path: "src/sub/dir/file.txt", contents: "Helloooooooo" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
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

  it("should use the destination specified in the generator", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            destination: "output",
          }
        `
      },

      { path: "src/file.txt", contents: "Hello, world!" },
      { path: "src/subdir/index.html", contents: "<h1>Hello, World!</h1>" },
      { path: "src/sub/dir/file.txt", contents: "Helloooooooo" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "output")).to.be.a.directory().with.deep.contents([
      "file.txt",
      "sub",
      "sub/dir",
      "sub/dir/file.txt",
      "subdir",
      "subdir/index.html",
    ]);

    expect(join(dir, "output/file.txt")).to.be.a.file().with.contents("Hello, world!");
    expect(join(dir, "output/subdir/index.html")).to.be.a.file().with.contents("<h1>Hello, World!</h1>");
    expect(join(dir, "output/sub/dir/file.txt")).to.be.a.file().with.contents("Helloooooooo");
  });

  it("should create parent directories if needed", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            destination: "this/is/the/output/directory",
          }
        `
      },

      { path: "src/file.txt", contents: "Hello, world!" },
      { path: "src/subdir/index.html", contents: "<h1>Hello, World!</h1>" },
      { path: "src/sub/dir/file.txt", contents: "Helloooooooo" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "this")).to.be.a.directory().with.deep.contents([
      "is",
      "is/the",
      "is/the/output",
      "is/the/output/directory",
      "is/the/output/directory/file.txt",
      "is/the/output/directory/sub",
      "is/the/output/directory/sub/dir",
      "is/the/output/directory/sub/dir/file.txt",
      "is/the/output/directory/subdir",
      "is/the/output/directory/subdir/index.html",
    ]);

    expect(join(dir, "this/is/the/output/directory/file.txt")).to.be.a.file().with.contents("Hello, world!");
    expect(join(dir, "this/is/the/output/directory/subdir/index.html")).to.be.a.file().with.contents("<h1>Hello, World!</h1>");
    expect(join(dir, "this/is/the/output/directory/sub/dir/file.txt")).to.be.a.file().with.contents("Helloooooooo");
  });

  it('should clean the "dist" directory before building', async () => {
    let dir = await createDir([
      { path: "index.js", contents: "" },
      { path: "src/file.txt", contents: "Hello, world!" },
      { path: "src/subdir/index.html", contents: "<h1>Hello, World!</h1>" },
      { path: "src/sub/dir/file.txt", contents: "Helloooooooo" },
      { path: "dist/file.txt", contents: "OLD CONTENTS" },
      { path: "dist/file2.txt", contents: "OLD CONTENTS" },
      { path: "dist/subdir/index.html", contents: "OLD CONTENTS" },
      { path: "dist/subdir/index2.html", contents: "OLD CONTENTS" },
      { path: "dist/sub/dir/file.txt", contents: "OLD CONTENTS" },
      { path: "dist/sub/dir/file2.txt", contents: "OLD CONTENTS" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
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

  it("should clean the destination directory before building", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            destination: "output",
          }
        `
      },
      { path: "src/file.txt", contents: "Hello, world!" },
      { path: "src/subdir/index.html", contents: "<h1>Hello, World!</h1>" },
      { path: "src/sub/dir/file.txt", contents: "Helloooooooo" },
      { path: "output/file.txt", contents: "OLD CONTENTS" },
      { path: "output/file2.txt", contents: "OLD CONTENTS" },
      { path: "output/subdir/index.html", contents: "OLD CONTENTS" },
      { path: "output/subdir/index2.html", contents: "OLD CONTENTS" },
      { path: "output/sub/dir/file.txt", contents: "OLD CONTENTS" },
      { path: "output/sub/dir/file2.txt", contents: "OLD CONTENTS" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "output")).to.be.a.directory().with.deep.contents([
      "file.txt",
      "sub",
      "sub/dir",
      "sub/dir/file.txt",
      "subdir",
      "subdir/index.html",
    ]);

    expect(join(dir, "output/file.txt")).to.be.a.file().with.contents("Hello, world!");
    expect(join(dir, "output/subdir/index.html")).to.be.a.file().with.contents("<h1>Hello, World!</h1>");
    expect(join(dir, "output/sub/dir/file.txt")).to.be.a.file().with.contents("Helloooooooo");
  });

  it("should error if the destination is not a directory", async () => {
    let dir = await createDir([
      "index.js",
      { path: "src/file.txt", contents: "Hello, world!" },
      { path: "dist", contents: "I'm a file, not a directory" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr(
      "An error occurred in Filesystem Destination while cleaning the destination. \n" +
      `The destination path is not a directory: ${join(dir, "dist")}\n`
    );
    process.assert.exitCode(1);
  });

});
