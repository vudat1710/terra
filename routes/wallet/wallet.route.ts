import { Router } from "express";
import WalletController from "@controllers/wallet/wallet.controller";
import { asyncWrap } from "@utils/async_wrap";
import { validateWalletCreationParams } from "@validations/wallet/wallet.validation";

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
  asyncWrap(
    walletControllerInstance.getAccountBalance.bind(walletControllerInstance)
  )
);
router.post(
  "/gettokeninfo",
  asyncWrap(
    walletControllerInstance.getTokenInfo.bind(walletControllerInstance)
  )
);
router.post(
  "/transfernative",
  asyncWrap(
    walletControllerInstance.transferNativeToken.bind(walletControllerInstance)
  )
);

export default router;
