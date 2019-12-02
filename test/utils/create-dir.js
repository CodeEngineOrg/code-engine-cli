"use strict";

const tmp = require("tmp");
const { dirname, join } = require("path");
const { promises: fs } = require("fs");

// Gracefully cleanup temp files
tmp.setGracefulCleanup();

module.exports = createDir;

/**
 * Creates a temp directory with the given contents.
 *
 * @param entries {object[]}
 * An array of directory contents. Each entry is an object with the following properties:
 *  - `type`: "dir" or "file". Defaults to "file".
 *  - `path`: The relative path of the entry.
 *  - `contents`: The contents of the file, as a string or buffer
 *
 * @returns {Promise<string>} - The directory path
 */
async function createDir (entries = []) {
  // Create a temp directory
  let dir = await new Promise((resolve, reject) =>
    tmp.dir({ prefix: "code-engine-", unsafeCleanup: true }, (e, p) => e ? reject(e) : resolve(p)));

  dir = await fs.realpath(dir);

  for (let entry of entries) {
    entry = typeof entry === "string" ? { path: entry } : entry;
    let { type, path, contents } = entry;
    path = join(dir, path);
    contents = contents || Buffer.alloc(0);

    if (type === "dir") {
      await fs.mkdir(path, { recursive: true });
    }
    else {
      await fs.mkdir(dirname(path), { recursive: true });
      await fs.writeFile(path, contents);
    }
  }

  return dir;
}
