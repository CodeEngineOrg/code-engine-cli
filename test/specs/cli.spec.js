"use strict";

const { CodeEngineCLI } = require("../../");
const manifest = require("../../package.json");
const MockProcess = require("../utils/process");
const createDir = require("../utils/create-dir");
const { assert, expect } = require("chai");
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

    it("should set the title of the global Process object", () => {
      // eslint-disable-next-line no-unused-vars
      let cli = new CodeEngineCLI({ manifest });

      sinon.assert.calledOnce(global.process.setTitle);
      sinon.assert.calledWith(global.process.setTitle, "CodeEngine");
    });

    it("should set the title of the given Process object", () => {
      let process = new MockProcess();

      // eslint-disable-next-line no-unused-vars
      let cli = new CodeEngineCLI({ manifest, process });

      sinon.assert.calledOnce(process.setTitle);
      sinon.assert.calledWith(process.setTitle, "CodeEngine");

      sinon.assert.notCalled(global.process.setTitle);
    });

    it("should not work without any arguments", () => {
      try {
        // eslint-disable-next-line no-new
        new CodeEngineCLI();
        assert.fail("An error should have been thrown");
      }
      catch (error) {
        expect(error).to.be.an.instanceOf(TypeError);
        expect(error.message).to.equal("Invalid CLI config: undefined. A value is required.");
      }
    });

    it("should not work without an empty argument", () => {
      try {
        // eslint-disable-next-line no-new
        new CodeEngineCLI({});
        assert.fail("An error should have been thrown");
      }
      catch (error) {
        expect(error).to.be.an.instanceOf(TypeError);
        expect(error.message).to.equal("Invalid CLI manifest: undefined. A value is required.");
      }
    });

    it("should not work without a manifest name", () => {
      try {
        // eslint-disable-next-line no-new
        new CodeEngineCLI({ manifest: { name: "   " }});
        assert.fail("An error should have been thrown");
      }
      catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Invalid CLI name: "   ". It cannot be all whitespace.');
      }
    });

    it("should not work without a manifest version", () => {
      try {
        // eslint-disable-next-line no-new
        new CodeEngineCLI({ manifest: { name: "my-cli", version: "   " }});
        assert.fail("An error should have been thrown");
      }
      catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Invalid CLI version: "   ". It cannot be all whitespace.');
      }
    });

    it("should not work without a manifest version", () => {
      try {
        // eslint-disable-next-line no-new
        new CodeEngineCLI({ manifest: { name: "my-cli", version: "1.2.3", description: "   " }});
        assert.fail("An error should have been thrown");
      }
      catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Invalid CLI description: "   ". It cannot be all whitespace.');
      }
    });
  });

  describe("main()", () => {
    it("can be called without any arguments", async () => {
      let dir = await createDir([
        "index.js",
        "src/file.txt",
      ]);
      let process = new MockProcess(dir);
      let cli = new CodeEngineCLI({ manifest, process });

      await cli.main();

      process.assert.stderr("");
      process.assert.exitCode(0);
    });

    it("should error and print usage text if an invalid argument is used", async () => {
      let process = new MockProcess();
      let cli = new CodeEngineCLI({ manifest, process });

      await cli.main(["--fizzbuzz"]);

      process.assert.stderr(/^Unknown option: --fizzbuzz\n\nUsage: code-engine \[options\] /);
      process.assert.exitCode(9);
      process.assert.stdout("");
    });

    it("should error and print usage text if an invalid shorthand argument is used", async () => {
      let process = new MockProcess();
      let cli = new CodeEngineCLI({ manifest, process });

      await cli.main(["-qhzt"]);

      process.assert.stderr(/^Unknown option: -z\n\nUsage: code-engine \[options\] /);
      process.assert.exitCode(9);
      process.assert.stdout("");
    });
  });
});
