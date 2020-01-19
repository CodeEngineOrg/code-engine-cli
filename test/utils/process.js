"use strict";

const sinon = require("sinon");

let processes = [];

afterEach("Cleanup mock processes", () => {
  for (let process of processes) {
    process.exit();
  }

  processes = [];
});

/**
 * A mock object that replaces Node's built-in `process` object.
 */
module.exports = class MockProcess {
  constructor (cwd = process.cwd()) {
    processes.push(this);
    this.env = {};

    this.cwd = sinon.stub().returns(cwd);

    this.stdout = {
      text: "",
      write (text) {
        this.text += text;
      }
    };

    this.stderr = {
      text: "",
      write (text) {
        this.text += text;
      }
    };

    let exitHandlers = [];

    this.on = sinon.spy((event, handler) => {
      if (event === "exit") {
        exitHandlers.push(handler);
      }
    });

    this.exit = sinon.spy((code) => {
      for (let handler of exitHandlers) {
        handler(code);
      }
    });

    this.setTitle = sinon.spy();
    this.getTitle = sinon.stub().returns("CodeEngine");

    Object.defineProperty(this, "title", {
      get: this.getTitle,
      set: this.setTitle,
    });

    this.assert = {
      /**
       * Asserts that the process exited with the specified code.
       */
      exitCode: (code, expectedCallCount = 1) => {
        let { callCount, firstCall } = this.exit;

        if (callCount === 0) {
          throw new RangeError("process.exit() was never called");
        }
        else if (callCount !== expectedCallCount) {
          throw new RangeError(`process.exit() was called ${callCount} times`);
        }

        if (firstCall.args[0] !== code) {
          throw new Error(`The exit code should have been ${code}, but it was ${firstCall.args[0]}`);
        }
      },

      /**
       * Asserts that the process produced the specified stdout output.
       */
      stdout: (stdout) => {
        assertOutput(this.stdout.text, stdout);
      },

      /**
       * Asserts that the process produced the specified stderr output.
       */
      stderr: (stderr) => {
        assertOutput(this.stderr.text, stderr);
      },
    };
  }
};

function assertOutput (actual, expected) {
  if (actual === expected || (expected instanceof RegExp && expected.test(actual))) {
    return;
  }

  throw new Error(`Unexpected output\n\nEXPECTED OUTPUT:\n${expected}\n\nACTUAL OUTPUT:\n${actual}`);
}
