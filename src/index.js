import * as core from "@actions/core";
import { parse } from "./utils.js";
import publish from "./publish.js";

const commands = { publish };

async function run() {
    try {
        const [[command, ...args], options] = parse(core.getInput("command").trim());
        globalThis.context = JSON.parse(core.getInput("context"));
        globalThis.repository = core.getInput("repository");
        globalThis.ref = core.getInput("ref");
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