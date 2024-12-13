import solc from "solc";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, "../build");
const CONTRACTS_DIR = path.resolve(__dirname, "../contracts");

// Ensure the output directory exists, create it if it doesn't
function ensureOutputDirExists() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

// Read the source code of the contract from the file
function readContractSource(contractPath) {
  if (typeof contractPath !== "string") {
    throw new Error(`Invalid contract path: ${contractPath}`);
  }

  if (!fs.existsSync(contractPath)) {
    throw new Error(`Contract file not found at path: ${contractPath}`);
  }
  return fs.readFileSync(contractPath, "utf8");
}

// Create the input format required by the Solidity compiler
function createCompilerInput(contractPath, source) {
  const contractName = path.basename(contractPath);
  return {
    language: "Solidity",
    sources: {
      [contractName]: {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };
}

// Enhanced custom import handler for the Solidity compiler to resolve imports
function findImports(importPath) {
  try {
    let fullPath;

    // Try to resolve imports within node_modules/fhevm directories
    const fhevmBasePath = path.resolve(__dirname, "../node_modules/fhevm");
    const potentialPaths = [
      path.resolve(fhevmBasePath, importPath.replace("fhevm/", "")),
      path.resolve(fhevmBasePath, "lib", importPath),
      path.resolve(fhevmBasePath, "gateway", importPath),
      path.resolve(fhevmBasePath, importPath),
    ];

    // Try to resolve imports within the contracts directory
    const contractsPath = path.resolve(CONTRACTS_DIR, importPath);
    if (fs.existsSync(contractsPath)) {
      return { contents: fs.readFileSync(contractsPath, "utf8") };
    }

    for (const p of potentialPaths) {
      if (fs.existsSync(p)) {
        return { contents: fs.readFileSync(p, "utf8") };
      }
    }

    // Handle imports from node_modules or other relative paths
    if (importPath.startsWith("@") || importPath.startsWith("node_modules")) {
      fullPath = path.resolve(__dirname, "../node_modules", importPath);
    } else if (importPath.startsWith("./") || importPath.startsWith("../")) {
      fullPath = path.resolve(path.dirname(importPath), importPath);
    } else {
      fullPath = path.resolve(__dirname, importPath);
    }

    if (fs.existsSync(fullPath)) {
      return { contents: fs.readFileSync(fullPath, "utf8") };
    }

    logger.error(
      `Import file not found: ${importPath} at resolved paths: ${potentialPaths.join(", ")}, contractsPath: ${contractsPath}`,
    );
    throw new Error(`Import file not found: ${importPath}`);
  } catch (error) {
    return { error: error.message };
  }
}

// Compile the contract using the Solidity compiler
function compileContract(input) {
  const output = solc.compile(JSON.stringify(input), { import: findImports });
  return JSON.parse(output);
}

// Handle and log compilation errors, throw if any are critical
function handleCompilationErrors(errors) {
  errors.forEach((error) => {
    const message = `Solidity compilation ${error.severity}: ${error.formattedMessage}`;
    if (error.severity === "error") {
      throw new Error(message);
    } else {
      logger.warn(message);
    }
  });
}

// Extract the compiled contract's ABI and bytecode from the compiler output
function extractCompiledContract(output, contractName) {
  const contractKey = Object.keys(output.contracts[contractName])[0];
  return output.contracts[contractName][contractKey];
}

// Write the ABI of the compiled contract to a file
function writeABIToFile(contractName, abi) {
  ensureOutputDirExists();
  const abiPath = path.join(OUTPUT_DIR, `${contractName}.json`);
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
  logger.info(`ABI written to ${abiPath}`);
}

// Main function to compile a contract and return its compiled data
function getCompiledContract(contractPath) {
  try {
    if (typeof contractPath !== "string") {
      throw new Error(
        `Invalid contract path type: ${typeof contractPath}, value: ${JSON.stringify(contractPath)}`,
      );
    }

    logger.info(`Compiling contract at path: ${contractPath}`);

    const source = readContractSource(contractPath);
    const input = createCompilerInput(contractPath, source);
    const output = compileContract(input);

    if (output.errors) {
      handleCompilationErrors(output.errors);
    }

    const contractName = path.basename(contractPath);
    const compiledContract = extractCompiledContract(output, contractName);

    writeABIToFile(contractName, compiledContract.abi);

    return compiledContract;
  } catch (error) {
    logger.error(
      `Error compiling contract at ${contractPath}: ${error.message}`,
    );
    throw error;
  }
}

export default getCompiledContract;
