import { mnemonicToSeedSync } from "bip39";
import { hdkey } from "@ethereumjs/wallet";

export function deriveAddressesFromMnemonic(mnemonic, count = 10) {
  const seed = mnemonicToSeedSync(mnemonic);
  const hdWallet = hdkey.EthereumHDKey.fromMasterSeed(seed);

  const addresses = [];
  for (let i = 0; i < count; i++) {
    const child = hdWallet.derivePath(`m/44'/60'/0'/0/${i}`).getWallet();
    addresses.push(child.getAddressString());
  }
  return addresses;
}

export function deriveWalletsAndDetails(mnemonic) {
  const seed = mnemonicToSeedSync(mnemonic);
  const hdWallet = hdkey.EthereumHDKey.fromMasterSeed(seed);

  const wallets = [
    hdWallet.derivePath(`m/44'/60'/0'/0/0`).getWallet(),
    hdWallet.derivePath(`m/44'/60'/0'/0/1`).getWallet(),
    hdWallet.derivePath(`m/44'/60'/0'/0/2`).getWallet(),
    hdWallet.derivePath(`m/44'/60'/0'/0/3`).getWallet(),
  ];

  const [coreWallet, gatewayWallet, relayerWallet, testWallet] = wallets;
  const privateKeyCore = coreWallet.getPrivateKeyString();
  const privateKeyGateway = gatewayWallet.getPrivateKeyString();
  const privateKeyRelayer = relayerWallet.getPrivateKeyString();
  const privateKeyTest = testWallet.getPrivateKeyString();

  return {
    deployerAddressCore: coreWallet.getAddressString(),
    privateKeyCore,
    deployerAddressGateway: gatewayWallet.getAddressString(),
    privateKeyGateway,
    privateKeyRelayer,
    deployerAddressTest: testWallet.getAddressString(),
    privateKeyTest,
  };
}
