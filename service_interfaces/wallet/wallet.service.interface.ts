export interface IWalletService {
  createSeedPhrases(): string;
  createWallet(mnemonicKey: string): Promise<string>;
}
