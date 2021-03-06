import { NextFunction, Request, Response } from "express";
import {
  TNativeBalance,
  TMarketInfo,
  TCW20Balance,
  TTokenInfo,
  TErrorResponse,
} from "@models/wallet/wallet.model";
export interface IWalletUtilities {
  claimTokens(address: string, denom: string): Promise<boolean>;
  validateInput(
    err: any,
    request: Request,
    response: Response,
    next: NextFunction
  ): void;
  getNativeBalance(
    address: string,
    nextKey?: string,
    limit?: number
  ): Promise<TNativeBalance>;
  getUSDTRatioByToken(tokenId: string): Promise<TMarketInfo>;
  getCW20TokenBalance(
    walletAddress: string,
    contractAddresses: string[]
  ): Promise<TCW20Balance>;
  getHoldingCoins(
    nativeBalance: TNativeBalance,
    cw20Balance: TCW20Balance
  ): Array<{ denom: string; name: string }>;
  createWallet(mnemonicKey: string): Promise<string>;
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
