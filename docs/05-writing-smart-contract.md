# Writing Smart Contracts for the FHEVM

The FHEVM environment enables Fully Homomorphic Encryption (FHE) computations directly on encrypted data within Ethereum-like smart contracts. This means that the contract can store, process, and manipulate data in ciphertext form without ever exposing the underlying cleartext values. As a result, developers can build decentralized applications that protect user privacy on a public blockchain.

---

## Quick Start: EncryptedERC20 Contract

This contract implements an encrypted ERC20 token using Fully Homomorphic Encryption (FHE). It supports minting, transfers, approvals, and balance decryption via the TFHE library.

---

## Core Components

### Imports

The contract uses the following dependencies:
- **TFHE Library**: Provides FHE-related operations.
- **OpenZeppelin's Ownable2Step**: For ownership and access control.
- **GatewayCaller**: Manages decryption requests and callbacks.

```solidity
import "fhevm/lib/TFHE.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "fhevm/gateway/GatewayCaller.sol";
```

---

### Casting Encrypted Types

Before diving into the variables and mappings, it's important to understand how encrypted types are handled in the contract. The TFHE library allows seamless casting between encrypted and unencrypted types, as well as conversions between encrypted types of different precisions.

#### Casting Methods

- **`TFHE.asEuintXX()`**: Converts an unsigned integer into an encrypted unsigned integer (e.g., `euint64`, `euint32`, etc.).
- **`TFHE.asEbool()`**: Converts a boolean into an encrypted boolean (`ebool`).
- **`TFHE.asEaddress()`**: Converts an address into an encrypted address (`eaddress`).

These methods are essential for managing encrypted balances and conditions in a privacy-preserving way. You’ll see them frequently in the logic of functions for mint, allowances, and token transfers throughout the contract.

---

### Variables and Mappings

```solidity
uint64 private decrypted_balance;
euint64 private encrypted_balance;
uint64 private _totalSupply;
string private _name;
string private _symbol;
uint8 public constant decimals = 6;

mapping(address => uint64) public decrypted_balance_map;
mapping(address => euint64) internal balances;
mapping(address => mapping(address => euint64)) internal allowances;
```

---

### Constructor

The constructor initializes the token contract with the provided name and symbol while setting the ownership to the deployer's address. This is similar to how constructors are defined in standard Solidity contracts, particularly how the token is initialized in ERC-20 contracts.

```solidity
constructor(string memory name_, string memory symbol_) Ownable(msg.sender) {
    _name = name_;
    _symbol = symbol_;
}
```

---

### Functions

The functions in this contract follow the same principles as normal Solidity functions for minting, transferring, and approving tokens. The key difference is that the variables involved in these operations are converted into encrypted types to ensure confidentiality. Additionally, the `TFHE.allow` function is used to grant access permissions, which is essential for working with encrypted data.

#### Mint Function

The `mint` function allows the owner to mint new tokens and add them to their balance.

```solidity
function mint(uint64 mintedAmount) public virtual onlyOwner {
    balances[owner()] = TFHE.add(balances[owner()], mintedAmount);
    TFHE.allow(balances[owner()], address(this));
    _totalSupply = _totalSupply + mintedAmount;
    emit Mint(owner(), mintedAmount);
}
```

#### Transfer Functions

This function allows for the transfer of an encrypted amount from the sender to the recipient. The `einput` refers to the index of the encrypted parameter, representing a specific encrypted input handle, while `bytes` contains the ciphertext and the proof used for validation.

```solidity
function transfer(address to, einput encryptedAmount, bytes calldata inputProof) public virtual returns (bool) {
    transfer(to, TFHE.asEuint64(encryptedAmount, inputProof));
    return true;
}

function transfer(address to, euint64 amount) public virtual returns (bool) {
    require(TFHE.isSenderAllowed(amount));
    ebool canTransfer = TFHE.le(amount, balances[msg.sender]);
    _transfer(msg.sender, to, amount, canTransfer);
    return true;
}
```

#### Allowance Function

The allowance function works similarly to standard allowance functions which is used to manage permissions for transferring encrypted tokens on behalf of another address.

```solidity
function allow(address spender, einput encryptedAmount, bytes calldata inputProof) public virtual returns (bool) {
    allow(spender, TFHE.asEuint64(encryptedAmount, inputProof));
    return true;
}

function allow(address spender, euint64 amount) public virtual returns (bool) {
    require(TFHE.isSenderAllowed(amount));
    allowances[msg.sender][spender] = amount;
    return true;
}
```

---

### Decryption

Decryption involves converting encrypted data into plaintext when required for contract logic or user verification. Since decryption is an asynchronous process, it involves interaction with the Gateway and the Key Management System (KMS).

```solidity
contract EncryptedERC20 is Ownable2Step, GatewayCaller {}
```

#### Decryption Process Breakdown

1. **Requesting Decryption**: The contract requests the Gateway to decrypt ciphertexts stored in the contract.
2. **KMS Interaction**: Upon receiving the decryption request, the Gateway interacts with the KMS to decrypt the ciphertext.
3. **Receiving Decrypted Data**: The plaintext data is then sent back to the smart contract via a callback function, which updates the relevant state variables with the decrypted values.

```solidity
function requestDecryptedBalanceOf(address wallet) public virtual {
    encrypted_balance = balances[wallet];
    uint256;
    cts[0] = Gateway.toUint256(encrypted_balance);
    uint256 requestID = Gateway.requestDecryption(cts, this.callbackDecryptedBalanceOf.selector, 0, block.timestamp + 100, false);
    addParamsAddress(requestID, wallet);
}

// Callback function to handle the decrypted balance returned by the Gateway.
function callbackDecryptedBalanceOf(uint256 requestID, uint32 decryptedInput) public onlyGateway returns (uint64) {
    address[] memory params = getParamsAddress(requestID);
    unchecked {
        address wallet_address = params[0];
        uint64 decryptedBalance = decryptedInput;
        decrypted_balance_map[wallet_address] = decryptedBalance;
        return decryptedBalance;
    }
}
```

View the complete contract here: [Link]
