"use strict";

const CodeEngineCLI = require("../../");
const manifest = require("../../package.json");
const MockProcess = require("../utils/process");
const { expect } = require("chai");

describe("code-engine --help", () => {

  it("should show usage text", async () => {
    let process = new MockProcess();
    let cli = new CodeEngineCLI({ process });
    await cli.main(["--help"]);

    process.assert.exitCode(0);
    process.assert.stderr("");
    process.assert.stdout(/\nUsage: code-engine \[options\] /);
    expect(process.stdout.text).to.include(manifest.description);
  });

  it("should support -h shorthand", async () => {
    let process = new MockProcess();
    let cli = new CodeEngineCLI({ process });
    await cli.main(["-h"]);

    process.assert.exitCode(0);
    process.assert.stderr("");
    process.assert.stdout(/\nUsage: code-engine \[options\] /);
    expect(process.stdout.text).to.include(manifest.description);
  });

  it("should ignore other arguments", async () => {
    let process = new MockProcess();
    let cli = new CodeEngineCLI({ process });
    await cli.main(["--quiet", "--version", "--help"]);

    process.assert.exitCode(0);
    process.assert.stderr("");
    process.assert.stdout(/\nUsage: code-engine \[options\] /);
    expect(process.stdout.text).to.include(manifest.description);
  });

  it("should ignore other shorthand arguments", async () => {
    let process = new MockProcess();
    let cli = new CodeEngineCLI({ process });
    await cli.main(["-qvh"]);

    process.assert.exitCode(0);
    process.assert.stderr("");
    process.assert.stdout(/\nUsage: code-engine \[options\] /);
    expect(process.stdout.text).to.include(manifest.description);
  });

});
