import { exec } from "@actions/exec";

async function main(options, ...args) {
    if(options.clean) args.unshift("clean-install");
    else args.unshift("install");
    if(options.production) args.push("--production");
    if(options.noOptional) args.push("--no-optional");
    if(options.legacyPeerDeps) args.push("--legacy-peer-deps");
    if(options.force) args.push("--force");
    return await exec("npm", args);
}

export default main;