"use strict";

const CodeEngineCLI = require("../../");
const manifest = require("../../package.json");
const MockProcess = require("../utils/process");
const sinon = require("sinon");

describe("code-engine --version", () => {

  it("should print the version number", async () => {
    let process = new MockProcess();
    let cli = new CodeEngineCLI({ process });
    await cli.main(["--version"]);

    sinon.assert.calledOnce(process.exit);
    sinon.assert.calledWith(process.exit, 0);

    sinon.assert.notCalled(process.stderr.write);
    sinon.assert.calledOnce(process.stdout.write);
    sinon.assert.calledWith(process.stdout.write, manifest.version + "\n");
  });

  it("should support -v shorthand", async () => {
    let process = new MockProcess();
    let cli = new CodeEngineCLI({ process });
    await cli.main(["-v"]);

    sinon.assert.calledOnce(process.exit);
    sinon.assert.calledWith(process.exit, 0);

    sinon.assert.notCalled(process.stderr.write);
    sinon.assert.calledOnce(process.stdout.write);
    sinon.assert.calledWith(process.stdout.write, manifest.version + "\n");
  });

  it("should ignore other arguments", async () => {
    let process = new MockProcess();
    let cli = new CodeEngineCLI({ process });
    await cli.main(["--quiet", "--version"]);

    sinon.assert.calledOnce(process.exit);
    sinon.assert.calledWith(process.exit, 0);

    sinon.assert.notCalled(process.stderr.write);
    sinon.assert.calledOnce(process.stdout.write);
    sinon.assert.calledWith(process.stdout.write, manifest.version + "\n");
  });

  it("should ignore other shorthand arguments", async () => {
    let process = new MockProcess();
    let cli = new CodeEngineCLI({ process });
    await cli.main(["-qv"]);

    sinon.assert.calledOnce(process.exit);
    sinon.assert.calledWith(process.exit, 0);

    sinon.assert.notCalled(process.stderr.write);
    sinon.assert.calledOnce(process.stdout.write);
    sinon.assert.calledWith(process.stdout.write, manifest.version + "\n");
  });

});
