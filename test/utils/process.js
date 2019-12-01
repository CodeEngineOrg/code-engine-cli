"use strict";

const sinon = require("sinon");
const { expect } = require("chai");

/**
 * A mock object that replaces Node's built-in `process` object.
 */
module.exports = class MockProcess {
  constructor (cwd = process.cwd()) {
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
      exitCode: (code) => {
        sinon.assert.calledOnce(this.exit);
        sinon.assert.calledWith(this.exit, code);
      },

      /**
       * Asserts that the process produced the specified stdout output.
       */
      stdout: (stdout) => {
        if (stdout instanceof RegExp) {
          expect(this.stdout.text).to.match(stdout);
        }
        else {
          expect(this.stdout.text).to.equal(stdout);
        }
      },

      /**
       * Asserts that the process produced the specified stderr output.
       */
      stderr: (stderr) => {
        if (stderr instanceof RegExp) {
          expect(this.stderr.text).to.match(stderr);
        }
        else {
          expect(this.stderr.text).to.equal(stderr);
        }
      },
    };
  }
};
