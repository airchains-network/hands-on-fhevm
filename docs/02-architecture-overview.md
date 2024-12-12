# fhEVM Architecture Overview

The Fully Homomorphic Encryption Virtual Machine (fhEVM) ensures privacy-preserving computations on blockchain networks. Its architecture combines cryptographic principles with blockchain infrastructure to handle encrypted data without ever exposing the plaintext.

---

## Core Components

The architecture consists of several interdependent components:

- **Smart Contracts**: Interact with encrypted data to execute logic securely on the blockchain.
- **Coprocessor**: A specialized off-chain processing unit that handles homomorphic computations on ciphertexts using evaluation keys.
- **Key Management System (KMS)**: Safeguards private keys for decryption and re-encryption processes.
- **Gateway**: Acts as a bridge between the blockchain and the KMS, enabling secure operations like decryption and re-encryption.
- **fhEVM.js Library**: Facilitates client-side interactions such as encryption, decryption, and re-encryption.

---

## Key Cryptographic Processes

### Encryption

- **Purpose**: Secure plaintext data before submission to the blockchain.
- **Workflow**:
  1. User-provided data is encrypted using the public key, either on the frontend or within smart contracts.
  2. Encrypted data (ciphertext) is stored or processed on-chain.
- **Data Flow**: From user applications → Blockchain/Coprocessor.

### Computation

- **Purpose**: Perform arithmetic or logical operations directly on ciphertexts without decryption.
- **Workflow**:
  1. The blockchain triggers computations symbolically through smart contracts.
  2. The coprocessor performs encrypted computations using evaluation keys.
  3. Updated ciphertexts are returned to the blockchain.
- **Data Flow**: Blockchain smart contracts → Coprocessor → Blockchain.

### Decryption

- **Purpose**: Retrieve plaintext results when necessary.
- **Workflow**:
  1. The Gateway requests decryption from the KMS, which holds private keys.
  2. Results are sent back securely to smart contracts or dApps.
- **Data Flow**: Blockchain → KMS (via Gateway) → Smart Contract/User.

### Re-encryption

- **Purpose**: Enable data reuse under different keys without revealing plaintext.
- **Workflow**:
  1. The Gateway coordinates with the KMS to re-encrypt data for a new recipient’s public key.
  2. The re-encrypted ciphertext is sent to the recipient, maintaining privacy.
- **Data Flow**: Blockchain/dApp → Gateway → KMS → Target Entity.

---

## End-to-End Confidentiality

By combining these processes, fhEVM ensures that:

- Plaintext data is never exposed during processing or transmission.
- Homomorphic computations enable complex operations on encrypted data.
- Secure mechanisms like re-encryption allow sharing and interoperability without compromising privacy.

This tightly integrated architecture supports decentralized applications (dApps) that require privacy-preserving operations, paving the way for more secure and trustless systems.
For more detailed insights, you can refer to the original documentation provided by Zama (https://docs.zama.ai/fhevm).


## What's Next?

With your understanding of the fhevm architecture, you're ready to start preparation of setup to write contracts. Move on to the **[Preparation](03-Preparation.md)** section to learn how to configure and run the project.
