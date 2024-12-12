import { exec } from "@actions/exec";
import fs from "node:fs";

async function main(options, ...args) {
    console.log(fs.readdirSync("."));
    console.log(context);
    const scope = options.scope ? `@${options.scope}:registry` : "registry";
    const registry = options.registry ? options.registry : "https://registry.npmjs.org";
    await exec("npm", ["config", "set", scope, registry]);
    if (token) await exec("npm", ["config", "set", "--", `${registry.replace(/^https?:/,"")}:_authToken`, token]);
    await exec("npm", ["publish"]);
}

export default main;