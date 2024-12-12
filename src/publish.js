import { exec } from "@actions/exec";

const PUBLIC_REGISTRY = "https://registry.npmjs.org/";

async function main(options, ...args) {
    const scope = options.scope ? `@${options.scope}:registry` : "registry";
    const registry = options.registry ? options.registry : PUBLIC_REGISTRY;
    await exec("npm", ["config", "set", scope, registry]);
    if (token) await exec("npm", ["config", "set", "--", `${registry.replace(/^https?:/,"")}:_authToken`, token]);
    const publishArgs = ["publish"];
    if (registry === PUBLIC_REGISTRY) publishArgs.push("--access", "public");
    // await exec("npm", publishArgs);
}

export default main;