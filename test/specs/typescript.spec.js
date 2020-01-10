"use strict";

const { CodeEngineCLI } = require("../../");
const manifest = require("../../package.json");
const MockProcess = require("../utils/process");
const createDir = require("../utils/create-dir");
const { expect } = require("chai");
const { join } = require("path");

describe("TypeScript support", () => {

  it("should support generators written in TypeScript", async () => {
    let dir = await createDir([
      {
        path: "index.ts",
        contents: `
          const source: string = "**/*.txt";
          export default { source }
        `
      },
      { path: "file.txt", contents: "Hello, world!" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents(["file.txt"]);
    expect(join(dir, "dist/file.txt")).to.be.a.file().with.contents("Hello, world!");
  });

  it("should support main-thread plugins written in TypeScript", async () => {
    let dir = await createDir([
      {
        path: "index.ts",
        contents: `
          import typescriptPlugin from "./typescript-plugin";

          export default {
            source: "**/*.txt",
            plugins: [
              typescriptPlugin,
            ]
          }
        `
      },
      {
        path: "typescript-plugin.ts",
        contents: `
          export default function(file: Record<string, any>): Record<string, any> {
            file.text += "\\nTypeScript was here";
            return file;
          }
        `
      },
      { path: "file.txt", contents: "Hello, world!" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents(["file.txt"]);
    expect(join(dir, "dist/file.txt")).to.be.a.file().with.contents(
      "Hello, world!\n" +
      "TypeScript was here"
    );
  });

  it("should support worker-thread plugins written in TypeScript", async () => {
    let dir = await createDir([
      {
        path: "index.ts",
        contents: `
          export default {
            source: "**/*.txt",
            plugins: [
              "./typescript-plugin"
            ]
          }
        `
      },
      {
        path: "typescript-plugin.ts",
        contents: `
          export default function(file: Record<string, any>): Record<string, any> {
            file.text += "\\nTypeScript was here";
            return file;
          }
        `
      },
      { path: "file.txt", contents: "Hello, world!" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents(["file.txt"]);
    expect(join(dir, "dist/file.txt")).to.be.a.file().with.contents(
      "Hello, world!\n" +
      "TypeScript was here"
    );
  });

  it("should use the tsconfig.json file, if it exists", async () => {
    let dir = await createDir([
      {
        path: "index.ts",
        contents: `
          export default {
            source: "**/*.txt",
            plugins: [
              "./typescript-plugin"
            ]
          }
        `
      },
      {
        path: "typescript-plugin.tsx",
        contents: `
          export default function(file: File): File {
            file.text = <h1 id={file.name}>{file.text}</h1>
            return file;
          }

          function jsx(tag: string, { id }: object, text: string) {
            id = id.replace(".", "_");
            return \`<\${tag} id="\${id}">\${text}</\${tag}>\`;
          }
        `
      },
      {
        path: "tsconfig.json",
        contents: `{
          "compilerOptions": {
            "jsx": "react",
            "jsxFactory": "jsx",
          }
        }`
      },
      { path: "file.txt", contents: "Hello, world!" },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr("");
    process.assert.exitCode(0);

    expect(join(dir, "dist")).to.be.a.directory().with.deep.contents(["file.txt"]);
    expect(join(dir, "dist/file.txt")).to.be.a.file().with.contents(
      '<h1 id="file_txt">Hello, world!</h1>'
    );
  });

  it("should throw an error if a generator has TypeScript syntax errors", async () => {
    let dir = await createDir([
      {
        path: "index.ts",
        contents: `
          interface Config {
            source = string;
          }

          export default { source: "**/*.txt" }
        `
      },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr(/Error in CodeEngine generator: /);
    process.assert.stderr(/Unable to compile TypeScript:/);
    process.assert.stderr(/TS1131: .*Property or signature expected\./);
    process.assert.stderr(/TS1128: .*Declaration or statement expected\./);
    process.assert.exitCode(1);
  });

  it("should throw an error if a main-thread plugin has TypeScript syntax errors", async () => {
    let dir = await createDir([
      {
        path: "index.ts",
        contents: `
          import typescriptPlugin from "./typescript-plugin";

          export default {
            source: "**/*.txt",
            plugins: [
              typescriptPlugin,
            ]
          }
        `
      },
      {
        path: "typescript-plugin.ts",
        contents: `
          export default function(file: File): File<T = File> {
            return file;
          }
        `
      },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr(/Error in CodeEngine generator: /);
    process.assert.stderr(/Unable to compile TypeScript:/);
    process.assert.stderr(/TS1005: .*'>' expected\./);
    process.assert.stderr(/TS1005: .*',' expected\./);
    process.assert.exitCode(1);
  });

  it("should throw an error if a worker-thread plugin has TypeScript syntax errors", async () => {
    let dir = await createDir([
      {
        path: "index.ts",
        contents: `
          export default {
            source: "**/*.txt",
            plugins: [
              "./typescript-plugin"
            ]
          }
        `
      },
      {
        path: "typescript-plugin.ts",
        contents: `
          export default function(file: File): File<T = File> {
            return file;
          }
        `
      },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr(/Error in Plugin 2. /);
    process.assert.stderr(/Error importing module: \.\/typescript-plugin /);
    process.assert.stderr(/Unable to compile TypeScript:/);
    process.assert.stderr(/TS1005: .*'>' expected\./);
    process.assert.stderr(/TS1005: .*',' expected\./);
    process.assert.exitCode(1);
  });

  it("should throw an error if a TypeScript worker-thread plugin does not exist", async () => {
    let dir = await createDir([
      {
        path: "index.ts",
        contents: `
          export default {
            source: "**/*.txt",
            plugins: [
              "./typescript-plugin"
            ]
          }
        `
      },
    ]);

    let process = new MockProcess(dir);
    let cli = new CodeEngineCLI({ manifest, process });
    await cli.main();

    process.assert.stderr(
      "Error in Plugin 2. \n" +
      "Error importing module: ./typescript-plugin \n" +
      "Cannot find module: ./typescript-plugin\n"
    );
    process.assert.exitCode(1);
  });


});
