import { web3 } from '@coral-xyz/anchor';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import Axios from 'axios';

import { ENV } from '@/configs';

import { Result } from './types';

export function calcNonDecimalValue(value: number, decimals: number): number {
  return Math.trunc(value * Math.pow(10, decimals));
}

export function calcDecimalValue(value: number, decimals: number): number {
  return value / Math.pow(10, decimals);
}

export function getKeypairFromStr(str: string): web3.Keypair | null {
  try {
    return web3.Keypair.fromSecretKey(Uint8Array.from(bs58.decode(str)));
  } catch (error) {
    return null;
  }
}

export async function getNullableResutFromPromise<T>(
  value: Promise<T>,
  opt?: { or?: T; logError?: boolean }
): Promise<T | null> {
  return value.catch((error) => {
    if (opt) console.log({ error });
    return opt?.or != undefined ? opt.or : null;
  });
}

export async function createLookupTable(
  connection: web3.Connection,
  signer: web3.Keypair,
  addresses: web3.PublicKey[] = []
): Promise<Result<{ txSignature: string; lookupTable: string }, string>> {
  try {
    const slot = await connection.getSlot();
    addresses.push(web3.AddressLookupTableProgram.programId);
    const [lookupTableInst, lookupTableAddress] =
      web3.AddressLookupTableProgram.createLookupTable({
        authority: signer.publicKey,
        payer: signer.publicKey,
        recentSlot: slot - 1,
      });
    const extendInstruction = web3.AddressLookupTableProgram.extendLookupTable({
      payer: signer.publicKey,
      authority: signer.publicKey,
      lookupTable: lookupTableAddress,
      addresses,
    });
    const transaction = new web3.Transaction().add(
      lookupTableInst,
      extendInstruction
    );
    const txSignature = await connection.sendTransaction(transaction, [signer]);
    return { Ok: { txSignature, lookupTable: lookupTableAddress.toBase58() } };
  } catch (err) {
    // eslint-disable-next-line no-ex-assign
    err = err ?? '';
    return { Err: (err as any).toString() };
  }
}

export async function deployDataToIPFS(
  data: any,
  type: 'JSON' | 'File' = 'JSON'
): Promise<string | null> {
  const url = `https://api.pinata.cloud/pinning/pin${type}ToIPFS`;
  const pinataApiKey = ENV.PINATA_API_kEY;
  const pinataSecretApiKey = ENV.PINATA_API_SECRET_KEY;

  return Axios.post(
    url,
    // JSON.stringify(data),
    data,
    {
      headers: {
        'Content-Type':
          type === 'JSON' ? `application/json` : `multipart/form-data`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    }
  )
    .then(function (response: any) {
      return response?.data?.IpfsHash;
    })
    .catch(function (error: any) {
      console.log({ jsonUploadErr: error });
      return null;
    });
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
