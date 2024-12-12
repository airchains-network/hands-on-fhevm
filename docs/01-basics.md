# Basics of fhEVM

fhEVM enables confidential smart contracts on EVM-compatible blockchains using Fully Homomorphic Encryption (FHE). It ensures data privacy while maintaining usability and interoperability.

## Core Principles

1. **Security**: No compromise on blockchain security.
2. **Public Verifiability**: Confidential yet verifiable computations.
3. **Developer-Friendly**: Familiar Solidity tools.
4. **Composability**: Interoperable confidential and public contracts.

## Key Features

### Encrypted Data Types
- **Booleans**: `ebool`
- **Integers**: `euint4`, `euint8`, ... `euint256`
- **Addresses**: `eaddress`
- **Bytes**: `ebytes64`, `ebytes128`, `ebytes256`
- **Inputs**: `einput`

### Type Casting
- Convert between encrypted types: `TFHE.asEbool`, `TFHE.asEuintX`, `TFHE.asEaddress`, etc.

fhEVM empowers secure and efficient computation on encrypted data while preserving blockchain functionality.

