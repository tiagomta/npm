import { exec } from "@actions/exec";
import fs from "node:fs";

const PUBLIC_REGISTRY = "https://registry.npmjs.org/";

async function main(options, ...args) {
  const stage = options.stage ?? args.includes("--stage");
  const scope = options.scope ? `@${options.scope}:registry` : "registry";
  const registry = options.registry ? options.registry : PUBLIC_REGISTRY;
  if (options.token) {
    await exec("npm", ["config", "set", scope, registry]);
    await exec("npm", [
      "config",
      "set",
      "--",
      `${registry.replace(/^https?:/, "")}:_authToken`,
      options.token,
    ]);
  }
  // npm publish has no --stage flag: staged publishing runs as `npm stage publish`
  const publishArgs = stage
    ? ["stage", "publish", "--tag", options.tag || "latest"]
    : ["publish", "--tag", "latest"];
  if (registry === PUBLIC_REGISTRY) publishArgs.push("--access", "public");
  await exec("npm", publishArgs);
  // staged versions are not public yet and their tag is immutable, so dist-tag only applies to direct publishes
  if (!stage && (options.tag || options.tag !== "latest")) {
    const pkg = JSON.parse(await fs.promises.readFile("package.json", "utf-8"));
    await exec("npm", [
      "dist-tag",
      "add",
      `${pkg.name}@${pkg.version}`,
      options.tag,
    ]);
  }
}

export default main;
