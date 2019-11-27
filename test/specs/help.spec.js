"use strict";

const CodeEngineCLI = require("../../");
const manifest = require("../../package.json");
const MockProcess = require("../utils/process");
const sinon = require("sinon");

describe("code-engine --help", () => {

  it("should show usage text", async () => {
    let process = new MockProcess();
    let cli = new CodeEngineCLI({ process });
    await cli.main(["--help"]);

    sinon.assert.calledOnce(process.exit);
    sinon.assert.calledWith(process.exit, 0);

    sinon.assert.notCalled(process.stderr.write);
    sinon.assert.calledOnce(process.stdout.write);
    sinon.assert.calledWith(process.stdout.write, sinon.match(manifest.description));
    sinon.assert.calledWith(process.stdout.write, sinon.match(/\nUsage: code-engine \[options\] /));
  });

  it("should support -h shorthand", async () => {
    let process = new MockProcess();
    let cli = new CodeEngineCLI({ process });
    await cli.main(["-h"]);

    sinon.assert.calledOnce(process.exit);
    sinon.assert.calledWith(process.exit, 0);

    sinon.assert.notCalled(process.stderr.write);
    sinon.assert.calledOnce(process.stdout.write);
    sinon.assert.calledWith(process.stdout.write, sinon.match(manifest.description));
    sinon.assert.calledWith(process.stdout.write, sinon.match(/\nUsage: code-engine \[options\] /));
  });

  it("should ignore other arguments", async () => {
    let process = new MockProcess();
    let cli = new CodeEngineCLI({ process });
    await cli.main(["--quiet", "--version", "--help"]);

    sinon.assert.calledOnce(process.exit);
    sinon.assert.calledWith(process.exit, 0);

    sinon.assert.notCalled(process.stderr.write);
    sinon.assert.calledOnce(process.stdout.write);
    sinon.assert.calledWith(process.stdout.write, sinon.match(manifest.description));
    sinon.assert.calledWith(process.stdout.write, sinon.match(/\nUsage: code-engine \[options\] /));
  });

  it("should ignore other shorthand arguments", async () => {
    let process = new MockProcess();
    let cli = new CodeEngineCLI({ process });
    await cli.main(["-qvh"]);

    sinon.assert.calledOnce(process.exit);
    sinon.assert.calledWith(process.exit, 0);

    sinon.assert.notCalled(process.stderr.write);
    sinon.assert.calledOnce(process.stdout.write);
    sinon.assert.calledWith(process.stdout.write, sinon.match(manifest.description));
    sinon.assert.calledWith(process.stdout.write, sinon.match(/\nUsage: code-engine \[options\] /));
  });

});
