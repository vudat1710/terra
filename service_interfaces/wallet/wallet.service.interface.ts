import {
  TAccountBalance,
  TTokenInfo,
  TErrorResponse,
} from "@models/wallet/wallet.model";

export interface IWalletService {
  createSeedPhrases(): string;
  createWallet(mnemonicKey: string): Promise<string>;
  getAccountBalance(
    address: string,
    terraContractAddresses: string[]
  ): Promise<TAccountBalance>;
  getTokenInfo(contractAddress: string): Promise<TTokenInfo | TErrorResponse>;
  transferNativeToken(
    recipientAddress: string,
    amount: { [key: string]: string },
    memo?: string
  ): Promise<string>;
  transferCW20Token(
    recipientAddress: string,
    contractAddress: string,
    amount: string
  ): Promise<string>;
}
