export type TCoinInfo = Array<{
  name?: string;
  denom: string;
  amount: string;
  decimals: number;
}>;

export type TNativeBalance = {
  coins: TCoinInfo;
  nextKey: string;
  total: number;
};

export type TCW20Balance = TCoinInfo;

export type TAccountBalance = {
  native: TCoinInfo;
  cw20: TCoinInfo;
  usdRatio: string;
  holdingCoins: Array<{ denom: string; name: string }>;
};

export type TMarketInfo = {
  currentUSDPrice: number;
  marketcapRank: number;
};

export type TTokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
};

export type TErrorResponse = {
  statusCode: number;
  message: string;
};
