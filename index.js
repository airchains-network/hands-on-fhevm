import logger from "./utils/logger.js";
import { getEnvironmentVariables } from "./utils/env.js";
import { deriveWalletsAndDetails } from "./utils/wallet.js";
import { computeCoreAddresses } from "./src/core/compute-core-addresses.js";
import { deployCoreContracts } from "./src/core/deploy-core-contracts.js";
import { gateway } from "./src/core/gateway.js";
import getCompiledContract from "./src/compile.js";
import deployContract from "./src/deploy.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

let contractAddress;

export function getContractPath() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return path.resolve(__dirname, "./contracts/EncryptedERC20.sol");
}

async function deployCoreAndGatewayContracts(
  privateKeyCore,
  networkUrl,
  deployerAddressCore,
  privateKeyGateway,
  deployerAddressGateway,
) {
  await computeCoreAddresses(deployerAddressCore);
  await deployCoreContracts(privateKeyCore, networkUrl, deployerAddressCore);
  await gateway(privateKeyGateway, networkUrl, deployerAddressGateway);
}

async function deployUserContract(networkUrl, privateKeyCore, contractPath) {
  const compiledContract = getCompiledContract(contractPath);
  const { contract } = await deployContract(
    networkUrl,
    privateKeyCore,
    compiledContract,
    // pass constructor arguments according to the contract
    ["NAME", "SYMBOL"],
  );

  if (!contract) {
    throw new Error("Failed to deploy contract.");
  }

  return contract.getAddress();
}

async function main() {
  try {
    const { networkUrl, mnemonic } = getEnvironmentVariables();
    const {
      deployerAddressCore,
      deployerAddressGateway,
      privateKeyCore,
      privateKeyGateway,
    } = deriveWalletsAndDetails(mnemonic);
    const contractPath = getContractPath();

    if (!networkUrl || !privateKeyCore || !privateKeyGateway) {
      throw new Error(
        "Environment variables NETWORK_URL, PRIVATE_KEY_CORE, or PRIVATE_KEY_GATEWAY are missing.",
      );
    }

    await deployCoreAndGatewayContracts(
      privateKeyCore,
      networkUrl,
      deployerAddressCore,
      privateKeyGateway,
      deployerAddressGateway,
    );
    contractAddress = await deployUserContract(
      networkUrl,
      privateKeyCore,
      contractPath,
    );

    logger.info(`Contract Address: ${contractAddress}`);
    return contractAddress;
  } catch (error) {
    logger.error(`Error in main execution: ${error.message}`);
  }
}

main().catch((error) => {
  logger.error(`Unhandled error in main execution: ${error.message}`);
});

export const deployedContract = { contractAddress };
