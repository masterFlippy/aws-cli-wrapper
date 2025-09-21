import { execa } from "execa";
import fs from "fs";
import os from "os";
import path from "path";
import chalk from "chalk";

export function getCurrentProfile(): string | null {
  return process.env.AWS_PROFILE || null;
}

export async function hasValidCredentials(profile: string): Promise<boolean> {
  try {
    await execa("aws", ["sts", "get-caller-identity", "--profile", profile]);
    return true;
  } catch {
    return false;
  }
}

export async function ensureLogin(profile: string) {
  if (!(await hasValidCredentials(profile))) {
    console.log(
      chalk.blue(`🌈 Logging in with AWS SSO for profile ${profile}...`)
    );
    await execa("aws", ["sso", "login", "--profile", profile], {
      stdio: "inherit",
    });
  }
}

export function listProfiles(): string[] {
  const configFile = path.join(os.homedir(), ".aws", "config");
  if (!fs.existsSync(configFile)) {
    return [];
  }
  const raw = fs.readFileSync(configFile, "utf8");

  const namedProfiles = raw
    .split("\n")
    .filter((line) => line.trim().startsWith("[profile "))
    .map((line) => line.replace("[profile ", "").replace("]", "").trim());

  const hasDefault = raw
    .split("\n")
    .some((line) => line.trim() === "[default]");

  const profiles = [...namedProfiles];
  if (hasDefault) {
    profiles.unshift("default");
  }

  return profiles;
}

export function getLastUsedProfile(): string | null {
  const configFile = path.join(os.homedir(), ".aws-tool-profile");
  if (!fs.existsSync(configFile)) {
    return null;
  }
  return fs.readFileSync(configFile, "utf8").trim();
}

export function saveLastUsedProfile(profile: string) {
  const configFile = path.join(os.homedir(), ".aws-tool-profile");
  fs.writeFileSync(configFile, profile);
}
