#!/usr/bin/env node
import { Command } from "commander";
import { selectProfile } from "./helpers/prompt";
import {
  ensureLogin,
  getCurrentProfile,
  hasValidCredentials,
  saveLastUsedProfile,
  getLastUsedProfile,
} from "./helpers/aws";
import { runAwsCommand } from "./helpers/runner";
import { confirm } from "@inquirer/prompts";
import chalk from "chalk";

type AwsArgs = string[];

const program = new Command();
program
  .name("awsc")
  .description(
    "Run AWS CLI commands with automatic profile selection + SSO login"
  )
  .allowUnknownOption()
  .argument(
    "<aws-cmd...>",
    "AWS command and arguments (e.g., s3 ls, ec2 describe-instances, sts get-caller-identity)"
  )
  .action(async (args: AwsArgs) => {
    try {
      let profile = getCurrentProfile();

      if (profile && (await hasValidCredentials(profile))) {
        const useCurrent = await selectProfile([profile], true);
        profile = useCurrent;
      } else {
        const lastUsed = getLastUsedProfile();
        if (lastUsed && (await hasValidCredentials(lastUsed))) {
          const useLastUsed = await selectProfile([lastUsed], true);
          profile = useLastUsed;
        } else {
          profile = await selectProfile();
        }
      }

      saveLastUsedProfile(profile);
      await ensureLogin(profile);

      await runAwsCommand(profile, args);
    } catch (error: any) {
      if (error.name === "ExitPromptError") {
        console.log(chalk.yellow("\n🙈 Cancelled."));
        process.exit(0);
      }
      throw error;
    }
  });

program.parse();
