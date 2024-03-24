import {
  ASSOCIATED_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@coral-xyz/anchor/dist/cjs/utils/token';
import { SystemProgram } from '@solana/web3.js';

export const RPC_ENDPOINT_MAIN = 'https://api.mainnet-beta.solana.com';
export const RPC_ENDPOINT_DEV = 'https://api.devnet.solana.com';

const PINATA_API_kEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_DOMAIN = process.env.NEXT_PUBLIC_PINATA_DOMAIN;
const PINATA_API_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_API_SECRET_KEY;
const SKIP_DEPLOY_JSON_METADATA =
  process.env.SKIP_DEPLOY_JSON_METADATA == '1' ? true : false;
const IN_PRODUCTION = process.env.NEXT_PUBLIC_PRODUCTION == '1' ? true : false;
const LOG_ERROR = !IN_PRODUCTION;
if (!PINATA_API_kEY || !PINATA_API_SECRET_KEY || !PINATA_DOMAIN) {
  // throw "Some ENV keys and info not found"
}

export const ENV = {
  PINATA_API_kEY,
  PINATA_API_SECRET_KEY,
  PINATA_DOMAIN,
  IN_PRODUCTION,
  RPC_ENDPOINT_DEV,
  RPC_ENDPOINT_MAIN,
  RPC_ENDPOINT: IN_PRODUCTION ? RPC_ENDPOINT_MAIN : RPC_ENDPOINT_DEV,
  SKIP_DEPLOY_JSON_METADATA,
  LOG_ERROR,
};
// console.log({ ENV })

const TESTING_RPC_ENDPOINT = process.env.TESTING_ENDPOINT;
if (TESTING_RPC_ENDPOINT) ENV.RPC_ENDPOINT = TESTING_RPC_ENDPOINT;

export const PROGRAMS = {
  associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
  tokenProgram: TOKEN_PROGRAM_ID,
  systemProgram: SystemProgram.programId,
};
