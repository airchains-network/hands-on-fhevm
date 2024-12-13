import { mnemonicToSeedSync } from "bip39";
import { hdkey } from "@ethereumjs/wallet";

export function deriveWalletsAndDetails(mnemonic) {
  const seed = mnemonicToSeedSync(mnemonic);
  const hdWallet = hdkey.EthereumHDKey.fromMasterSeed(seed);

  const wallets = [
    hdWallet.derivePath(`m/44'/60'/0'/0/0`).getWallet(),
    hdWallet.derivePath(`m/44'/60'/0'/0/1`).getWallet(),
    hdWallet.derivePath(`m/44'/60'/0'/0/2`).getWallet(),
  ];

  const [walletCore, walletGateway, walletSampleTransfer] = wallets;

  const deployerAddressCore = walletCore.getAddressString();
  const deployerAddressGateway = walletGateway.getAddressString();
  const deployerAddressSampleTransfer = walletSampleTransfer.getAddressString();
  const privateKeyCore = walletCore.getPrivateKeyString();
  const privateKeyGateway = walletGateway.getPrivateKeyString();
  const privateKeySampleTransfer = walletSampleTransfer.getPrivateKeyString();

  return {
    walletCore,
    walletGateway,
    walletSampleTransfer,
    deployerAddressCore,
    deployerAddressGateway,
    deployerAddressSampleTransfer,
    privateKeyCore,
    privateKeyGateway,
    privateKeySampleTransfer,
  };
}
