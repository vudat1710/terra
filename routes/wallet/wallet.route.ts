import { Router } from "express";
import WalletController from "@controllers/wallet";

const router = Router();
const walletControllerInstance = new WalletController();
router.get(
  "/createseedphrases",
  walletControllerInstance.createSeedPhrases
);
router.post("/createwallet", walletControllerInstance.createWallet);

export default router;
