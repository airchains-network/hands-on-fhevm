import dotenv from "dotenv";
dotenv.config();

export function getEnvironmentVariables() {
  const networkUrl = process.env.NETWORK_URL;
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) throw new Error("MNEMONIC environment variable not set.");
  return { networkUrl, mnemonic };
}
