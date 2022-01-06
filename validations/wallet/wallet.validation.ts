import { Joi, validate } from "express-validation";
import { Request, Response, NextFunction } from "express";
import WalletUtilities from "@utils/wallet/wallet.utils";
import { DENUMS_TO_TOKEN } from "@constants";
import * as bip39 from "bip39";

const walletUtilitiesInstance = new WalletUtilities();
const denomsList = Object.keys(DENUMS_TO_TOKEN);

export const validateWalletCreationParams = [
  validate(
    {
      body: Joi.object().keys({
        mnemonicKey: Joi.string()
          .custom((v, helper) => {
            if (!bip39.validateMnemonic(v)) {
              return helper.message({ custom: "Invalid seed phrases" });
            }
            return true;
          })
          .required(),
      }),
    },
    {},
    {}
  ),
  (err: any, request: Request, response: Response, next: NextFunction) => {
    walletUtilitiesInstance.validateInput(err, request, response, next);
  },
];

export const validateGetAccountBalance = [
  validate(
    {
      body: Joi.object().keys({
        accAddress: Joi.string().required(),
        terraContractAddresses: Joi.array().required(),
      }),
    },
    {},
    {}
  ),
  (err: any, request: Request, response: Response, next: NextFunction) => {
    walletUtilitiesInstance.validateInput(err, request, response, next);
  },
];

export const validateGetTokenInfo = [
  validate(
    {
      body: Joi.object().keys({
        contractAddress: Joi.string().required(),
      }),
    },
    {},
    {}
  ),
  (err: any, request: Request, response: Response, next: NextFunction) => {
    walletUtilitiesInstance.validateInput(err, request, response, next);
  },
];

export const validateTransferNativeTokenParams = [
  validate(
    {
      body: Joi.object().keys({
        recipientAddress: Joi.string().required(),
        memo: Joi.string(),
        amount: Joi.object().custom((v: { [key: string]: string }, helper) => {
          const keys: string[] = Object.keys(v);
          for (let i = 0; i < keys.length; i++) {
            if (!denomsList.includes(Object.keys(v)[i])) {
              return helper.message({
                custom: "Token not in native token list.",
              });
            }
          }
          return true;
        }),
      }),
    },
    {},
    {}
  ),
  (err: any, request: Request, response: Response, next: NextFunction) => {
    walletUtilitiesInstance.validateInput(err, request, response, next);
  },
];

export const validateTransferCW20TokenParams = [
  validate(
    {
      body: Joi.object().keys({
        recipientAddress: Joi.string().required(),
        contractAddress: Joi.string().required(),
        amount: Joi.string().required(),
      }),
    },
    {},
    {}
  ),
  (err: any, request: Request, response: Response, next: NextFunction) => {
    walletUtilitiesInstance.validateInput(err, request, response, next);
  },
];
