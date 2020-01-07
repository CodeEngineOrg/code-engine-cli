"use strict";

const createDir = require("./create-dir");

module.exports = {
  /**
   * Waits for the specified number of milliseconds
   */
  delay (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  },

  createDir,
};
