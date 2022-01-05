import axios from "axios";
import { SITE_KEY, DENUMS_TO_TOKEN } from "@constants";
import logger from "@logger";
import { Response, NextFunction, Request } from "express";
import { Coins, LCDClient } from "@terra-money/terra.js";
import { IWalletUtilities } from "@utilInterfaces/wallet/wallet.utils.interface";
import { ValidationError } from "express-validation";
import { coingeckoAPI } from "@connection/gecko/coin.gecko";
import {
  TNativeBalance,
  TMarketInfo,
  TCW20Balance,
} from "@models/wallet/wallet.model";
import { cw20Tokens } from "@data/cw20/tokens";
require("dotenv").config();

const cw20TokensInstance =
  process.env.BLOCKCHAIN_ENV === "testnet"
    ? cw20Tokens.testnet
    : cw20Tokens.mainnet;
export default class WalletUtilities implements IWalletUtilities {
  private terra = new LCDClient({
    URL: process.env.TERRA_NODE_URL,
    chainID: process.env.TERRA_CHAIN_ID,
  });
  public validateInput = (
    err: any,
    _request: Request,
    response: Response,
    next: NextFunction
  ) => {
    if (err instanceof ValidationError) {
      logger.error(err.details.body[0].message);
      return response.status(err.statusCode).json(err);
    }
    next();
  };

  public getUSDTRatioByToken = async (
    tokenId: string
  ): Promise<TMarketInfo> => {
    try {
      const response = await axios.get(`${coingeckoAPI}/${tokenId}`);
      const tokenMarketInfo = response.data;
      return {
        currentUSDPrice: tokenMarketInfo.market_data.current_price.usd,
        marketcapRank: tokenMarketInfo.market_cap_rank,
      };
    } catch (err: any) {
      return {
        currentUSDPrice: 0,
        marketcapRank: 0,
      };
    }
  };

  public getNativeBalance = async (
    address: string
  ): Promise<TNativeBalance> => {
    try {
      const balance = await this.terra.bank.balance(address);
      const coinList: Coins = balance[0];

      const paginationParams = balance[1];

      return {
        coins: coinList.toData().map((m) => {
          return {
            name: DENUMS_TO_TOKEN[m.denom],
            denom: m.denom,
            amount: m.amount,
            decimals: 6
          };
        }),
        nextKey: paginationParams.next_key,
        total: paginationParams.total,
      };
    } catch (_err: any) {
      logger.error("Invalid address.");
      return {
        coins: [],
        nextKey: "",
        total: 0,
      };
    }
  };

  public getCW20TokenBalance = async (
    walletAddress: string,
    contractAddresses: string[]
  ): Promise<TCW20Balance> => {
    let result: TCW20Balance = [];
    const promises = [];
    contractAddresses.forEach((address: string) =>
      promises.push(
        this.terra.wasm.contractQuery(address, {
          balance: { address: walletAddress },
        })
      )
    );
    return Promise.all(promises)
      .then((res) => {
        const r = [];
        for (let i = 0; i < res.length; i++) {
          r.push({
            name: cw20TokensInstance[contractAddresses[i]].name,
            denom: cw20TokensInstance[contractAddresses[i]].symbol,
            amount: res[i].balance,
          });
        }

        result = r;
        return result;
      })
      .catch((_err: any) => {
        logger.error("Error happened when fetching cw20 balance.");
        return result;
      });
  };

  public claimTokens = async (
    address: string,
    denom: string
  ): Promise<boolean> => {
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
  };
}
