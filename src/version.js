import { exec } from "@actions/exec";
import { inc } from "semver";
import fs from "node:fs";

async function main(options, action, type) {
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
    if (action === "increment") {
        if (!type) throw new Error("No version type specified");
        if (options.email) await exec("git", ["config", "user.email", options.email]);
        if (options.name || options.email) await exec("git", ["config", "user.name", options.name || options.email.split("@")[0]]);
        type = type.replace("Project/", "");
        console.log("Incrementing version to", type);
        pkg.version = inc(pkg.version, type);
        await fs.promises.writeFile("package.json", JSON.stringify(pkg, null, 2), "utf-8");
        await exec("git", [
          "commit",
          "-a",
          "-m",
          `[Devops] Update Package (${pkg.version})`,
        ]);
        await exec("git", ["push", "origin", "HEAD:" + context.event.pull_request.head.ref, "--force"]);
        return pkg.version;
    }
}

export default main;