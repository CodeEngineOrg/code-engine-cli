import { main } from "./cli";

export { main };

// Export `main` as the default export
// tslint:disable: no-default-export
export default main;

// CommonJS default export hack
if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = Object.assign(module.exports.default, module.exports);  // tslint:disable-line: no-unsafe-any
}
