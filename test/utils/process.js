"use strict";

const sinon = require("sinon");

/**
 * A mock object that replaces Node's built-in `process` object.
 */
module.exports = class MockProcess {
  constructor () {
    this.env = {};
    this.on = sinon.spy();
    this.exit = sinon.spy();
    this.stdout = {
      write: sinon.spy(),
    };
    this.stderr = {
      write: sinon.spy(),
    };

    this.setTitle = sinon.spy();
    this.getTitle = sinon.stub().returns("CodeEngine");

    Object.defineProperty(this, "title", {
      get: this.getTitle,
      set: this.setTitle,
    });
  }
};
