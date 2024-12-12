import getCompiledContract from "./src/compile.js";
import deployContract from "./src/deploy.js";
import dotenv from "dotenv";
import logger from "./utils/logger.js";
import { computeCoreAddresses } from "./src/core/compute-core-addresses.js";
import { deployCoreContracts } from "./src/core/deploy-core-contracts.js";
dotenv.config();

let contractAddress;

async function main() {
  try {
    const networkUrl = process.env.NETWORK_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractPath = "./contracts/EncryptedERC20.sol";

    if (!networkUrl || !privateKey) {
      throw new Error(
        "Environment variables NETWORK_URL or PRIVATE_KEY are missing.",
      );
    }
    // Core Contracts compilation and deployment
    computeCoreAddresses();
    deployCoreContracts();

    // Compilation and deployment of the user contract
    getCompiledContract(contractPath);
    const { contract } = await deployContract(
      networkUrl,
      privateKey,
      contractPath,
      // pass constructor arguments according to the contract
      ["NAME", "SYMBOL"],
    );

    if (!contract) {
      throw new Error("Failed to deploy contract.");
    }

    contractAddress = await contract.getAddress();
    logger.info(`Contract Address: ${contractAddress}`);
    return contractAddress;
  } catch (error) {
    logger.error("Error in main execution:", error.message);
  }
}

main().catch((error) => {
  logger.error("Unhandled error in main execution:", error.message);
});

export const deployedContract = { contractAddress };
