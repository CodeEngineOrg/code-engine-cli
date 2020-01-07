"use strict";

const { CodeEngineCLI } = require("../../");
const MockProcess = require("../utils/process");
const { delay, createDir } = require("../utils");
const { expect } = require("chai");
const { join } = require("path");
const { promises: fs } = require("fs");

// CI environments are slow, so use a larger time buffer
const BUILD_TIME = process.env.CI ? 800 : 500;
const WATCH_DELAY = process.env.CI ? 300 : 100;

describe("code-engine --watch", () => {
  let process;

  beforeEach(function () {
    this.currentTest.timeout(60000);
  });

  afterEach(() => {
    process.exit();
  });

  it("should re-build when source files change", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            watch: {
              delay: ${WATCH_DELAY}
            }
          }
        `
      },
      { path: "src/file1.txt", contents: "This is file 1" },
      { path: "src/subdir/file2.txt", contents: "This is file 2" },
      { path: "src/sub/dir/file3.txt", contents: "This is file 3" },
    ]);

    process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    cli.main(["--watch"]);

    // Allow time for the initial build
    await delay(BUILD_TIME);

    process.assert.stderr("");
    process.assert.stdout(/\noutput: 3 files \(42 B\)\n/);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents([
      "file1.txt",
      "subdir",
      "subdir/file2.txt",
      "sub",
      "sub/dir",
      "sub/dir/file3.txt",
    ]);

    expect(join(dir, "dist/file1.txt")).to.be.a.file().with.contents("This is file 1");
    expect(join(dir, "dist/subdir/file2.txt")).to.be.a.file().with.contents("This is file 2");
    expect(join(dir, "dist/sub/dir/file3.txt")).to.be.a.file().with.contents("This is file 3");

    // Now modify two of the files
    await fs.writeFile(join(dir, "src/file1.txt"), "File 1 has been modified");
    await fs.writeFile(join(dir, "src/subdir/file2.txt"), "File 2 has been modified");

    // Allow time for the re-build
    await delay(WATCH_DELAY + BUILD_TIME);

    process.assert.stderr("");
    process.assert.stdout(/\n2 files changed\n/);
    process.assert.stdout(/\noutput: 2 files \(48 B\)\n/);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents([
      "file1.txt",
      "subdir",
      "subdir/file2.txt",
      "sub",
      "sub/dir",
      "sub/dir/file3.txt",
    ]);

    expect(join(dir, "dist/file1.txt")).to.be.a.file().with.contents("File 1 has been modified");
    expect(join(dir, "dist/subdir/file2.txt")).to.be.a.file().with.contents("File 2 has been modified");
    expect(join(dir, "dist/sub/dir/file3.txt")).to.be.a.file().with.contents("This is file 3");
  });

  it("should re-build when new files are created", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            watch: {
              delay: ${WATCH_DELAY}
            }
          }
        `
      },
      { path: "src/file1.txt", contents: "This is file 1" },
      { path: "src/subdir/file2.txt", contents: "This is file 2" },
      { path: "src/sub/dir/file3.txt", contents: "This is file 3" },
    ]);

    process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    cli.main(["--watch"]);

    // Allow time for the initial build
    await delay(BUILD_TIME);

    process.assert.stderr("");
    process.assert.stdout(/\noutput: 3 files \(42 B\)\n/);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents([
      "file1.txt",
      "subdir",
      "subdir/file2.txt",
      "sub",
      "sub/dir",
      "sub/dir/file3.txt",
    ]);

    expect(join(dir, "dist/file1.txt")).to.be.a.file().with.contents("This is file 1");
    expect(join(dir, "dist/subdir/file2.txt")).to.be.a.file().with.contents("This is file 2");
    expect(join(dir, "dist/sub/dir/file3.txt")).to.be.a.file().with.contents("This is file 3");

    // Now create some new files
    await fs.writeFile(join(dir, "src/file4.txt"), "This is file 4");
    await fs.mkdir(join(dir, "src/brand/new/subdir"), { recursive: true });
    await fs.writeFile(join(dir, "src/brand/new/subdir/file5.txt"), "This is file 5");

    // Allow time for the re-build
    await delay(WATCH_DELAY + BUILD_TIME);

    process.assert.stderr("");
    process.assert.stdout(/\n2 files changed\n/);
    process.assert.stdout(/\noutput: 2 files \(28 B\)\n/);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents([
      "file1.txt",
      "file4.txt",
      "subdir",
      "subdir/file2.txt",
      "sub",
      "sub/dir",
      "sub/dir/file3.txt",
      "brand",
      "brand/new",
      "brand/new/subdir",
      "brand/new/subdir/file5.txt",
    ]);

    expect(join(dir, "dist/file1.txt")).to.be.a.file().with.contents("This is file 1");
    expect(join(dir, "dist/subdir/file2.txt")).to.be.a.file().with.contents("This is file 2");
    expect(join(dir, "dist/sub/dir/file3.txt")).to.be.a.file().with.contents("This is file 3");
    expect(join(dir, "dist/file4.txt")).to.be.a.file().with.contents("This is file 4");
    expect(join(dir, "dist/brand/new/subdir/file5.txt")).to.be.a.file().with.contents("This is file 5");
  });

  it("should re-build when source files are deleted", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          const fs = require("fs");
          const path = require("path");

          module.exports = {
            watch: {
              delay: ${WATCH_DELAY}
            },
            plugins: [
              {
                processFiles(files, { cwd, changedFiles }) {
                  for (let file of changedFiles) {
                    if (file.change === "deleted") {
                      let outputFile = path.join(cwd, "dist", file.path);
                      fs.unlinkSync(outputFile);
                    }
                  }

                  return files;
                }
              }
            ],
          }
        `
      },
      { path: "src/file1.txt", contents: "This is file 1" },
      { path: "src/subdir/file2.txt", contents: "This is file 2" },
      { path: "src/sub/dir/file3.txt", contents: "This is file 3" },
    ]);

    process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    cli.main(["--watch"]);

    // Allow time for the initial build
    await delay(BUILD_TIME);

    process.assert.stderr("");
    process.assert.stdout(/\noutput: 3 files \(42 B\)\n/);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents([
      "file1.txt",
      "subdir",
      "subdir/file2.txt",
      "sub",
      "sub/dir",
      "sub/dir/file3.txt",
    ]);

    expect(join(dir, "dist/file1.txt")).to.be.a.file().with.contents("This is file 1");
    expect(join(dir, "dist/subdir/file2.txt")).to.be.a.file().with.contents("This is file 2");
    expect(join(dir, "dist/sub/dir/file3.txt")).to.be.a.file().with.contents("This is file 3");

    // Now delete some files
    await fs.unlink(join(dir, "src/file1.txt"));
    await fs.unlink(join(dir, "src/sub/dir/file3.txt"));

    // Allow time for the re-build
    await delay(WATCH_DELAY + BUILD_TIME);

    process.assert.stderr("");
    process.assert.stdout(/\n2 files changed\n/);
    process.assert.stdout(/\ninput:  0 files \(0 B\)\n/);
    process.assert.stdout(/\noutput: 0 files \(0 B\)\n/);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents([
      "subdir",
      "subdir/file2.txt",
      "sub",
      "sub/dir",
    ]);

    expect(join(dir, "dist/subdir/file2.txt")).to.be.a.file().with.contents("This is file 2");
    expect(join(dir, "dist/sub/dir")).to.be.a.directory();
  });

  it("should re-build multiple times", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            watch: {
              delay: ${WATCH_DELAY}
            }
          }
        `
      },
      { path: "src/file1.txt", contents: "This is file 1" },
      { path: "src/subdir/file2.txt", contents: "This is file 2" },
      { path: "src/sub/dir/file3.txt", contents: "This is file 3" },
    ]);

    process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    cli.main(["--watch"]);

    // Allow time for the initial build
    await delay(BUILD_TIME);

    process.assert.stderr("");
    process.assert.stdout(/\noutput: 3 files \(42 B\)\n/);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents([
      "file1.txt",
      "subdir",
      "subdir/file2.txt",
      "sub",
      "sub/dir",
      "sub/dir/file3.txt",
    ]);

    expect(join(dir, "dist/file1.txt")).to.be.a.file().with.contents("This is file 1");
    expect(join(dir, "dist/subdir/file2.txt")).to.be.a.file().with.contents("This is file 2");
    expect(join(dir, "dist/sub/dir/file3.txt")).to.be.a.file().with.contents("This is file 3");

    // Now modify two of the files
    await fs.writeFile(join(dir, "src/file1.txt"), "File 1 has been modified");
    await fs.writeFile(join(dir, "src/subdir/file2.txt"), "File 2 has been modified");

    // Allow time for the re-build
    await delay(WATCH_DELAY + BUILD_TIME);

    process.assert.stderr("");
    process.assert.stdout(/\n2 files changed\n/);
    process.assert.stdout(/\noutput: 2 files \(48 B\)\n/);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents([
      "file1.txt",
      "subdir",
      "subdir/file2.txt",
      "sub",
      "sub/dir",
      "sub/dir/file3.txt",
    ]);

    expect(join(dir, "dist/file1.txt")).to.be.a.file().with.contents("File 1 has been modified");
    expect(join(dir, "dist/subdir/file2.txt")).to.be.a.file().with.contents("File 2 has been modified");
    expect(join(dir, "dist/sub/dir/file3.txt")).to.be.a.file().with.contents("This is file 3");

    // Now delete a file
    await fs.unlink(join(dir, "src/subdir/file2.txt"));

    // Allow time for the re-build
    await delay(WATCH_DELAY + BUILD_TIME);

    process.assert.stderr("");
    process.assert.stdout(/\n1 files changed\n/);
    process.assert.stdout(/\ninput:  0 files \(0 B\)\n/);
    process.assert.stdout(/\noutput: 0 files \(0 B\)\n/);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents([
      "file1.txt",
      "subdir",
      "subdir/file2.txt",
      "sub",
      "sub/dir",
      "sub/dir/file3.txt",
    ]);

    expect(join(dir, "dist/file1.txt")).to.be.a.file().with.contents("File 1 has been modified");
    expect(join(dir, "dist/subdir/file2.txt")).to.be.a.file().with.contents("File 2 has been modified");
    expect(join(dir, "dist/sub/dir/file3.txt")).to.be.a.file().with.contents("This is file 3");

    // Now create some new files
    await fs.writeFile(join(dir, "src/file4.txt"), "This is file 4");
    await fs.writeFile(join(dir, "src/subdir/file5.txt"), "This is file 5");
    await fs.writeFile(join(dir, "src/sub/dir/file6.txt"), "This is file 6");
    await fs.mkdir(join(dir, "src/brand/new/subdir"), { recursive: true });
    await fs.writeFile(join(dir, "src/brand/new/subdir/file7.txt"), "This is file 7");

    // Allow time for the re-build
    await delay(WATCH_DELAY + BUILD_TIME);

    process.assert.stderr("");
    process.assert.stdout(/\n4 files changed\n/);
    process.assert.stdout(/\noutput: 4 files \(56 B\)\n/);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents([
      "file1.txt",
      "file4.txt",
      "subdir",
      "subdir/file2.txt",
      "subdir/file5.txt",
      "sub",
      "sub/dir",
      "sub/dir/file3.txt",
      "sub/dir/file6.txt",
      "brand",
      "brand/new",
      "brand/new/subdir",
      "brand/new/subdir/file7.txt",
    ]);

    expect(join(dir, "dist/file1.txt")).to.be.a.file().with.contents("File 1 has been modified");
    expect(join(dir, "dist/subdir/file2.txt")).to.be.a.file().with.contents("File 2 has been modified");
    expect(join(dir, "dist/sub/dir/file3.txt")).to.be.a.file().with.contents("This is file 3");
    expect(join(dir, "dist/file4.txt")).to.be.a.file().with.contents("This is file 4");
    expect(join(dir, "dist/subdir/file5.txt")).to.be.a.file().with.contents("This is file 5");
    expect(join(dir, "dist/sub/dir/file6.txt")).to.be.a.file().with.contents("This is file 6");
    expect(join(dir, "dist/brand/new/subdir/file7.txt")).to.be.a.file().with.contents("This is file 7");
  });

  it("should print logs during each build", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            watch: {
              delay: ${WATCH_DELAY}
            },
            plugins: [
              (file, { log, fullBuild }) => {
                if (fullBuild) {
                  log("This is a full build");
                  log(new Error("This is an error in the full build"));
                }
                else {
                  log("This is a partial build");
                  log(new Error("This is an error in the partial build"));
                }
                return file;
              }
            ]
          }
        `
      },
      "src/file1.txt",
    ]);

    process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    cli.main(["--watch"]);

    // Allow time for the initial build
    await delay(BUILD_TIME);

    process.assert.stderr("This is an error in the full build\n");
    process.assert.stdout(/\nThis is a full build\n/);
    process.assert.stdout(/\noutput: 1 files \(0 B\)\n/);

    // Now modify the file to trigger a partial build
    await fs.writeFile(join(dir, "src/file1.txt"), "File 1 has been modified");

    // Allow time for the re-build
    await delay(WATCH_DELAY + BUILD_TIME);

    process.assert.stderr(/\nThis is an error in the partial build\n/);
    process.assert.stdout(/\nThis is a partial build\n/);
    process.assert.stdout(/\n1 files changed\n/);
    process.assert.stdout(/\noutput: 1 files \(24 B\)\n/);
  });

  it("should crash if an error occurs in a build", async () => {
    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            watch: {
              delay: ${WATCH_DELAY}
            },
            plugins: [
              (file, { partialBuild }) => {
                if (partialBuild) {
                  throw new RangeError("Boom!");
                }
                return file;
              }
            ]
          }
        `
      },
      "src/file1.txt",
    ]);

    process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    cli.main(["--watch"]);

    // Allow time for the initial build
    await delay(BUILD_TIME);

    process.assert.stderr("");
    process.assert.stdout(/\noutput: 1 files \(0 B\)\n/);

    // Now modify the file to trigger a partial build
    await fs.writeFile(join(dir, "src/file1.txt"), "File 1 has been modified");

    // Allow time for the re-build
    await delay(WATCH_DELAY + BUILD_TIME);

    process.assert.stderr("An error occurred in Plugin 2 while processing file1.txt. \nBoom!\n");
    process.assert.stdout(/\n1 files changed\n/);
    process.assert.exitCode(1, 2);
  });

});
