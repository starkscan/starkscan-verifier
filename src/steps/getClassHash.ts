import { isString } from "class-validator";
import inquirer from "inquirer";
import checkbox from "@inquirer/checkbox";

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
  ui.log.write("\n");

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

  spinner.start("Looking for address on Testnet, Testnet-2 and Mainnet...");
  const promises = [];
  promises.push(
    getHashDetails({
      hash: userInputHash,
      network: "testnet",
    })
  );
  promises.push(
    getHashDetails({
      hash: userInputHash,
      network: "testnet-2",
    })
  );
  promises.push(
    getHashDetails({
      hash: userInputHash,
      network: "mainnet",
    })
  );
  const hashDetails = await Promise.all(promises);
  const hashDetailsTestnet = hashDetails[0];
  const hashDetailsTestnet2 = hashDetails[1];
  const hashDetailsMainnet = hashDetails[2];

  ui.log.write("\n");
  const choices = [];
  if (hashDetailsTestnet) {
    if (hashDetailsTestnet.is_verified) {
      const starkscanUrl = getStarkscanClassUrl({
        classHash: hashDetailsTestnet.class_hash,
        network: "testnet",
      });
      spinner.info(`Already verified on Testnet: ${starkscanUrl}`);
    } else {
      if (hashDetailsTestnet.type === "class") {
        spinner.succeed("Found class hash on Testnet");
      } else if (hashDetailsTestnet.type === "contract") {
        spinner.succeed(
          `Found contract address on Testnet, which implements class hash ${hashDetailsTestnet.class_hash}`
        );
      }
      choices.push({
        name: "Testnet",
        value: "testnet",
        checked: true,
      });
    }
  }
  if (hashDetailsTestnet2) {
    if (hashDetailsTestnet2.is_verified) {
      const starkscanUrl = getStarkscanClassUrl({
        classHash: hashDetailsTestnet2.class_hash,
        network: "testnet-2",
      });
      spinner.info(`Already verified on Testnet-2: ${starkscanUrl}`);
    } else {
      if (hashDetailsTestnet2.type === "class") {
        spinner.succeed("Found class hash on Testnet-2");
      } else if (hashDetailsTestnet2.type === "contract") {
        spinner.succeed(
          `Found contract address on Testnet-2, which implements class hash ${hashDetailsTestnet2.class_hash}`
        );
      }
      choices.push({
        name: "Testnet-2",
        value: "testnet-2",
        checked: true,
      });
    }
  }
  if (hashDetailsMainnet) {
    if (hashDetailsMainnet.is_verified) {
      const starkscanUrl = getStarkscanClassUrl({
        classHash: hashDetailsMainnet.class_hash,
        network: "mainnet",
      });
      spinner.info(`Already verified on Mainnet: ${starkscanUrl}`);
    } else {
      if (hashDetailsMainnet.type === "class") {
        spinner.succeed("Found class hash on Mainnet");
      } else if (hashDetailsMainnet.type === "contract") {
        spinner.succeed(
          `Found contract address on Mainnet, which implements class hash ${hashDetailsMainnet.class_hash}`
        );
      }
      choices.push({
        name: "Mainnet",
        value: "mainnet",
        checked: true,
      });
    }
  }
  ui.log.write("\n");

  if (!choices.length) {
    process.exit(0);
  }

  const classHash =
    hashDetailsTestnet?.class_hash ?? hashDetailsMainnet?.class_hash;
  if (!classHash) {
    spinner.fail(
      "Cannot find address on testnet, testnet-2 or mainnet. Please try again.\n"
    );
    spinner.stop();
    return await getClassHash();
  }
  spinner.stop();

  // get hash from user
  // Using checkbox from @inquirer/checkbox because of memory leak issue with inquirer: https://github.com/SBoudrias/Inquirer.js/issues/887
  const userSelectedNetworks = await checkbox({
    message: "Select networks to verify",
    choices: choices,
  });

  return {
    classHash: classHash,
    networks: userSelectedNetworks as networkType[],
  };
}
