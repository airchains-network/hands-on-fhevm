import "dotenv/config";
import { execSync } from "child_process";
import { deriveAddressesFromMnemonic } from "./wallet.js";
import logger from "./logger.js";

const { MNEMONIC } = process.env;
if (!MNEMONIC) {
  logger.error("Error: MNEMONIC is not defined in .env");
  process.exit(1);
}

const addresses = deriveAddressesFromMnemonic(MNEMONIC, 10);

if (!addresses.length) {
  logger.error("Error: No addresses derived from mnemonic.");
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async function main() {
  logger.boldinfo(
    "========== FUNDING ADDRESS DERIVED FROM MNEMNONIC ==========",
  );

  for (const address of addresses) {
    const addrNo0x = address.replace(/^0x/, "");
    logger.info(`Funding address: ${address}`);

    try {
      execSync(
        `docker exec -i zama-dev-fhevm-validator-1 faucet "${addrNo0x}"`,
        {
          stdio: "inherit",
        },
      );
    } catch (err) {
      logger.error(`Error funding address ${address}:`, err.message);
    }
    await sleep(8000);
  }

  logger.boldinfo("✅ All addresses funded successfully!");
})();
