import { exec } from "@actions/exec";
import fs from "node:fs";

async function main(options, ...args) {
    const version = JSON.parse(
        await fs.promises.readFile("package.json", "utf-8")
    ).version;
    const tagArgs = ["tag", "v" + version];
    const pushArgs = ["push", "origin", "v" + version];
    if (options.force) tagArgs.push("--force"), pushArgs.push("--force");
    if (options.email) await exec("git", ["config", "user.email", options.email]);
    if (options.name || options.email) await exec("git", ["config", "user.name", options.name || options.email.split("@")[0]]);
    await exec("git", tagArgs);
    if (options.replace) await exec("git", ["push", "origin", "--delete", "v" + version]);
    await exec("git", pushArgs);
}

export default main;