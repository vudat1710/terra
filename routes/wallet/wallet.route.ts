import { Router } from "express";
import WalletController from "@controllers/wallet/wallet.controller";
import { asyncWrap } from "@utils/async_wrap";
import {
  validateWalletCreationParams,
  validateTransferNativeTokenParams,
  validateGetTokenInfo,
  validateGetAccountBalance,
  validateTransferCW20TokenParams,
  validateAddCW20TokenParams,
  validateGetTransactionHistoryParams,
} from "@validations/wallet/wallet.validation";

const router = Router();
const walletControllerInstance = new WalletController();
router.get(
  "/createseedphrases",
  asyncWrap(
    walletControllerInstance.createSeedPhrases.bind(walletControllerInstance)
  )
);
router.post(
  "/createwallet",
  validateWalletCreationParams,
  asyncWrap(
    walletControllerInstance.createWallet.bind(walletControllerInstance)
  )
);
router.post(
  "/getbalance",
  validateGetAccountBalance,
  asyncWrap(
    walletControllerInstance.getAccountBalance.bind(walletControllerInstance)
  )
);
router.post(
  "/gettokeninfo",
  validateGetTokenInfo,
  asyncWrap(
    walletControllerInstance.getTokenInfo.bind(walletControllerInstance)
  )
);
router.post(
  "/transfernative",
  validateTransferNativeTokenParams,
  asyncWrap(
    walletControllerInstance.transferNativeToken.bind(walletControllerInstance)
  )
);
router.post(
  "/transfercw20token",
  validateTransferCW20TokenParams,
  asyncWrap(
    walletControllerInstance.transferCW20Token.bind(walletControllerInstance)
  )
);
router.post(
  "/addcw20token",
  validateAddCW20TokenParams,
  asyncWrap(
    walletControllerInstance.addCW20Token.bind(walletControllerInstance)
  )
);
router.post(
  "/gettransactionhistory",
  validateGetTransactionHistoryParams,
  asyncWrap(
    walletControllerInstance.getTransactionHistory.bind(
      walletControllerInstance
    )
  )
);

export default router;
