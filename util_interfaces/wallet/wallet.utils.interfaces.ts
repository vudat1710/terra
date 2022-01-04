export interface IWalletUtilities {
  claimTokens(address: string, denom: string): Promise<boolean>;
}
