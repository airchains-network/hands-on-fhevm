import { intractionMint } from "./src/test/encrypted-erc20.js";
import { deployedContract } from "./index.js";
import dotenv from "dotenv";

dotenv.config();

const int = await intractionMint(
  "EncryptedERC20",
  process.env.NETWORK_URL,
  process.env.PRIVATE_KEY,
  deployedContract.contractAddress,
);

console.log(int);
