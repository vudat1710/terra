import axios from "axios";
import {
  SITE_KEY,
  DENUMS_TO_TOKEN,
  ALICE_MNEMONIC,
  TRANSACTION_HIST_API,
} from "@constants";
import logger from "@logger";
import { Response, NextFunction, Request } from "express";
import {
  Coins,
  MsgSend,
  MnemonicKey,
  MsgExecuteContract,
} from "@terra-money/terra.js";
import { IWalletUtilities } from "@utilInterfaces/wallet/wallet.utils.interface";
import { ValidationError } from "express-validation";
import { coingeckoAPI } from "@connection/gecko/coin.gecko";
import { TTokenInfoResponse, TCW20BalanceResponse } from "./terra.response";
import {
  TNativeBalance,
  TMarketInfo,
  TCW20Balance,
  TTokenInfo,
  TErrorResponse,
} from "@models/wallet/wallet.model";
import * as fs from "fs";
import { WalletError } from "@errors/wallet.error";
import { terraConnection } from "@connection/terra/terra.connection";
require("dotenv").config();

const cw20Tokens = JSON.parse(fs.readFileSync(".\\tokens.json", "utf8"));
const cw20TokensInstance =
  process.env.BLOCKCHAIN_ENV === "testnet"
    ? cw20Tokens.testnet
    : cw20Tokens.mainnet;
export default class WalletUtilities implements IWalletUtilities {
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
      const balance = await terraConnection.bank.balance(address);
      const coinList: Coins = balance[0];

      const paginationParams = balance[1];

