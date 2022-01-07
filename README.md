# TerraJS Express APIs

[![N|TerraJS](https://avatars.githubusercontent.com/u/38208150?s=200&v=4)](https://docs.terra.money/SDKs/Terra-js/Overview.html)


# APIs

  - /createseedphrases: Create seed phrases for creating new wallet
  - /createwallet: Create a new wallet from a given mnemonic key
  - /getbalance: Get balance of an address on Terra. Returned result includes address's balance on native tokens, given CW20 tokens (users need to include list of CW20 tokens he/she wants to retrieve balance since Terra only provided APIs for getting balance using a certain token's address), list of holding tokens, and USD conversion rate of the native token on Terra (Luna)
  - /gettokeninfo: Get information of a CW20 token using its contract address
  - /transfernative: Transfer native tokens between 2 addresses on Terra
  - /transfercw20token: Transfer CW20 tokens between 2 addresses on Terra
  - /addcw20token: Add non-native tokens to an address on Terra
  - /gettransactionhistory: Get transaction history of a given address

# Notes
- Step to run this program: 
`$ yarn`
`$ yarn compile`
`$ yarn dev`
- List of CW20 tokens can be updated (not necessarily regularly) using the `get_cw20_token` script: `$ yarn run get-cw20-tokens`
- In order to add a new token into Terra's testnet, you can use `contract` script: `$ yarn run contract`. You can also change some information inside in order to create a new token at will
- Get balance and get holding tokens requirements are integrated into 1 API called /getbalance
- Example CW20 token can be found in constants file (in order to perform transferring CW20 token)
