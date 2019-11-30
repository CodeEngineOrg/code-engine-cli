"use strict";

const sinon = require("sinon");

/**
 * A mock object that replaces Node's built-in `process` object.
 */
module.exports = class MockProcess {
  constructor (cwd = process.cwd()) {
    this.env = {};

    this.cwd = sinon.stub().returns(cwd);

    this.stdout = {
      write: sinon.spy(),
    };

    this.stderr = {
      write: sinon.spy(),
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
  }
};
