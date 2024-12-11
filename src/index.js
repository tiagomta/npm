import * as core from "@actions/core";
import { exec } from "@actions/exec";
import fs from "node:fs";
import { URL } from "node:url";

try {
  const context = JSON.parse(core.getInput("context"));
  const command = core.getInput("command");
  console.log(command);
  core.setOutput("result", true);
} catch (error) {
  core.setFailed(error.message);
}
