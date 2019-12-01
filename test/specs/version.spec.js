"use strict";

const CodeEngineCLI = require("../../");
const manifest = require("../../package.json");
const MockProcess = require("../utils/process");

describe("code-engine --version", () => {

  it("should print the version number", async () => {
    let process = new MockProcess();
    let cli = new CodeEngineCLI({ process });
    await cli.main(["--version"]);

    process.assert.exitCode(0);
    process.assert.stderr("");
    process.assert.stdout(manifest.version + "\n");
  });

  it("should support -v shorthand", async () => {
    let process = new MockProcess();
    let cli = new CodeEngineCLI({ process });
    await cli.main(["-v"]);

    process.assert.exitCode(0);
    process.assert.stderr("");
    process.assert.stdout(manifest.version + "\n");
  });

  it("should ignore other arguments", async () => {
    let process = new MockProcess();
    let cli = new CodeEngineCLI({ process });
    await cli.main(["--quiet", "--version"]);

    process.assert.exitCode(0);
    process.assert.stderr("");
    process.assert.stdout(manifest.version + "\n");
  });

  it("should ignore other shorthand arguments", async () => {
    let process = new MockProcess();
    let cli = new CodeEngineCLI({ process });
    await cli.main(["-qv"]);

    process.assert.exitCode(0);
    process.assert.stderr("");
    process.assert.stdout(manifest.version + "\n");
  });

});
