import { LCDClient } from "@terra-money/terra.js";
require("dotenv").config();

export const terraConnection = new LCDClient({
  URL: process.env.TERRA_NODE_URL!,
  chainID: process.env.TERRA_CHAIN_ID!,
});
