import * as core from "@actions/core";
import { parse } from "./utils.js";
import install from "./install.js";
import publish from "./publish.js";
import version from "./version.js";

const commands = { install, publish, version };

async function run() {
  try {
    const directory = core.getInput("working-directory");
    console.log(`Working directory: ${directory || process.cwd()}`);
    if (directory) process.chdir(directory);
    console.log(`Working directory: ${directory || process.cwd()}`);
    const [[command, ...args], options] = parse(
      core.getInput("command").trim()
    );
    globalThis.context = JSON.parse(core.getInput("context"));
    globalThis.token = core.getInput("token");
    if (!commands[command]) throw new Error(`Unknown command: ${command}`);
    const result = commands[command](options, ...args);
    if (result instanceof Promise) core.setOutput("result", await result);
    else core.setOutput("result", result);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
