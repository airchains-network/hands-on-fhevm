import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { HDNodeWallet, getCreateAddress } from "ethers";
import dotenv from "dotenv";
import logger from "../../utils/logger.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MNEMONIC = process.env.MNEMONIC;
if (!MNEMONIC) {
  throw new Error("Core Contracts:MNEMONIC environment variable not set.");
}

const deployer = HDNodeWallet.fromPhrase(MNEMONIC);

logger.info(`Deployer Address: ${deployer.address}`);

function computeCreateAddress(from, nonce) {
  return getCreateAddress({ from, nonce });
}

function writeToFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, { flag: "w" });
    logger.info(`File written successfully: ${filePath}`);
  } catch (err) {
    logger.error(`Failed to write file at ${filePath}:`, err);
  }
}

function computeACLAddress() {
  const aclAddress = computeCreateAddress(deployer.address, 0);
  const envFilePath = path.join(
    __dirname,
    "../../node_modules/fhevm/lib/.env.acl",
  );
  const solidityFilePath = path.join(
    __dirname,
    "../../node_modules/fhevm/lib/ACLAddress.sol",
  );

  writeToFile(envFilePath, `ACL_CONTRACT_ADDRESS=${aclAddress}\n`);
  logger.info(
    `ACL Address written to: ${envFilePath} with address: ${aclAddress}`,
  );

  const solidityTemplate = `// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

address constant aclAdd = ${aclAddress};\n`;
  writeToFile(solidityFilePath, solidityTemplate);
  logger.info(
    `ACL Solidity file written to: ${solidityFilePath} with address: ${aclAddress}`,
  );
}

function computeTFHEExecutorAddress() {
  const execAddress = computeCreateAddress(deployer.address, 1);
  const envFilePath = path.join(
    __dirname,
    "../../node_modules/fhevm/lib/.env.exec",
  );
  const solidityFilePath = path.join(
    __dirname,
    "../../node_modules/fhevm/lib/FHEVMCoprocessorAddress.sol",
  );

  writeToFile(envFilePath, `TFHE_EXECUTOR_CONTRACT_ADDRESS=${execAddress}\n`);
  logger.info(
    `TFHE Executor Address written to: ${envFilePath} with address: ${execAddress}`,
  );

  const solidityTemplate = `// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

address constant fhevmCoprocessorAdd = ${execAddress};\n`;
  writeToFile(solidityFilePath, solidityTemplate);
  logger.info(
    `TFHE Executor Solidity file written to: ${solidityFilePath} with address: ${execAddress}`,
  );
}

function computeKMSVerifierAddress() {
  const kmsVerifierAddress = computeCreateAddress(deployer.address, 2);
  const envFilePath = path.join(
    __dirname,
    "../../node_modules/fhevm/lib/.env.kmsverifier",
  );
  const solidityFilePath = path.join(
    __dirname,
    "../../node_modules/fhevm/lib/KMSVerifierAddress.sol",
  );

  writeToFile(
    envFilePath,
    `KMS_VERIFIER_CONTRACT_ADDRESS=${kmsVerifierAddress}\n`,
  );
  logger.info(
    `KMS Verifier Address written to: ${envFilePath} with address: ${kmsVerifierAddress}`,
  );

  const solidityTemplate = `// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

address constant KMS_VERIFIER_CONTRACT_ADDRESS = ${kmsVerifierAddress};\n`;
  writeToFile(solidityFilePath, solidityTemplate);
  logger.info(
    `KMS Verifier Solidity file written to: ${solidityFilePath} with address: ${kmsVerifierAddress}`,
  );
}

export async function computeCoreAddresses() {
  computeACLAddress();
  computeTFHEExecutorAddress();
  computeKMSVerifierAddress();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await computeCoreAddresses();
}
