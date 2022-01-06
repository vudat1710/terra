import { Request, Response } from "express";
import WalletService from "@services/wallet/wallet.service";
import {
  TAccountBalance,
  TErrorResponse,
  TTokenInfo,
} from "@models/wallet/wallet.model";

export default class WalletController {
  private walletServiceInstance: WalletService = new WalletService();

  public createSeedPhrases = async (_request: Request, response: Response) => {
    const mnemonicKey: string =
      await this.walletServiceInstance.createSeedPhrases();

    response.send({ data: mnemonicKey });
  };

  public createWallet = async (request: Request, response: Response) => {
    const { mnemonicKey } = request.body;
    const accAddress: string = await this.walletServiceInstance.createWallet(
      mnemonicKey
    );
    response.send({ data: accAddress });
  };

  public getAccountBalance = async (request: Request, response: Response) => {
    const { accAddress, terraContractAddresses } = request.body;
    const balance: TAccountBalance =
      await this.walletServiceInstance.getAccountBalance(
        accAddress,
        terraContractAddresses
      );
    response.send({ data: balance });
  };

  public getTokenInfo = async (request: Request, response: Response) => {
    const { contractAddress } = request.body;
    const tokenInfo: TTokenInfo | TErrorResponse =
      await this.walletServiceInstance.getTokenInfo(contractAddress);
    response.send({ data: tokenInfo });
  };

  public transferNativeToken = async (request: Request, response: Response) => {
    const { recipientAddress, amount } = request.body;
    const result = await this.walletServiceInstance.transferNativeToken(
      recipientAddress,
      amount
    );
    response.send({ data: result });
  };

  public transferCW20Token = async (request: Request, response: Response) => {
    const { recipientAddress, contractAddress, amount } = request.body;
    const result = await this.walletServiceInstance.transferCW20Token(
      recipientAddress,
      contractAddress,
      amount
    );
    response.send({ data: result });
  };
}
