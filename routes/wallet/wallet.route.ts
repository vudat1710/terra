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

export default router;
