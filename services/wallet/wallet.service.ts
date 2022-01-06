import { MnemonicKey } from "@terra-money/terra.js";
import { IWalletService } from "@serviceInterfaces/wallet/wallet.service.interface";
import {
  TAccountBalance,
  TCW20Balance,
  TErrorResponse,
  TNativeBalance,
  TTokenInfo,
} from "@models/wallet/wallet.model";
import WalletUtilities from "@utils/wallet/wallet.utils";
import logger from "@logger";
import * as bip39 from "bip39";
import * as crypto from "crypto";

export default class WalletService implements IWalletService {
  private walletUtilsInstance = new WalletUtilities();

  public createSeedPhrases = (): string => {
    const mnemonic = new MnemonicKey({
      mnemonic: bip39.entropyToMnemonic(crypto.randomBytes(16).toString("hex")),
    });
    logger.info("Successfully created new seed phrases.");
    return mnemonic.mnemonic;
  };

  public createWallet = async (mnemonicKey: string): Promise<string> => {
    const accAddress = await this.walletUtilsInstance.createWallet(mnemonicKey);

    logger.info(
      `Successfully created a new wallet with address of: ${accAddress}`
    );

    // request an airdrop to perform transactions if current env is testnet
    if (process.env.BLOCKCHAIN_ENV == "testnet")
      //native tokens can be dropped: uluna, uusd, ueur, usdr, ukrw (need captcha)
      await this.walletUtilsInstance.claimTokens(accAddress, "uluna");

    return accAddress;
  };

  public getAccountBalance = async (
    address: string,
    terraContractAddresses: string[]
  ): Promise<TAccountBalance> => {
    const nativeBalance: TNativeBalance =
      await this.walletUtilsInstance.getNativeBalance(address);
    const cw20Balance: TCW20Balance =
      await this.walletUtilsInstance.getCW20TokenBalance(
        address,
        terraContractAddresses
      );
    const ratioToUsd = await this.walletUtilsInstance.getUSDTRatioByToken(
      "terra-luna"
    );
    const holdingCoins = this.walletUtilsInstance.getHoldingCoins(
      nativeBalance,
      cw20Balance
    );

    logger.info(`Queried account balance of address: ${address}`);

    return {
      native: nativeBalance.coins,
      cw20: cw20Balance,
      usdRatio: `${ratioToUsd.currentUSDPrice} USD/1 LUNA`,
      holdingCoins: holdingCoins,
    };
  };

  public getTokenInfo = async (
    contractAddress: string
  ): Promise<TTokenInfo | TErrorResponse> => {
    const tokenInfo: TTokenInfo | TErrorResponse =
      await this.walletUtilsInstance.getTokenInfo(contractAddress);

    logger.info(`Queried token info of contract address: ${contractAddress}`);

    return tokenInfo;
  };
}
