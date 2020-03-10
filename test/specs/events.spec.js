"use strict";

const { CodeEngineCLI } = require("../../lib");
const manifest = require("../../package.json");
const MockProcess = require("../utils/process");
const { delay, createDir } = require("../utils");
const { host } = require("@jsdevtools/host-environment");
const sinon = require("sinon");
const { expect } = require("chai");
const { join } = require("path");
const { promises: fs } = require("fs");

// CI environments are slow, so use a larger time buffer
const RUN_TIME = host.ci ? 800 : 500;
const WATCH_DELAY = host.ci ? 300 : 100;

describe("Events", () => {

  it('should emit the "start" event when a run starts', async () => {
    let spy = global.spy = sinon.spy();

    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "**/*.txt",
            plugins: [{
              initialize () {
                this.engine.on("start", global.spy);
              }
            }]
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

    sinon.assert.calledOnce(spy);
    expect(spy.firstCall.thisValue[Symbol.toStringTag]).to.equal("CodeEngine");

    let [run] = spy.firstCall.args;
    sinon.assert.calledWithExactly(spy, run);
    expect(run).to.be.an("object").with.keys(
      "cwd", "concurrency", "debug", "dev", "full", "partial", "changedFiles", "log");
  });

  it('should emit the "finish" event when a run finishes', async () => {
    let spy = global.spy = sinon.spy();

    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "**/*.txt",
            plugins: [{
              initialize () {
                this.engine.on("finish", global.spy);
              }
            }],
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

    sinon.assert.calledOnce(spy);
    expect(spy.firstCall.thisValue[Symbol.toStringTag]).to.equal("CodeEngine");

    let [summary] = spy.firstCall.args;
    sinon.assert.calledWithExactly(spy, summary);
    expect(summary).to.be.an("object").with.keys(
      "concurrency", "cwd", "debug", "dev", "full", "partial", "changedFiles", "log",
      "input", "output", "time");
  });

  it('should emit the "change" event when file changes are detected', async () => {
    let spy = global.spy = sinon.spy();

    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            plugins: [{
              initialize () {
                this.engine.on("change", global.spy);
              }
            }],
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
    let cli = new CodeEngineCLI({ manifest, process });

    try {
      cli.main(["--watch"]);

      // Allow time for the initial run
      await delay(RUN_TIME);

      // Now modify both files
      await fs.writeFile(join(dir, "src/file1.txt"), "File 1 has been modified");
      await fs.writeFile(join(dir, "src/file2.txt"), "File 2 has been modified");

      // Allow time for the watch delay + run
      await delay(WATCH_DELAY + RUN_TIME);

      process.assert.stderr("");

      sinon.assert.calledTwice(spy);
      expect(spy.firstCall.thisValue[Symbol.toStringTag]).to.equal("CodeEngine");
      expect(spy.secondCall.thisValue[Symbol.toStringTag]).to.equal("CodeEngine");

      let [file] = spy.firstCall.args;
      sinon.assert.calledWithExactly(spy, file);
      expect(file).to.have.property("name", "file1.txt");
      expect(file).to.have.property("text", "File 1 has been modified");

      [file] = spy.secondCall.args;
      sinon.assert.calledWithExactly(spy, file);
      expect(file).to.have.property("name", "file2.txt");
      expect(file).to.have.property("text", "File 2 has been modified");
    }
    finally {
      process.exit();
    }
  });

  it('should emit the "error" event when an error occurs', async () => {
    let spy = global.spy = sinon.spy();

    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "**/*.txt",
            plugins: [
              {
                initialize () {
                  this.engine.on("error", global.spy);
                }
              },
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
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr("An error occurred in badPlugin while processing file.txt. \nBoom!\n");
    process.assert.exitCode(1);

    sinon.assert.calledOnce(spy);
    expect(spy.firstCall.thisValue[Symbol.toStringTag]).to.equal("CodeEngine");

    let [error] = spy.firstCall.args;
    sinon.assert.calledWithExactly(spy, error);
    expect(error).to.be.an.instanceOf(RangeError);
    expect(error.message).to.equal("An error occurred in badPlugin while processing file.txt. \nBoom!");
  });

  it('should emit the "log" event when a message is logged', async () => {
    let spy = global.spy = sinon.spy();

    let dir = await createDir([
      {
        path: "index.js",
        contents: `
          module.exports = {
            source: "**/*.txt",
            plugins: [
              {
                initialize () {
                  this.engine.on("log", global.spy);
                }
              },
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
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    sinon.assert.calledOnce(spy);
    expect(spy.firstCall.thisValue[Symbol.toStringTag]).to.equal("CodeEngine");

    let [log] = spy.firstCall.args;
    sinon.assert.calledWithExactly(spy, log);
    expect(log).to.deep.equal({
      level: "info",
      message: "This is a log message",
      foo: "bar"
    });
  });

});
