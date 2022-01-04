import { MnemonicKey } from "@terra-money/terra.js";
import { IWalletService } from "@serviceInterfaces/wallet/wallet.service.interface";
import { terraConnection } from "@connection/terra/terra.connection";
import WalletUtilities from "@utils/wallet/wallet.utils";
import logger from "@logger";
import * as bip39 from "bip39";
import * as crypto from "crypto";

export default class WalletService implements IWalletService {
  private walletUtilsInstance = new WalletUtilities();

  public createSeedPhrases(): string {
    const mnemonic = new MnemonicKey({
      mnemonic: bip39.entropyToMnemonic(crypto.randomBytes(16).toString("hex")),
    });
    logger.info("Successfully created new seed phrases.");
    return mnemonic.mnemonic;
  }

  public async createWallet(mnemonicKey: string): Promise<string> {
    const mk = new MnemonicKey({
      mnemonic: mnemonicKey,
    });
    const wallet = terraConnection.wallet(mk);
    const accAddress = wallet.key.accAddress;

    logger.info(
      `Successfully created a new wallet with address of: ${accAddress}`
    );

    // request an airdrop to perform transactions if current env is testnet
    if (process.env.BLOCKCHAIN_ENV == "testnet")
      //native tokens can be dropped: uluna, uusd, ueur, usdr, ukrw (need captcha)
      await this.walletUtilsInstance.claimTokens(accAddress, "uluna");

    return accAddress;
  }
}
