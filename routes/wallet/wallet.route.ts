import { Router } from "express";
import WalletController from "@controllers/wallet/wallet.controller";
import { asyncWrap } from "@utils/async_wrap";

const router = Router();
const walletControllerInstance = new WalletController();
router.get(
  "/createseedphrases",
  asyncWrap(walletControllerInstance.createSeedPhrases.bind(walletControllerInstance))
);
router.post("/createwallet", asyncWrap(walletControllerInstance.createWallet.bind(walletControllerInstance)));

export default router;
