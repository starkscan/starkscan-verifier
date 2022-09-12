import * as path from "path";
import fs from "fs";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";

import { Files } from "../types.js";
import { getCairoPathsForNile, getCairoPathsForProtostar } from "../tools.js";

const IMPORT_REGEX = /^from\s(.*?)\simport/gm;
const spinner = ora();

export async function getFileTree(mainFilePath: string): Promise<Files> {
  const ui = new inquirer.ui.BottomBar();
  ui.log.write("\n")

  try {
    const cairoPaths = await getCairoPathsForProtostar();
    if (cairoPaths.length) {
      spinner.succeed(`🌟 Protostar environment found!`);
      spinner.info(
        `Searching in Protostar cairo paths ${chalk.bold.blueBright(
          cairoPaths.join(", ")
        )}\n`
      );
      const files = await FileTree.getFiles({
        mainFilePath: mainFilePath,
        shouldPromptUser: false,
        cairoPaths: cairoPaths,
      });
      ui.log.write("\n")
      spinner.succeed(`All files found`);
      return files;
    }
  } catch (err) {
    spinner.fail(`Files not found in protostar cairo path\n`);
  }

  try {
    const cairoPaths = await getCairoPathsForNile();
    if (cairoPaths.length) {
      spinner.succeed(`🌊 Nile environment found!`);
      spinner.info(
        `Searching in Nile cairo path ${chalk.bold.blueBright(
          cairoPaths.toString()
        )}\n`
      );
      const files = await FileTree.getFiles({
        mainFilePath: mainFilePath,
        shouldPromptUser: false,
        cairoPaths: cairoPaths,
      });
      ui.log.write("\n")
      spinner.succeed(`All files found`);
      return files;
    }
  } catch (err) {
    spinner.fail(`Files not found in Nile cairo path\n`);
  }

  // start search
  spinner.info("Searching for files\n");
  const files = await FileTree.getFiles({
    mainFilePath: mainFilePath,
    shouldPromptUser: true,
    cairoPaths: [],
  });
  ui.log.write("\n")
  spinner.succeed(`All files found`);
  return files;
}

class FileTree {
  // should ask user for cairo path if cannot be found, will throw otherwise
  shouldPromptUser: boolean;

  mainFilePathName: string;
  files: Files;
  cairoPaths: string[];

  static async getFiles({
    mainFilePath,
    shouldPromptUser,
    cairoPaths,
  }: {
    mainFilePath: string;
    shouldPromptUser: boolean;
    cairoPaths: string[];
  }): Promise<Files> {
    const fileTree = new FileTree({
      mainFilePath: mainFilePath,
      shouldPromptUser: shouldPromptUser,
      cairoPaths: cairoPaths,
    });
    await fileTree.populateFileTree();
    return fileTree.files;
  }

  constructor({
    mainFilePath,
    shouldPromptUser,
    cairoPaths,
  }: {
    mainFilePath: string;
    shouldPromptUser: boolean;
    cairoPaths: string[];
  }) {
    this.shouldPromptUser = shouldPromptUser;
    this.mainFilePathName = path.basename(mainFilePath);
    this.files = {};
    this.cairoPaths = [path.dirname(mainFilePath), ...cairoPaths];
    spinner.start();
  }

  async populateFileTree() {
    await this._populateFileTree(this.mainFilePathName);
    return this.files;
  }

  logFileFound(fpath: string) {
    spinner.succeed(
      `📄 ${chalk.yellowBright.bold(`./${fpath}`)} file found!`
    );
  }

  private async _populateFileTree(currentFilePath: string) {
    if (currentFilePath in this.files) {
      // this file path has already been found
      return this.files;
    }

    // search for contents
    const fileContents = await this.getFileContents(currentFilePath);

    // save the file
    this.files[currentFilePath] = fileContents;

    // get all imported files
    const importedFilesRegexOutput = [...fileContents.matchAll(IMPORT_REGEX)];
    const importedFilesPath = importedFilesRegexOutput.map(
      (importedFileRegex) => {
        return importedFileRegex[1];
      }
    );

    // process each imported file
    for (let i = 0; i < importedFilesPath.length; i++) {
      const importedFilePath = importedFilesPath[i];
      if (importedFilePath.startsWith("starkware")) {
        // ignore starkware packages, should be included in cairo-lang
        continue;
      }
      const convertedFilePath =
        importedFilePath.split(".").join("/") + ".cairo";
      await this._populateFileTree(convertedFilePath);
    }
  }

  private async getFileContents(currentFilePath: string) {
    // search base file
    const fileExists = fs.existsSync(currentFilePath);
    if (fileExists) {
      this.logFileFound(currentFilePath)
      return fs.readFileSync(currentFilePath, "utf-8");
    }

    // search in potential paths
    for (let i = 0; i < this.cairoPaths.length; i++) {
      const searchPath = this.cairoPaths[i];

      const potentialFullFilePath = path.join(searchPath, currentFilePath);
      const fileExists = fs.existsSync(potentialFullFilePath);
      if (fileExists) {
        this.logFileFound(potentialFullFilePath)
        return fs.readFileSync(potentialFullFilePath, "utf-8");
      }
    }

    // cannot find file
    if (this.shouldPromptUser) {
      spinner.fail(
        `Could not find file ${chalk.yellowBright.bold(
          currentFilePath
        )} in ${chalk.blueBright.bold(`./${this.cairoPaths}`)}`
      );
      while (true) {
        // loop until file is found
        spinner.stop();

        const baseItem = currentFilePath.split(path.sep)[0];
        const userInput = await inquirer.prompt({
          type: "input",
          name: "CairoPath",
          message: `Please input the cairo path to ${chalk.blue(
            `${baseItem}/`
          )}`,
        });
        const potentialNewCairoPath = userInput.CairoPath;
        const potentialFullFilePath = path.join(
          potentialNewCairoPath,
          currentFilePath
        );
        if (fs.existsSync(potentialFullFilePath)) {
          this.cairoPaths.push(potentialNewCairoPath);
          this.logFileFound(potentialFullFilePath)
          return fs.readFileSync(potentialFullFilePath, "utf-8");
        } else {
          spinner.fail(
            `Could not find file ${chalk.yellowBright.bold(
              currentFilePath
            )} in ${chalk.blueBright.bold(`./${potentialFullFilePath}`)}\n`
          );
        }
        // cannot find... continue looping
      }
    } else {
      spinner.fail(
        `Could not find ${currentFilePath} in ${this.cairoPaths.toString()}`
      );
      throw new Error(`Could not find file: ${currentFilePath}`);
    }
  }
}
