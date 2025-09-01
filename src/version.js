import { exec } from "@actions/exec";
import fs from "node:fs";

const VALID_VERSION =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/;

async function main(options, action, value) {
  const pkg = JSON.parse(await fs.promises.readFile("package.json", "utf-8"));
  if (action === "tag") {
    const version = "v" + pkg.version;
    const tagArgs = ["tag", version];
    const pushArgs = ["push", "origin", version];
    if (options.force) tagArgs.push("--force"), pushArgs.push("--force");
    if (options.email)
      await exec("git", ["config", "user.email", options.email]);
    if (options.name || options.email)
      await exec("git", [
        "config",
        "user.name",
        options.name || options.email.split("@")[0],
      ]);
    await exec("git", tagArgs);
    if (options.replace)
      await exec("git", ["push", "origin", "--delete", version]);
    await exec("git", pushArgs);
    return version;
  }
  if (
    [
      "major",
      "minor",
      "patch",
      "premajor",
      "preminor",
      "prepatch",
      "prerelease",
    ].includes(action.toLowerCase())
  ) {
    if (options.dryRun) return update(pkg.version, action.toLowerCase(), value);
    if (options.email)
      await exec("git", ["config", "user.email", options.email]);
    if (options.name || options.email)
      await exec("git", [
        "config",
        "user.name",
        options.name || options.email.split("@")[0],
      ]);
    pkg.version = update(pkg.version, action.toLowerCase(), value);
    await fs.promises.writeFile(
      "package.json",
      JSON.stringify(pkg, null, 2),
      "utf-8"
    );
    if (!options.commit) return pkg.version;
    await exec("git", [
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
    if (options.email)
      await exec("git", ["config", "user.email", options.email]);
    if (options.name || options.email)
      await exec("git", [
        "config",
        "user.name",
        options.name || options.email.split("@")[0],
      ]);
    pkg.version = action;
    await fs.promises.writeFile(
      "package.json",
      JSON.stringify(pkg, null, 2),
      "utf-8"
    );
    if (!options.commit) return pkg.version;
    await exec("git", [
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

function update(version, type, id) {
  if (version.indexOf(/\+-/) != -1) version = version.split(/\+-/)[0];
  let [major, minor, patch] = version.split(".");
  if (type == "major" || type === "premajor")
    version = parseInt(major) + 1 + ".0.0";
  else if (type == "minor" || type === "preminor")
    version = major + "." + (parseInt(minor) + 1) + ".0";
  else if (type == "patch" || type === "prepatch" || type === "prerelease")
    version = major + "." + minor + "." + (parseInt(patch) + 1);
  if (
    type === "premajor" ||
    type === "preminor" ||
    type === "prepatch" ||
    type === "prerelease"
  )
    version = version + "-" + id;
  return version;
}
