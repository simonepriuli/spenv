#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import readline from "readline";

// Create a new Command instance
const program = new Command();

// Function to ask the user for confirmation
function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

// Define the version and description of the CLI tool
program.version("1.0.0").description("A simple CLI tool example");

// Add a command to greet the user
program
  .command("greet <name>")
  .description("Greet the user by name")
  .action((name: string) => {
    console.log(chalk.green(`Hello, ${name}!`));
  });

// Add a command to initialize the .superenv folder and update .gitignore
program
  .command("init")
  .description("Initialize the .superenv folder in the current directory")
  .action(() => {
    const dirPath = path.join(process.cwd(), ".superenv");
    const gitignorePath = path.join(process.cwd(), ".gitignore");

    // Create the .superenv folder if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
      console.log(
        chalk.green(`.superenv folder created successfully at ${dirPath}`)
      );
    } else {
      console.log(
        chalk.yellow(`.superenv folder already exists at ${dirPath}`)
      );
    }

    // Check if .gitignore exists, if not, create it
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, ".superenv\n", "utf8");
      console.log(chalk.green(`.gitignore created and .superenv added to it`));
    } else {
      // If .gitignore exists, check if .superenv is already in the file
      const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
      if (!gitignoreContent.includes(".superenv")) {
        fs.appendFileSync(gitignorePath, ".superenv\n", "utf8");
        console.log(chalk.green(`.superenv added to .gitignore`));
      } else {
        console.log(chalk.yellow(`.superenv is already listed in .gitignore`));
      }
    }
  });

program
  .command("list")
  .description("List all environments")
  .action(() => {
    console.log("Listing all environments");

    const dirPath = path.join(process.cwd(), ".superenv");
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      if (file.endsWith(".env")) {
        const envName = file.split(".")[1];
        console.log(chalk.green(envName));
      }
    });
  });
program
  .command("create <envName>")
  .description("Create a new environment file (e.g., .superenv/.staging.env)")
  .action((envName: string) => {
    const superenvDir = path.join(process.cwd(), ".superenv");
    const envFilePath = path.join(superenvDir, `.${envName}.env`);

    // Check if .superenv exists first
    if (!fs.existsSync(superenvDir)) {
      console.log(
        chalk.red(
          `Error: .superenv directory does not exist. Run 'spenv init' first.`
        )
      );
      process.exit(1); // Exit with failure
    }

    // Check if the environment file already exists
    if (!fs.existsSync(envFilePath)) {
      fs.writeFileSync(
        envFilePath,
        "# Environment variables go here\n",
        "utf8"
      );
      console.log(
        chalk.green(
          `Environment file '.${envName}.env' created successfully inside .superenv.`
        )
      );
    } else {
      console.log(
        chalk.yellow(
          `Environment file '.${envName}.env' already exists inside .superenv.`
        )
      );
    }
  });

program
  .command("push <envName>")
  .description(
    "Push the current .env file to the specified environment in .superenv (e.g., spenv push develop)"
  )
  .action(async (envName: string) => {
    const envFileSource = path.join(process.cwd(), ".env");
    const superenvDir = path.join(process.cwd(), ".superenv");
    const destEnvFilePath = path.join(superenvDir, `.${envName}.env`);

    // Check if .env file exists in the project
    if (!fs.existsSync(envFileSource)) {
      console.log(
        chalk.red(`Error: No .env file found in the current directory.`)
      );
      process.exit(1); // Exit with failure
    }

    // Check if .superenv exists first
    if (!fs.existsSync(superenvDir)) {
      console.log(
        chalk.red(
          `Error: .superenv directory does not exist. Run 'spenv init' first.`
        )
      );
      process.exit(1); // Exit with failure
    }

    // If the target environment file exists, compare its content
    if (fs.existsSync(destEnvFilePath)) {
      const currentEnvContent = fs.readFileSync(envFileSource, "utf8");
      const targetEnvContent = fs.readFileSync(destEnvFilePath, "utf8");

      // Compare the content
      if (currentEnvContent === targetEnvContent) {
        console.log(
          chalk.yellow(
            `The content of .env and .${envName}.env are the same. No changes made.`
          )
        );
        return;
      } else {
        // Ask the user if they want to overwrite the file
        const answer = await askQuestion(
          chalk.yellow(
            `The content of .${envName}.env is different from .env. Do you want to overwrite it? (y/n): `
          )
        );
        if (answer.toLowerCase() !== "y") {
          console.log(chalk.red(`Operation aborted. No changes made.`));
          return;
        }
      }
    }

    // Copy the .env content to the target environment file
    fs.copyFileSync(envFileSource, destEnvFilePath);
    console.log(
      chalk.green(`Successfully pushed .env to .${envName}.env in .superenv.`)
    );
  });

// Parse the command-line arguments
program.parse(process.argv);
