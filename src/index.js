import * as core from "@actions/core";
import { parse } from "./utils.js";
import install from "./install.js";
import publish from "./publish.js";
import version from "./version.js";

const commands = { install, publish, version };

async function run() {
    try {
        const [[command, ...args], options] = parse(core.getInput("command").trim());
        console.log(core.getInput('working-directory'));
        globalThis.context = JSON.parse(core.getInput("context"));
        globalThis.token = core.getInput("token");
        if (!commands[command]) throw new Error(`Unknown command: ${command}`);
        const result = commands[command](options, ...args);
        if (result instanceof Promise) await result;
        core.setOutput("result", result);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();