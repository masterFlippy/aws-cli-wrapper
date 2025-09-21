# awsc

A simple wrapper for AWS CLI that handles profiles and SSO login automatically.

## What it does

Instead of remembering which AWS profile to use and manually logging in every time, just run your AWS commands with `awsc` and it handles everything for you.

## Install

1. Clone or download this project
2. Run these commands:

```bash
npm install
npm run link
```

Now you can use `awsc` anywhere on your computer.

## How to use

Just put `awsc` in front of any AWS command:

```bash
# Instead of this:
aws sts get-caller-identity --profile my-work-profile

# Just do this:
awsc sts get-caller-identity
```

## Examples

```bash
# Check who you are
awsc sts get-caller-identity

# List S3 buckets
awsc s3 ls

# List EC2 instances
awsc ec2 describe-instances


# Any AWS command works
awsc cloudformation list-stacks
```

## What happens when you run it

1. **If you have valid credentials**: It asks if you want to use your current profile
2. **If no profiles exist**: It guides you through setting up AWS SSO or regular profiles
3. **If credentials expired**: It automatically logs you in via SSO
4. **Profile selection**: It remembers your last choice but always asks for confirmation

## Requirements

- Node.js 22 or higher
- AWS CLI installed
- Linux or macOS (not tested on Windows)

_Note: If you don't have AWS profiles set up, the tool will guide you through the setup process._

## Uninstall

```bash
npm unlink -g awsc
```