      return {
        coins: coinList.toData().map((m) => {
          return {
            name: DENUMS_TO_TOKEN[m.denom],
            denom: m.denom,
            amount: m.amount,
            decimals: 6,
          };
        }),
        nextKey: paginationParams.next_key,
        total: paginationParams.total,
      };
    } catch (_err: any) {
      const logMessage: string = _err.response.data.message;
      logger.error(logMessage);
      throw new WalletError(_err.response.status, logMessage);
    }
  };

  public getCW20TokenBalance = async (
    walletAddress: string,
    contractAddresses: string[]
  ): Promise<TCW20Balance> => {
    const result: TCW20Balance = [];
    const promises = [];
    contractAddresses.forEach((address: string) =>
      promises.push(
        terraConnection.wasm.contractQuery(address, {
          balance: { address: walletAddress },
        })
      )
    );
    return Promise.all(promises)
      .then((res: TCW20BalanceResponse[]) => {
        for (let i = 0; i < res.length; i++) {
          result.push({
            name: cw20TokensInstance[contractAddresses[i]].name,
            denom: cw20TokensInstance[contractAddresses[i]].symbol,
            amount: res[i].balance,
            decimals: cw20TokensInstance[contractAddresses[i]].decimals,
          });
        }
        return result;
      })
      .catch((_err: any) => {
        const logMessage: string = _err.response.data.message;
        logger.error(logMessage);
        throw new WalletError(_err.response.status, logMessage);
      });
  };

  public getHoldingCoins = (
    nativeBalance: TNativeBalance,
    cw20Balance: TCW20Balance
  ): Array<{ denom: string; name: string }> => {
    let holdingCoins = nativeBalance.coins.map((x) => ({
      denom: x.denom,
      name: x.name,
    }));
    holdingCoins.push(
      ...cw20Balance
        .filter((x) => x.amount !== "0")
        .map((x) => ({ denom: x.denom, name: x.name }))
    );
    return holdingCoins;
  };

  public createWallet = async (mnemonicKey: string): Promise<string> => {
    try {
      const mk = new MnemonicKey({
        mnemonic: mnemonicKey,
      });
      const wallet = terraConnection.wallet(mk);

      const accAddress = wallet.key.accAddress;

      return accAddress;
    } catch (_err: any) {
      const loggerMessage: string = _err.response.data.message;
      logger.error(loggerMessage);
      throw new WalletError(_err.response.status, loggerMessage);
    }
  };

  public getTokenInfo = async (
    contractAddress: string
  ): Promise<TTokenInfo | TErrorResponse> => {
    try {
      const tokenInfo: TTokenInfoResponse =
        await terraConnection.wasm.contractQuery(contractAddress, {
          token_info: {},
        });

      return {
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        totalSupply: tokenInfo.total_supply,
      };
    } catch (err: any) {
      const loggerMessage = err.response.data.message;
      logger.error(loggerMessage);
      throw new WalletError(err.response.status, loggerMessage);
    }
  };

  // perform on ALICE
  public transferNativeToken = async (
    recipientAddress: string,
    amount: { [key: string]: number },
    memo?: string
  ): Promise<string> => {
    try {
      const alice = terraConnection.wallet(
        new MnemonicKey({ mnemonic: ALICE_MNEMONIC })
      );
      if (alice.key.accAddress === recipientAddress) {
        throw new WalletError(
          400,
          "Sender and recipient addresses should not be the same"
        );
      }
      const send = new MsgSend(alice.key.accAddress, recipientAddress, amount);
      const tx = await alice.createAndSignTx({
        msgs: [send],
        memo: memo ? memo : "",
      });
      const result = await terraConnection.tx.broadcast(tx);
      // console.log(alice)

      return result.txhash;
    } catch (err: any) {
      const loggerMessage: string = err.response.data.message;
      logger.error(loggerMessage);
      throw new WalletError(err.response.status, loggerMessage);
    }
  };

  public addCW20Token = async (
    contractAddress: string,
    amount: number
  ): Promise<string> => {
    try {
      const alice = terraConnection.wallet(
        new MnemonicKey({ mnemonic: ALICE_MNEMONIC })
      );
      const execute = new MsgExecuteContract(
        alice.key.accAddress,
        contractAddress,
        {
          mint: { recipient: alice.key.accAddress, amount: amount },
        }
      );
      const sequence = (
        await terraConnection.auth.accountInfo(alice.key.accAddress)
      ).getSequenceNumber();
      const tx = await alice.createAndSignTx({
        msgs: [execute],
        sequence: sequence,
      });
      const result = await terraConnection.tx.broadcast(tx);

      return result.txhash;
    } catch (err: any) {
      const loggerMessage: string = err.response.data.message;
      logger.error(loggerMessage);
      throw new WalletError(err.response.status, loggerMessage);
    }
  };

  public transferCW20Token = async (
    recipientAddress: string,
    contractAddress: string,
    amount: number
  ): Promise<string> => {
    try {
      const alice = terraConnection.wallet(
        new MnemonicKey({ mnemonic: ALICE_MNEMONIC })
      );
      if (alice.key.accAddress === recipientAddress) {
        throw new WalletError(
          400,
          "Sender and recipient addresses should not be the same"
        );
      }
      const execute = new MsgExecuteContract(
        alice.key.accAddress,
        contractAddress,
        {
          transfer: { recipient: recipientAddress, amount: amount },
        }
      );
      const sequence = (
        await terraConnection.auth.accountInfo(alice.key.accAddress)
      ).getSequenceNumber();
      const tx = await alice.createAndSignTx({
        msgs: [execute],
        sequence: sequence,
      });
      const result = await terraConnection.tx.broadcast(tx);

      return result.txhash;
    } catch (err: any) {
      const loggerMessage: string = err.response.data.message;
      logger.error(loggerMessage);
      throw new WalletError(err.response.status, loggerMessage);
    }
  };

  public getTransactionHistory = async (
    offset: string,
    limit: string,
    account: string
  ): Promise<any> => {
    try {
      const result = await axios.get(TRANSACTION_HIST_API, {
        params: { offset: offset, limit: limit, account: account },
      });
      // console.log(result)
      return result.data;
    } catch (err: any) {
      // console.log(err)
      const loggerMessage: string = err.response.data.message;
      logger.error(loggerMessage);
      throw new WalletError(err.response.status, loggerMessage);
    }
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
