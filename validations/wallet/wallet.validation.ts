import { Joi, validate } from "express-validation";
import { Request, Response, NextFunction } from "express";
import WalletUtilities from "@utils/wallet/wallet.utils";
import * as bip39 from "bip39";

const walletUtilitiesInstance = new WalletUtilities();

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
