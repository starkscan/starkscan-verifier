import inquirer from "inquirer";
// @ts-ignore
import searchList from "inquirer-search-list";
import { StarknetCompilerVersion } from "types.js";

export async function getStarknetCompilerVersion(): Promise<StarknetCompilerVersion> {
  const ui = new inquirer.ui.BottomBar();
  ui.log.write("\n");

  inquirer.registerPrompt("search-list", searchList);

  const userInput = await inquirer.prompt({
    // @ts-ignore
    type: "search-list",
    name: "StarknetCompilerVersion",
    message: "Compiler version:",
    choices: ["0.10.2", "0.10.1", "0.10.0", "0.9.1", "0.9.0", "0.8.2", "0.8.1", "0.8.0"],
  });
  return userInput.StarknetCompilerVersion;
}
