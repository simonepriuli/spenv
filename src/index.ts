#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import fs from "fs";
import path from "path";

// Create a new Command instance
const program = new Command();

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
      console.log(chalk.green(`.superenv folder created successfully at ${dirPath}`));
    } else {
      console.log(chalk.yellow(`.superenv folder already exists at ${dirPath}`));
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

// Parse the command-line arguments
program.parse(process.argv);
