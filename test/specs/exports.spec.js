"use strict";

const commonJSExport = require("../../");
const { default: defaultExport, CodeEngineCLI: namedExport } = require("../../");
const { expect } = require("chai");

describe("@code-engine/cli package exports", () => {

  it("should export the CodeEngineCLI class as the default CommonJS export", () => {
    expect(commonJSExport).to.be.a("function");
    expect(commonJSExport.name).to.equal("CodeEngineCLI");
  });

  it("should export the CodeEngineCLI class as the default ESM export", () => {
    expect(defaultExport).to.be.a("function");
    expect(defaultExport).to.equal(commonJSExport);
  });

  it("should export the CodeEngineCLI class as a named export", () => {
    expect(namedExport).to.be.a("function");
    expect(namedExport).to.equal(commonJSExport);
  });

  it("should not export anything else", () => {
    expect(commonJSExport).to.have.same.keys(
      "default",
      "CodeEngineCLI",
    );
  });

});
