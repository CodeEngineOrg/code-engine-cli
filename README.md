CodeEngine CLI
======================================

[![Cross-Platform Compatibility](https://engine.codes/img/badges/os-badges.svg)](https://github.com/CodeEngineOrg/code-engine-cli/blob/master/.github/workflows/CI-CD.yaml)
[![Build Status](https://github.com/CodeEngineOrg/code-engine-cli/workflows/CI-CD/badge.svg)](https://github.com/CodeEngineOrg/code-engine-cli/blob/master/.github/workflows/CI-CD.yaml)

[![Coverage Status](https://coveralls.io/repos/github/CodeEngineOrg/code-engine-cli/badge.svg?branch=master)](https://coveralls.io/github/CodeEngineOrg/code-engine-cli)
[![Dependencies](https://david-dm.org/CodeEngineOrg/code-engine-cli.svg)](https://david-dm.org/CodeEngineOrg/code-engine-cli)

[![npm](https://img.shields.io/npm/v/@code-engine/cli.svg)](https://www.npmjs.com/package/@code-engine/cli)
[![License](https://img.shields.io/npm/l/@code-engine/cli.svg)](LICENSE)



This is the command-line interface for [CodeEngine](https://engine.codes/). It exports the `CodeEngineCLI` class, which runs CodeEngine as instructed by the command-line arguments and environment variables.

> **NOTE:** This is an **internal library** that is only intended to be used by CodeEngine. Using it outside of CodeEngine is discouraged. Use the [code-engine npm package](https://www.npmjs.com/package/code-engine) instead.



`CodeEngineCLI` class
-------------------------------
This is the programmatic interface to the CodeEngine CLI.

```javascript
import CodeEngineCLI from "@code-engine/cli";
import manifest from "./package.json";

// Create a new CodeEngineCLI instance
let cli = new CodeEngineCLI({ manifest });

// Run it with some command-line arguments
await cli.main(["--debug", "my-generator"]);
```


### `CodeEngineCLI` constructor
The constructor accepts a [`Config` object](src/config.ts).

```javascript
import CodeEngineCLI from "@code-engine/cli";

// Create a new CodeEngineCLI instance with a custom config
let cli = new CodeEngine({
  manifest: {
    name: "my-custom-cli",
    version: "1.23.456",
    description: "My custom CLI description",
  },
  process: {
    ...process,
    stdout: new WriteStream(),
    stderr: new WriteStream(),
  }
});
```

|Config setting  |Required |Type    |Default          |Description
|----------------|---------|--------|-----------------|---------------------------------------------------
|`manifest`      |yes      |object  |none             |Information about your CLI, such as its name, version number, and description. You can just set this to the contents of your `package.json` file.
|`process`       |no       |[`Process` object](https://nodejs.org/api/process.html#process_process) |`process` <br>(Node.js global) |A custom `Process` object to use instead of the Node.js global `process` object. This allows you to completely control all inputs and outputs.


### `CodeEngineCLI.log(message)`
Writes a message to the stdout stream.

- **message:** The string to write to stdout

```javascript
import CodeEngineCLI from "@code-engine/cli";
import manifest from "./package.json";

let cli = new CodeEngineCLI({ manifest });

cli.log("Hello, world");
```


### `CodeEngineCLI.error(message)`
Writes a message to the stderr stream.

- **message:** The string to write to stderr

```javascript
import CodeEngineCLI from "@code-engine/cli";
import manifest from "./package.json";

let cli = new CodeEngineCLI({ manifest });

cli.error("Something went wrong");
```


### `CodeEngineCLI.crash(error)`
Immediately terminates the CLI with the given error.

- **error:** An `Error` object

> **NOTE:** This method calls `process.exit()` internally. By default this will terminate the entire Node.js process. You can override this behavior by providing your own `process` object in [the constructor](#codeenginecli-constructor) and implementing the `exit()` method however you choose.

```javascript
import CodeEngineCLI from "@code-engine/cli";
import manifest from "./package.json";

let cli = new CodeEngineCLI({ manifest });

cli.crash(new SyntaxError("Something went wrong"));
```


### `CodeEngineCLI.awaitExit()`
Waits for the CLI to exit. This function returns a `Promise` that only resolves when [the "exit" event](https://nodejs.org/api/process.html#process_event_exit) is emitted.

> **NOTE:** This method calls `process.on("exit")` internally. By default this will wait for the Node.js process to exit. You can override this behavior by providing your own `process` object in [the constructor](#codeenginecli-constructor) and implementing the `on()` method however you choose.

```javascript
import CodeEngineCLI from "@code-engine/cli";
import manifest from "./package.json";

let cli = new CodeEngineCLI({ manifest });

await cli.awaitExit();
```



Contributing
--------------------------
Contributions, enhancements, and bug-fixes are welcome!  [File an issue](https://github.com/CodeEngineOrg/code-engine-cli/issues) on GitHub and [submit a pull request](https://github.com/CodeEngineOrg/code-engine-cli/pulls).

#### Building
To build the project locally on your computer:

1. __Clone this repo__<br>
`git clone https://github.com/CodeEngineOrg/code-engine-cli.git`

2. __Install dependencies__<br>
`npm install`

3. __Build the code__<br>
`npm run build`

4. __Run the tests__<br>
`npm test`



License
--------------------------
@code-engine/cli is 100% free and open-source, under the [MIT license](LICENSE). Use it however you want.



Big Thanks To
--------------------------
Thanks to these awesome companies for their support of Open Source developers ❤

[![Travis CI](https://engine.codes/img/badges/travis-ci.svg)](https://travis-ci.com)
[![SauceLabs](https://engine.codes/img/badges/sauce-labs.svg)](https://saucelabs.com)
[![Coveralls](https://engine.codes/img/badges/coveralls.svg)](https://coveralls.io)
