import * as express from "express";
import * as bodyParser from "body-parser";
import * as dotenv from "dotenv";
import logger from "@logger";
import walletRouter from "@routes/wallet";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/wallet", walletRouter);

app.use((err: any, req: any, res: any) => {
  // set locals, only providing error in development
  if (err.message) {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
  }
});

dotenv.config();
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  logger.info(`Current app environment: ${process.env.NODE_ENV}`);
  logger.info(`Server is running on port ${PORT}`);
});

export default app;
