"use strict";

const commonJSExport = require("../../");
const { default: defaultExport } = require("../../");
const { CodeEngineCLI: namedExport } = require("../../");
const { expect } = require("chai");

describe("@code-engine/cli package exports", () => {

  it("should export the module as the default CommonJS export", () => {
    expect(commonJSExport).to.be.an("object");
    expect(commonJSExport.default).to.equal(defaultExport);
    expect(commonJSExport.CodeEngineCLI).to.equal(namedExport);
  });

  it("should export the CodeEngineCLI class as the default ESM export", () => {
    expect(defaultExport).to.be.a("function");
    expect(defaultExport.name).to.equal("CodeEngineCLI");
  });

  it("should export the CodeEngineCLI class as a named export", () => {
    expect(namedExport).to.be.a("function");
    expect(namedExport.name).to.equal("CodeEngineCLI");
  });

  it("should not export anything else", () => {
    expect(commonJSExport).to.have.keys(
      "default",
      "CodeEngineCLI",
    );
  });

});
