import { TAccountBalance } from "@models/wallet/wallet.model";

export interface IWalletService {
  createSeedPhrases(): string;
  createWallet(mnemonicKey: string): Promise<string>;
  getAccountBalance(
    address: string,
    terraContractAddresses: string[]
  ): Promise<TAccountBalance>;
}
