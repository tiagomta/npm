import { exec } from "@actions/exec";
import fs from "node:fs";

const PUBLIC_REGISTRY = "https://registry.npmjs.org/";

async function main(options, ...args) {
  const scope = options.scope ? `@${options.scope}:registry` : "registry";
  const registry = options.registry ? options.registry : PUBLIC_REGISTRY;
  await exec("npm", ["config", "set", scope, registry]);
  if (token)
    await exec("npm", [
      "config",
      "set",
      "--",
      `${registry.replace(/^https?:/, "")}:_authToken`,
      token,
    ]);
  const publishArgs = ["publish", "--tag", "latest"];
  if (registry === PUBLIC_REGISTRY) publishArgs.push("--access", "public");
  if (options.workspace) publishArgs.push("--workspace", options.workspace);
  await exec("npm", publishArgs);
  if (options.tag || options.tag !== "latest") {
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
