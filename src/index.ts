import { CodeEngineCLI } from "./cli";

export { Config } from "./config";
export * from "./generator";
export { CodeEngineCLI };

// Export `CodeEngineCLI` as the default export
// tslint:disable: no-default-export
export default CodeEngineCLI;

// CommonJS default export hack
if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = Object.assign(module.exports.default, module.exports);  // tslint:disable-line: no-unsafe-any
}
