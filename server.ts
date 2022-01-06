import "module-alias/register";
import express from "express";
import { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import logger from "@logger";
import { WalletError } from "@errors/wallet.error";
import walletRouter from "@routes/wallet/wallet.route";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/wallet", walletRouter);

app.use(function onError(
  err: WalletError,
  _req: Request,
  res: Response,
  _: NextFunction
) {
  if (err.message) {
    logger.error(err.message);
    return res
      .status(err.code)
      .send({ errorCode: err.code, message: err.message });
  } else {
    return res.sendStatus(err.code);
  }
});

dotenv.config();
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  logger.info(`Current app environment: ${process.env.NODE_ENV}`);
  logger.info(`Server is running on port ${PORT}`);
});

export default app;
