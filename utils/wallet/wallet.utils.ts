import axios from "axios";
import { SITE_KEY, DENUMS_TO_TOKEN } from "@constants";
import logger from "@logger";
import { Response, NextFunction, Request } from "express";
import { IWalletUtilities } from "@utilInterfaces/wallet/wallet.utils.interface";
import { ValidationError } from "express-validation";

export default class WalletUtilities implements IWalletUtilities {
  public validateInput(
    err: any,
    _request: Request,
    response: Response,
    next: NextFunction
  ) {
    if (err instanceof ValidationError) {
      logger.error(err.details.body[0].message);
      return response.status(err.statusCode).json(err);
    }
    next();
  }

  public async claimTokens(address: string, denom: string): Promise<boolean> {
    try {
      const res = await axios.post(process.env.TERRA_FAUCET_CLAIM, {
        chain_id: process.env.TERRA_CHAIN_ID,
        lcd_url: process.env.TERRA_NODE_URL,
        address: address,
        denom: denom,
        response: SITE_KEY,
      });
      const { amount } = res.data;
      logger.info(
        `Successfully sent ${amount / 1000000} ${
          DENUMS_TO_TOKEN[denom]
        } to  ${address}.`
      );
      return true;
    } catch (err: any) {
      let errText: string;
      switch (err.response.status) {
        case 400:
          errText = "Invalid request";
          break;
        case 403:
          errText = "Too many requests";
          break;
        case 404:
          errText = "Cannot connect to server";
          break;
        case 502:
        case 503:
          errText = "Faucet service temporary unavailable";
          break;
        default:
          errText = err.response.data || err.message;
          break;
      }
      logger.error(
        `Failed to send tokens into ${address} with error message: ${errText}`
      );
      return false;
    }
  }
}
