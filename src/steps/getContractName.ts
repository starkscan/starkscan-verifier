import { isAscii, isString } from "class-validator"
import inquirer from "inquirer"

async function validateContractName(input: string): Promise<string | boolean> {
  if (!isString(input)) {
    return "must be a string"
  }

  if (!isAscii(input)) {
    return "must only contain ascii characters"
  }

  if (input.length <= 0) {
    return "must contain more than one character"
  }

  if (input.length > 30) {
    return "must contain less than 30 characters"
  }

  return true;
}

export async function getContractName({
  defaultName
} : {
  defaultName: string
}): Promise<string> {
  const ui = new inquirer.ui.BottomBar();
  ui.log.write("\n")

  const userInput = await inquirer.prompt(
    {
      type: "input",
      name: "ContractName",
      message: "Contract Name:",
      default: defaultName,
      validate(input: string) {
        return validateContractName(input)
      }
    },
  )
  return userInput.ContractName
}
