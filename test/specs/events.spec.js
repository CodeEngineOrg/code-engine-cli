"use strict";

const { CodeEngineCLI } = require("../../lib");
const MockProcess = require("../utils/process");
const { delay, createDir } = require("../utils");
const sinon = require("sinon");
const { expect } = require("chai");
const { join } = require("path");
const { promises: fs } = require("fs");

// CI environments are slow, so use a larger time buffer
const BUILD_TIME = process.env.CI ? 800 : 500;
const WATCH_DELAY = process.env.CI ? 300 : 100;

describe("Events", () => {

  it("should call the onBuildStarting handler when a build starts", async () => {
    let spy = global.spy = sinon.spy();

    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "**/*.txt",
            onBuildStarting: global.spy
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

    sinon.assert.calledOnce(spy);
    expect(spy.firstCall.thisValue[Symbol.toStringTag]).to.equal("CodeEngine");

    let [context] = spy.firstCall.args;
    sinon.assert.calledWithExactly(spy, context);
    expect(context).to.be.an("object").with.keys(
      "cwd", "concurrency", "debug", "dev", "fullBuild", "partialBuild", "changedFiles", "log");
  });

  it("should call the onBuildFinished handler when a build starts", async () => {
    let spy = global.spy = sinon.spy();

    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "**/*.txt",
            onBuildFinished: global.spy
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

    sinon.assert.calledOnce(spy);
    expect(spy.firstCall.thisValue[Symbol.toStringTag]).to.equal("CodeEngine");

    let [summary] = spy.firstCall.args;
    sinon.assert.calledWithExactly(spy, summary);
    expect(summary).to.be.an("object").with.keys(
      "concurrency", "cwd", "debug", "dev", "fullBuild", "partialBuild", "changedFiles", "log",
      "input", "output", "time");
  });

  it("should call the onFileChanged handler when an incremental re-build starts", async () => {
    let spy = global.spy = sinon.spy();

    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            onFileChanged: global.spy,
            watch: {
              delay: ${WATCH_DELAY}
            }
          }
        `
      },
      { path: "src/file1.txt", contents: "Hello, world A!" },
      { path: "src/file2.txt", contents: "Hello, world B!" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });

    try {
      cli.main(["--watch"]);

      // Allow time for the initial build
      await delay(BUILD_TIME);

      // Now modify both files
      await fs.writeFile(join(dir, "src/file1.txt"), "File 1 has been modified");
      await fs.writeFile(join(dir, "src/file2.txt"), "File 2 has been modified");

      // Allow time for all the re-build
      await delay(WATCH_DELAY + BUILD_TIME);

      process.assert.stderr("");

      sinon.assert.calledTwice(spy);
      expect(spy.firstCall.thisValue[Symbol.toStringTag]).to.equal("CodeEngine");
      expect(spy.secondCall.thisValue[Symbol.toStringTag]).to.equal("CodeEngine");

      let [file, context] = spy.firstCall.args;
      sinon.assert.calledWithExactly(spy, file, context);
      expect(file).to.have.property("name", "file1.txt");
      expect(file).to.have.property("text", "File 1 has been modified");
      expect(context).to.be.an("object").with.keys("concurrency", "cwd", "debug", "dev", "log");

      [file, context] = spy.secondCall.args;
      sinon.assert.calledWithExactly(spy, file, context);
      expect(file).to.have.property("name", "file2.txt");
      expect(file).to.have.property("text", "File 2 has been modified");
      expect(context).to.be.an("object").with.keys("concurrency", "cwd", "debug", "dev", "log");
    }
    finally {
      process.exit();
    }
  });

  it("should call the onError handler when an error occurs", async () => {
    let spy = global.spy = sinon.spy();

    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "**/*.txt",
            onError: global.spy,
            plugins: [
              function badPlugin() {
                throw new RangeError("Boom!");
              }
            ]
          }
        `
      },
      { path: "file.txt", contents: "Hello, world!" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ process });
    await cli.main();

    process.assert.stderr("An error occurred in badPlugin while processing file.txt. \nBoom!\n");
    process.assert.exitCode(1);

    sinon.assert.calledOnce(spy);
    expect(spy.firstCall.thisValue[Symbol.toStringTag]).to.equal("CodeEngine");

    let [error, context] = spy.firstCall.args;
    sinon.assert.calledWithExactly(spy, error, context);
    expect(error).to.be.an.instanceOf(RangeError);
    expect(error.message).to.equal("An error occurred in badPlugin while processing file.txt. \nBoom!");
    expect(context).to.be.an("object").with.keys("concurrency", "cwd", "debug", "dev", "log");
  });

  it("should call the onLog handler when a message is logged", async () => {
    let spy = global.spy = sinon.spy();

    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "**/*.txt",
            onLog: global.spy,
            plugins: [
              function logger(file, { log }) {
                log("This is a log message", { foo: "bar" });
                return file;
              }
            ]
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

    sinon.assert.calledOnce(spy);
    expect(spy.firstCall.thisValue[Symbol.toStringTag]).to.equal("CodeEngine");

    let [log, context] = spy.firstCall.args;
    sinon.assert.calledWithExactly(spy, log, context);
    expect(log).to.deep.equal({
      level: "info",
      message: "This is a log message",
      foo: "bar"
    });
    expect(context).to.be.an("object").with.keys("concurrency", "cwd", "debug", "dev", "log");
  });

});
