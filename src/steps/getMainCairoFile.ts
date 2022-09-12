import { isString } from "class-validator";
import inquirer from "inquirer";
import fuzzyPath from "inquirer-fuzzy-path";

async function validateMainCairoFile(input: string): Promise<string | boolean> {
  if (!isString(input)) {
    return "must be a string";
  }

  if (!input.endsWith(".cairo")) {
    return "must be a cairo file";
  }

  return true;
}

export async function getMainCairoFile(): Promise<string> {
  // https://github.com/adelsz/inquirer-fuzzy-path
  inquirer.registerPrompt("fuzzypath", fuzzyPath);

  const userInput = await inquirer.prompt({
    // @ts-ignore
    type: "fuzzypath",
    name: "MainCairoFile",
    message: "Main file to be verified ☑️ ",
    itemType: "file",
    searchText: "Searching for main file...",
    suggestOnly: false,
    excludePath: (nodePath: string) => {
      return (
        // potential python envs
        nodePath.startsWith("venv") ||
        nodePath.startsWith("env") ||
        nodePath.startsWith(".venv") ||
        nodePath.startsWith(".env") ||
        // javascript modules
        nodePath.startsWith("node_modules")
      );
    },
    excludeFilter: (nodePath: string) => {
      return !nodePath.endsWith(".cairo");
    },
    validate(input: any) {
      return validateMainCairoFile(input.value);
    },
  });
  return userInput.MainCairoFile.trim();
}
