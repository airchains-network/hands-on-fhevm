import logger from "./utils/logger.js";
import { getEnvironmentVariables } from "./utils/env.js";
import { deriveWalletsAndDetails } from "./utils/wallet.js";
import { computeCoreAddresses } from "./src/core/precompute-core-address.js";
import { deployCoreContract } from "./src/core/deploy-core-address.js";
import { setupRelayer } from "./src/core/gateway-relayer.js";

async function main() {
  const { networkUrl, mnemonic } = getEnvironmentVariables();
  const {
    deployerAddressCore,
    privateKeyCore,
    deployerAddressGateway,
    privateKeyGateway,
    privateKeyRelayer,
  } = deriveWalletsAndDetails(mnemonic);
  logger.boldinfo("========== PRECOMPUTING CORE ADDRESSES ==========");
  await computeCoreAddresses(deployerAddressCore, deployerAddressGateway);
  logger.boldinfo("✅ Precomputing addresses successful");

  logger.boldinfo("========== CORE ADDRESSES ==========");
  await deployCoreContract(
    privateKeyCore,
    networkUrl,
    "core/lib",
    "ACL.sol",
    "contracts/core/lib",
    ".env.exec",
    ["FHEVM_COPROCESSOR_ADDRESS"],
  );
  await deployCoreContract(
    privateKeyCore,
    networkUrl,
    "core/lib",
    "TFHEExecutor.sol",
    "",
    "",
  );
  await deployCoreContract(
    privateKeyCore,
    networkUrl,
    "core/lib",
    "KMSVerifier.sol",
    "",
    "",
  );
  await deployCoreContract(
    privateKeyGateway,
    networkUrl,
    "core/gateway",
    "GatewayContract.sol",
    "contracts/core/lib",
    ".env.kmsverifier",
    [deployerAddressGateway, "KMS_VERIFIER_CONTRACT_ADDRESS"],
  );
  logger.boldinfo("✅ Core Contracts deployed successfully");

  // Sleep for 2 seconds
  await new Promise((resolve) => setTimeout(resolve, 2000));

  logger.boldinfo("========== GATEWAY RELAYER ==========");
  await setupRelayer(privateKeyGateway, networkUrl, privateKeyRelayer);
  logger.boldinfo("✅ Gateway Relayer added successfully");
}

main();
