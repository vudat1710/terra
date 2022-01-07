import {
  LCDClient,
  Fee,
  MsgStoreCode,
  MsgInstantiateContract,
  MnemonicKey,
  getContractAddress,
  getCodeId,
  MsgExecuteContract,
  Wallet,
} from "@terra-money/terra.js";
import * as fs from "fs";
require("dotenv").config();

//deployer: terra1vx5xnt6xcyw08te3nafj7hag9yne4ewhj28gk8
//account2: terra17ladppf996f2g387hq90ug07ckcmjhtvtzdh9l

(async () => {
  const terra = new LCDClient({
    URL: process.env.TERRA_NODE_URL,
    chainID: process.env.TERRA_CHAIN_ID,
  });

  const deployerKey = new MnemonicKey({
    mnemonic:
      "fit once session entire grocery blossom glad repair trouble fury subway solid climb couple turtle cradle bread lemon approve note warm insane nurse emotion",
  });
  const account2Key = new MnemonicKey({
    mnemonic:
      "auto chase luggage act video ocean response gauge vast angle control acoustic holiday couple kit web vapor rail tunnel merry whisper shrimp never horse",
  });

  const deployer = terra.wallet(deployerKey);
  const account2 = terra.wallet(account2Key);

  const storeContract = async (
    contractName: string,
    sequence: number
  ): Promise<string> => {
    const contractBytes = fs
      .readFileSync(`./${contractName}.wasm`)
      .toString("base64");
    const stdFee = new Fee(990000, "1000000uluna");
    const storeCode = new MsgStoreCode(deployer.key.accAddress, contractBytes);
    const tx = await deployer.createAndSignTx({
      msgs: [storeCode],
      //   fee: stdFee,
      sequence: sequence,
    });
    const result = await terra.tx.broadcast(tx);
    const codeId = getCodeId(result);

    return codeId;
  };

  const instantiateContract = async (
    codeId: string,
    initMsg: object,
    sequence: number
  ): Promise<string> => {
    const instantiate = new MsgInstantiateContract(
      deployer.key.accAddress,
      "",
      codeId as unknown as number,
      initMsg
    );
    // const stdFee = new Fee(1000000, "2000000uluna");
    const tx = await deployer.createAndSignTx({
      msgs: [instantiate],
      // fee: stdFee,
      sequence: sequence,
    });
    const result = await terra.tx.broadcast(tx);
    const contractAddress = getContractAddress(result);

    return contractAddress;
  };

  const executeContract = async (
    sender: Wallet,
    contractAddress: string,
    executeMsg: object,
    sequence: number
  ) => {
    const execute = new MsgExecuteContract(
      sender.key.accAddress,
      contractAddress,
      executeMsg
    );
    // const stdFee = new Fee(1000000, "2000000uluna");
    const tx = await sender.createAndSignTx({
      msgs: [execute],
      // fee: stdFee,
      sequence: sequence,
    });
    const result = await terra.tx.broadcast(tx);

    return result;
  };
  console.log(deployer.key.accAddress);
  console.log(account2.key.accAddress);
  const sequence = (
    await terra.auth.accountInfo(deployer.key.accAddress)
  ).getSequenceNumber();
  const codeId = await storeContract("terraswap_token", sequence);

  const contractAddress = await instantiateContract(
    codeId,
    {
      name: "Butterfly",
      symbol: "BTF",
      decimals: 6,
      initial_balances: [
        { address: deployer.key.accAddress, amount: "1000000000" },
      ],
      mint: { minter: deployer.key.accAddress },
    },
    sequence + 1
  );
  console.log(contractAddress)

  await executeContract(
    deployer,
    contractAddress,
    {
      transfer: { recipient: account2.key.accAddress, amount: "500000000" },
    },
    sequence + 2
  );

  console.log(
    await terra.wasm.contractQuery(contractAddress, {
      balance: { address: deployer.key.accAddress },
    })
  );
  console.log(
    await terra.wasm.contractQuery(contractAddress, {
      balance: { address: account2.key.accAddress },
    })
  );
})();
