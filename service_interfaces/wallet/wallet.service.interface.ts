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
    amount: { [key: string]: number },
    memo?: string
  ): Promise<string>;
  transferCW20Token(
    recipientAddress: string,
    contractAddress: string,
    amount: number
  ): Promise<string>;
  addCW20Token(contractAddress: string, amount: number): Promise<string>;
  getTransactionHistory(
    offset: string,
    limit: string,
    account: string
  ): Promise<any>;
}
