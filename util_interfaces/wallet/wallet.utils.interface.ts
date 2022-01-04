import { NextFunction, Request, Response } from "express";
export interface IWalletUtilities {
  claimTokens(address: string, denom: string): Promise<boolean>;
  validateInput(err: any, request: Request, response: Response, next: NextFunction): void;
}
