import inquirer from "inquirer";
import { listProfiles, getLastUsedProfile } from "./aws";
import { execa } from "execa";
import chalk from "chalk";

export async function selectProfile(
  candidates?: string[],
  confirmOnly?: boolean
): Promise<string> {
  if (confirmOnly && candidates && candidates.length === 1) {
    const answer = await inquirer.prompt([
      {
        type: "confirm",
        name: "use",
        message: `Use current profile "${candidates[0]}"?`,
        default: true,
      },
    ]);
    if (answer.use) {
      return candidates[0];
    }
  }

  const profiles = candidates && !confirmOnly ? candidates : listProfiles();

  if (profiles.length === 0) {
    console.log(chalk.yellow("🔧 No AWS profiles found!"));

    const setupChoice = await inquirer.prompt([
      {
        type: "list",
        name: "setup",
        message: "Would you like to set up an AWS profile?",
        choices: [
          { name: "Yes, set up SSO profile (recommended)", value: "sso" },
          {
            name: "Yes, set up regular profile with access keys",
            value: "regular",
          },
          { name: "No, exit", value: "exit" },
        ],
      },
    ]);

    if (setupChoice.setup === "exit") {
      console.log(chalk.yellow("👋 Goodbye!"));
      process.exit(0);
    }

    if (setupChoice.setup === "sso") {
      console.log(chalk.blue("🚀 Setting up AWS SSO profile..."));
      console.log(
        chalk.dim("This will open your browser to authenticate with AWS SSO")
      );

      try {
        await execa("aws", ["configure", "sso"], { stdio: "inherit" });
        console.log(chalk.green("✅ AWS SSO profile setup complete!"));

        const newProfiles = listProfiles();
        if (newProfiles.length === 0) {
          throw new Error("Profile setup was cancelled or failed");
        }

        return newProfiles[newProfiles.length - 1];
      } catch (error) {
        console.log(chalk.red("❌ Failed to set up AWS SSO profile"));
        console.log(chalk.dim("You can manually run: aws configure sso"));
        process.exit(1);
      }
    }

    if (setupChoice.setup === "regular") {
      console.log(chalk.blue("🔑 Setting up AWS profile with access keys..."));
      console.log(
        chalk.dim("You'll need your AWS Access Key ID and Secret Access Key")
      );

      try {
        await execa("aws", ["configure"], { stdio: "inherit" });
        console.log(chalk.green("✅ AWS profile setup complete!"));

        return "default";
      } catch (error) {
        console.log(chalk.red("❌ Failed to set up AWS profile"));
        console.log(chalk.dim("You can manually run: aws configure"));
        process.exit(1);
      }
    }
  }

  const lastUsed = getLastUsedProfile();
  const defaultProfile =
    lastUsed && profiles.includes(lastUsed) ? lastUsed : profiles[0];

  const answer = await inquirer.prompt([
    {
      type: "list",
      name: "profile",
      message: "Choose an AWS profile:",
      choices: profiles,
      default: defaultProfile,
    },
  ]);
  return answer.profile;
}
