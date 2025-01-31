import { JsonRpcProvider, Wallet, ContractFactory } from "ethers";
import { getCompiledContract } from "./compile.js";
import logger from "../utils/logger.js";

export async function deployContract(
  networkUrl,
  privateKey,
  contractName,
  constructorArgs = [],
) {
  try {
    const { abi, evm } = await getCompiledContract(contractName);
    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey, provider);

    const balanceWei = await provider.getBalance(wallet.address);

    if (balanceWei === 0n) {
      logger.warn("Wallet Balance Alert");
      logger.info(`Address: ${wallet.address}`);
      logger.info("Current balance: 0 ETH");
      logger.warn("Action required: Please add funds to this address\n");
      throw new Error("zero_balance");
    }

    const factory = new ContractFactory(abi, evm.bytecode, wallet);

    logger.info(`Deploying ${contractName}`);
    const contract = await factory.deploy(...constructorArgs);

    logger.info(`Successfully deployed ${contractName} at: ${contract.target}`);
    logger.info(`Transaction hash: ${contract.deploymentTransaction().hash}`);
    return { contract };
  } catch (error) {
    if (
      error.message === "zero_balance" ||
      error.message === "insufficient_balance"
    ) {
      process.exit(1);
    }
    logger.error(`\nDeployment failed: ${error.message}`);
    throw error;
  }
}
