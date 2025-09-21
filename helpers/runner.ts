import { execa } from "execa";
import chalk from "chalk";

export async function runAwsCommand(profile: string, args: string[]) {
  console.log(
    chalk.green(`🚀 Running: aws ${args.join(" ")} (profile: ${profile})`)
  );

  try {
    await execa("aws", args, {
      stdio: "inherit",
      env: {
        ...process.env,
        AWS_PROFILE: profile,
      },
    });
  } catch (error: any) {
    const errorText = (error.message || "") + (error.stderr || "");
    if (errorText.includes("SSO") || errorText.includes("token")) {
      console.log(chalk.yellow("🔄 SSO token expired, refreshing..."));
      await execa("aws", ["sso", "login", "--profile", profile], {
        stdio: "inherit",
      });
      return runAwsCommand(profile, args);
    } else {
      throw error;
    }
  }
}
