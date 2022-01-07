require("dotenv").config();
import * as fs from "fs";
import { LCDClient } from "@terra-money/terra.js";
import axios from "axios";

(async () => {
  const terra = new LCDClient({
    URL: process.env.TERRA_NODE_URL!,
    chainID: process.env.TERRA_CHAIN_ID!,
  });
  const getCW20Tokens = async (terra: LCDClient) => {
    const data = await axios.get("cw20/tokens.json", {
      baseURL: "https://assets.terra.money",
    });

    // const promises = [];
    let result = { mainnet: {}, testnet: {} };
    result.mainnet = data.data.mainnet;
    const keys = Object.keys(data.data.testnet);

    for (let i = 0; i < keys.length; i++) {
      if (data.data.testnet[keys[i]].decimals) {
        result.testnet[keys[i]] = {
          protocol: data.data.testnet[keys[i]].protocol,
          name: data.data.testnet[keys[i]].name,
          symbol: data.data.testnet[keys[i]].symbol,
          token: keys[i],
          icon: data.data.testnet[keys[i]].icon,
          decimals: data.data.testnet[keys[i]].decimals,
        };
      } else {
        console.log(keys[i]);
        await terra.wasm
          .contractQuery(keys[i], {
            token_info: {},
          })
          .then((res: any) => {
            result.testnet[keys[i]] = {
              protocol: data.data.testnet[keys[i]].protocol,
              name: res.name,
              symbol: res.symbol,
              token: keys[i],
              icon: data.data.testnet[keys[i]].icon,
              decimals: res.decimals,
            };
          })
          .catch((e) => {
            console.log(e);
            result.testnet[keys[i]] = data.data.testnet[keys[i]];
          });
        setTimeout(() => {}, 1000);
      }
    }
    // console.log(result);
    // write JSON string to a file
    fs.writeFile(".\\tokens.json", JSON.stringify(result), (err) => {
      if (err) {
        throw err;
      }
      console.log("JSON data is saved.");
    });
  };
  await getCW20Tokens(terra);
})();
