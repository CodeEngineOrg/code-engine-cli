"use strict";

const { CodeEngineCLI } = require("../../");
const MockProcess = require("../utils/process");
const createDir = require("../utils/create-dir");
const { expect } = require("chai");
const sinon = require("sinon");

const nodeProcess = process;

describe("CodeEngineCLI", () => {

  describe("constructor", () => {
    beforeEach(() => {
      global.process = new MockProcess();
    });

    afterEach(() => {
      global.process = nodeProcess;
    });

    it("should work without any arguments", () => {
      let cli = new CodeEngineCLI();
      expect(cli).to.be.an.instanceOf(CodeEngineCLI);

      // Make sure it used the correct Process object
      sinon.assert.calledOnce(global.process.setTitle);
    });

    it("should work without an empty argument", () => {
      let cli = new CodeEngineCLI({});
      expect(cli).to.be.an.instanceOf(CodeEngineCLI);

      // Make sure it used the correct Process object
      sinon.assert.calledOnce(global.process.setTitle);
    });

    it("should set the title of the global Process object", () => {
      // eslint-disable-next-line no-unused-vars
      let cli = new CodeEngineCLI();

      sinon.assert.calledOnce(global.process.setTitle);
      sinon.assert.calledWith(global.process.setTitle, "CodeEngine");
    });

    it("should set the title of the given Process object", () => {
      let process = new MockProcess();

      // eslint-disable-next-line no-unused-vars
      let cli = new CodeEngineCLI({ process });

      sinon.assert.calledOnce(process.setTitle);
      sinon.assert.calledWith(process.setTitle, "CodeEngine");

      sinon.assert.notCalled(global.process.setTitle);
    });
  });

  describe("main()", () => {
    it("can be called without any arguments", async () => {
      let dir = await createDir([
        "index.js",
        "src/file.txt",
      ]);
      let process = new MockProcess(dir);
      let cli = new CodeEngineCLI({ process });

      await cli.main();

      process.assert.stderr("");
      process.assert.exitCode(0);
    });

    it("should error and print usage text if an invalid argument is used", async () => {
      let process = new MockProcess();
      let cli = new CodeEngineCLI({ process });

      await cli.main(["--fizzbuzz"]);

      process.assert.stderr(/^Unknown option: --fizzbuzz\n\nUsage: code-engine \[options\] /);
      process.assert.exitCode(9);
      process.assert.stdout("");
    });

    it("should error and print usage text if an invalid shorthand argument is used", async () => {
      let process = new MockProcess();
      let cli = new CodeEngineCLI({ process });

      await cli.main(["-qhzt"]);

      process.assert.stderr(/^Unknown option: -z\n\nUsage: code-engine \[options\] /);
      process.assert.exitCode(9);
      process.assert.stdout("");
    });
  });
});
