import inquirer from "inquirer";
import * as fs from "fs"

export async function getIsAccountContract(mainCairoFile: string): Promise<boolean> {
  const ui = new inquirer.ui.BottomBar();
  ui.log.write("\n")

  const userInput = await inquirer.prompt({
    type: "confirm",
    name: "IsAccountContract",
    message: "Is this an Account contract?",
  });
  const userInputIsAccountContract = userInput.IsAccountContract

  const mainCairoFileContents = fs.readFileSync(mainCairoFile, "utf-8")
  const isAccountContractGuess = mainCairoFileContents.includes("__execute__")

  if (userInputIsAccountContract !== isAccountContractGuess) {
    // our guess does not seem to match
    if (userInputIsAccountContract) {
      // user = is account contract, guess = not account contract
      const userInputConfirm = await inquirer.prompt({
        type: "confirm",
        name: "ConfirmIsAccountContract",
        message: "We couldn't find `__execute__` are you sure it is an account contract?"
      })
      if (!userInputConfirm.ConfirmIsAccountContract) {
        return await getIsAccountContract(mainCairoFile)
      }
    } else {
      // user = not account contract, guess = is account contract
      const userInputConfirm = await inquirer.prompt({
        type: "confirm",
        name: "ConfirmIsAccountContract",
        message: "We found `__execute__` are you sure it is not an account contract?"
      })
      if (!userInputConfirm.ConfirmIsAccountContract) {
        return await getIsAccountContract(mainCairoFile)
      }
    }
  }

  return userInput.IsAccountContract;
}
