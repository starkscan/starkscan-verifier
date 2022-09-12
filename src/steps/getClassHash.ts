import { isString } from "class-validator";
import inquirer from "inquirer";
import * as starknet from "starknet";
import ora from "ora";

import { networkType } from "../types.js";
import { getHashDetails, getStarkscanClassUrl } from "../api.js";


function validateHash(input: string): string | boolean {
  if (!isString(input)) {
    return "must be a string";
  }

  if (!starknet.number.isHex(input)) {
    return "must be hex string";
  }

  return true;
}

export async function getClassHash(): Promise<{
  classHash: string;
  networks: networkType[];
}> {
  const ui = new inquirer.ui.BottomBar();
  ui.log.write("\n")

  const spinner = ora();

  // get hash from user
  const userInput = await inquirer.prompt({
    type: "input",
    name: "Hash",
    message: "Please enter the deployed Contract Address or Class Hash: ",
    validate(input: string) {
      return validateHash(input);
    },
  });
  const userInputHash = userInput.Hash;

  spinner.start("Looking for address on Testnet and Mainnet...");
  const promises = []
  promises.push(await getHashDetails({
    hash: userInputHash,
    network: "testnet",
  }))
  promises.push(await getHashDetails({
    hash: userInputHash,
    network: "mainnet",
  }))
  const hashDetails = await Promise.all(promises)
  const hashDetailsTestnet = hashDetails[0]
  const hashDetailsMainnet = hashDetails[1]

  ui.log.write("\n")
  const choices = [];
  if (hashDetailsTestnet) {
    if (hashDetailsTestnet.is_verified) {
      const starkscanUrl = getStarkscanClassUrl({
        classHash: hashDetailsTestnet.class_hash,
        network: "testnet",
      })
      spinner.info(`Already verified on Testnet: ${starkscanUrl}`)
    } else {
      if (hashDetailsTestnet.type === "class") {
        spinner.succeed("Found class hash on Testnet");
      } else if (hashDetailsTestnet.type === "contract") {
        spinner.succeed(`Found contract address on Testnet, which implements class hash ${hashDetailsTestnet.class_hash}`);
      }
      choices.push({
        name: "Testnet",
        value: "testnet",
        checked: true,
      });
    }
  }
  if (hashDetailsMainnet) {
    if (hashDetailsMainnet.is_verified) {
      const starkscanUrl = getStarkscanClassUrl({
        classHash: hashDetailsMainnet.class_hash,
        network: "mainnet",
      })
      spinner.info(`Already verified on Mainnet: ${starkscanUrl}`)
    } else {
      if (hashDetailsMainnet.type === "class") {
        spinner.succeed("Found class hash on Mainnet");
      } else if (hashDetailsMainnet.type === "contract") {
        spinner.succeed(`Found contract address on Mainnet, which implements class hash ${hashDetailsMainnet.class_hash}`);
      }
      choices.push({
        name: "Mainnet",
        value: "mainnet",
        checked: true,
      });  
    }
  }
  ui.log.write("\n")

  if (!choices.length) {
    process.exit(0)
  }

  const classHash =
    hashDetailsTestnet?.class_hash ?? hashDetailsMainnet?.class_hash;
  if (!classHash) {
    spinner.fail(
      "Cannot find address on testnet or mainnet. Please try again.\n"
    );
    spinner.stop();
    return await getClassHash();
  }
  spinner.stop();

  // get hash from user
  const userInputRes = await inquirer.prompt({
    type: "checkbox",
    name: "VerifyOnNetworks",
    message: "Select networks to verify",
    choices: choices,
  });
  const userSelectedNetworks = userInputRes.VerifyOnNetworks;

  return {
    classHash: classHash,
    networks: userSelectedNetworks,
  };
}
