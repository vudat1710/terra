import { Request, Response } from "express";
import WalletService from "@services/wallet";

export default class WalletController {
  private walletServiceInstance: WalletService = new WalletService();

  public async createSeedPhrases(request: Request, response: Response) {
    const mnemonicKey: string = this.walletServiceInstance.createSeedPhrases();

    response.send({ data: mnemonicKey });
  }

  public async createWallet(request: Request, response: Response) {
    const { mnemonicKey } = request.body;
    const accAddress: string = await this.walletServiceInstance.createWallet(
      mnemonicKey
    );
    response.send({ data: accAddress });
  }
}
