import solc from "solc";
import fs from "fs";
import path from "path";
import logger from "../utils/logger.js";

const OUTPUT_DIR = path.resolve(process.cwd(), "build");
const CONTRACTS_DIR = path.resolve(process.cwd(), "contracts");

// Ensure the output directory exists
function ensureOutputDirExists() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

// Read the source code of the contract from the file
function readContractSource(relativePath) {
  const contractPath = path.resolve(CONTRACTS_DIR, relativePath);
  if (!fs.existsSync(contractPath)) {
    throw new Error(`Contract file not found: ${relativePath}`);
  }
  return fs.readFileSync(contractPath, "utf8");
}

// Create the input format required by the Solidity compiler
function createCompilerInput(relativePath, source) {
  return {
    language: "Solidity",
    sources: {
      [relativePath]: {
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

// Custom import handler for Solidity compiler to resolve imports
function findImports(importPath) {
  try {
    let fullPath = path.resolve(CONTRACTS_DIR, importPath);
    if (fs.existsSync(fullPath)) {
      return { contents: fs.readFileSync(fullPath, "utf8") };
    }
    fullPath = path.resolve(process.cwd(), "node_modules", importPath);
    if (fs.existsSync(fullPath)) {
      return { contents: fs.readFileSync(fullPath, "utf8") };
    }
    logger.error(`Import file not found: ${importPath}`);
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

// Handle compilation errors, ignore warnings
function handleCompilationErrors(errors) {
  errors.forEach((error) => {
    if (error.severity === "error") {
      throw new Error(`Solidity compilation error: ${error.formattedMessage}`);
    }
  });
}

// Extract the compiled contract's ABI and bytecode
function extractCompiledContract(output, relativePath) {
  const contractName = Object.keys(output.contracts[relativePath])[0];
  return output.contracts[relativePath][contractName];
}

// Write the ABI to a file
function writeABIToFile(relativePath, abi) {
  ensureOutputDirExists();
  const abiPath = path.join(
    OUTPUT_DIR,
    `${path.basename(relativePath, ".sol")}.json`,
  );
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
  logger.info(`ABI written to ${abiPath}`);
}

// Compile a contract by relative path from the contracts directory
export async function getCompiledContract(relativePath) {
  try {
    logger.info(`Compiling contract: ${relativePath}`);
    const source = readContractSource(relativePath);
    const input = createCompilerInput(relativePath, source);
    const output = compileContract(input);

    logger.debug(`Compilation Output: ${JSON.stringify(output, null, 2)}`);

    if (output.errors) {
      handleCompilationErrors(output.errors);
    }

    const compiledContract = extractCompiledContract(output, relativePath);

    if (!compiledContract.evm || !compiledContract.evm.bytecode) {
      throw new Error(
        `Bytecode is missing in compiled output for ${relativePath}`,
      );
    }

    writeABIToFile(relativePath, compiledContract.abi);
    return compiledContract;
  } catch (error) {
    logger.error(`Error compiling contract ${relativePath}: ${error.message}`);
    throw error;
  }
}
