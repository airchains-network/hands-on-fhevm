import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

export function loadABI(contractName) {
  const abiPath = path.resolve(process.cwd(), "build", `${contractName}.json`);
  if (!fs.existsSync(abiPath)) {
    throw new Error(`ABI file not found for ${contractName} at ${abiPath}`);
  }

  const fileContent = fs.readFileSync(abiPath, "utf8");
  const parsedContent = JSON.parse(fileContent);

  if (!Array.isArray(parsedContent)) {
    throw new Error(`Invalid ABI format in file: ${abiPath}`);
  }

  return parsedContent;
}
