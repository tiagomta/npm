import { exec } from "@actions/exec";
import fs from "node:fs";

const VALID_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/;

async function main(options, action) {
    const pkg = JSON.parse(
        await fs.promises.readFile("package.json", "utf-8")
    );
    if (action === "tag") {
        const version = "v" + pkg.version;
        const tagArgs = ["tag", version];
        const pushArgs = ["push", "origin", version];
        if (options.force) tagArgs.push("--force"), pushArgs.push("--force");
        if (options.email) await exec("git", ["config", "user.email", options.email]);
        if (options.name || options.email) await exec("git", ["config", "user.name", options.name || options.email.split("@")[0]]);
        await exec("git", tagArgs);
        if (options.replace) await exec("git", ["push", "origin", "--delete", version]);
        await exec("git", pushArgs);
        return version;
    }
    if (["major", "minor", "patch", "beta", "alpha", "snapshot"].includes(action.toLowerCase())) {
        if (options.dryRun) return inc(pkg.version, action.toLowerCase());
        if (options.email) await exec("git", ["config", "user.email", options.email]);
        if (options.name || options.email) await exec("git", ["config", "user.name", options.name || options.email.split("@")[0]]);
        pkg.version = inc(pkg.version, action.toLowerCase());
        await fs.promises.writeFile("package.json", JSON.stringify(pkg, null, 2), "utf-8");
        if (options.commit) await exec("git", [
          "commit",
          "-a",
          "-m",
          `[Devops] Update Package (${pkg.version})`,
        ]);
        await exec("git", ["push", "--force"]);
        return pkg.version;
    }
    if (VALID_VERSION.test(version)) {
        if (options.dryRun) return action;
        if (options.email) await exec("git", ["config", "user.email", options.email]);
        if (options.name || options.email) await exec("git", ["config", "user.name", options.name || options.email.split("@")[0]]);
        pkg.version = action;
        await fs.promises.writeFile("package.json", JSON.stringify(pkg, null, 2), "utf-8");
        if (options.commit) await exec("git", [
          "commit",
          "-a",
          "-m",
          `[Devops] Update Package (${pkg.version})`,
        ]);
        await exec("git", ["push", "--force"]);
        return pkg.version;
    }
}

export default main;

function inc(version, type) {
    let extra;
    if (version.indexOf("-") != -1)
        [version, extra] = version.split("-");
    let [major, minor, patch] = version.split(".");
    if (type == "major") version = (parseInt(major) + 1) + ".0.0";
    else if (type == "minor") version = major + "." + (parseInt(minor) + 1) + ".0";
    else if (type == "patch") version = major + "." + minor + "." + (parseInt(patch) + 1);
    else if (type == "beta" || type == "alpha" || type == "snapshot") {
        if (extra && !extra.startsWith(type)) throw new Error(`Cannot increment a non-${type} version`);
        if (!extra) version = version + "-" + type + ".1";
        else {
            let [type, n] = extra.split(".");
            n = parseInt(n) + 1;
            version = version + "-" + type + "." + n;
        }
    }
    return version;
}

function validate(version) {
    if (!VALID_VERSION.test(version)) return
    return version;
}
