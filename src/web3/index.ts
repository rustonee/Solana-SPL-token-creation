import { AnchorProvider, web3 } from "@coral-xyz/anchor";
import { Wallet } from "@coral-xyz/anchor/dist/cjs/provider";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { AccountLayout as TokenAccountLayout, createAssociatedTokenAccountInstruction, createTransferInstruction,getAssociatedTokenAddressSync, MintLayout } from '@solana/spl-token'

import { ENV } from "@/configs";

import { BaseMpl } from "./base/baseMpl";
import { BaseSpl } from "./base/baseSpl";
import { Result, TxPassResult } from "./base/types";
import { calcNonDecimalValue, deployDataToIPFS, sleep } from "./base/utils";
import { Web3Error } from "./errors";
import { getPubkeyFromStr } from "./utils";

const log = console.log;

export type CreateTokenInput = {
    name: string,
    symbol: string,
    image: string,
    decimals: number,
    description: string,
    supply: number,
    immutable?: boolean,
    revokeMint?: boolean,
    revokeFreeze?: boolean,
    socialLinks?: {
        website?: string,
        twitter?: string,
        telegram?: string,
        discord?: string
    }
}

export type RevokeTokenAuthorityInput = {
    minting?: boolean,
    freezing?: boolean,
    mint: string,
}

export type AllUserTokens = {
    mint: string,
    name: string,
    symbol: string
    image: string,
    decimals: number,
    supply: number,
    balance: number,
    description: string
    mintingAuthority: string,
    isMintingAuthRevoke: boolean,
    freezingAuthority: string,
    isFreezingAuthRevoke: boolean,
}
export type AirdropInput = {
    mint: string,
    receivers: { wallet: string, amount: number }[]
}

export class Connectivity {
    private provider: AnchorProvider;
    private connection: web3.Connection;
    private baseMpl: BaseMpl;
    private baseSpl: BaseSpl;

    constructor(input: { wallet: Wallet | AnchorProvider, rpcEndpoint: string }) {
        const { rpcEndpoint, wallet } = input;
        this.connection = new web3.Connection(rpcEndpoint)
        if (wallet instanceof AnchorProvider)
            this.provider = wallet;
        else
            this.provider = new AnchorProvider(this.connection, wallet, {})
        this.baseMpl = new BaseMpl(wallet, { endpoint: this.connection.rpcEndpoint })
        this.baseSpl = new BaseSpl(this.connection)
    }

    private async sendTransaction(ixs: web3.TransactionInstruction[], signers?: web3.Keypair[], opt?: { logErrorMsg?: boolean }) {
        const tx = new web3.Transaction().add(...ixs)
        tx.feePayer = this.provider.publicKey
        const recentBlockhash = (await (this.connection.getLatestBlockhash())).blockhash
        tx.recentBlockhash = recentBlockhash
        if (signers && signers.length > 0) tx.sign(...signers)
        const signedTxs = await this.provider.wallet.signTransaction(tx)
        const rawTx = Buffer.from(signedTxs.serialize())
        const txSignature = await web3.sendAndConfirmRawTransaction(this.connection, rawTx).catch(async () => {
            await sleep(2_000)
            return web3.sendAndConfirmRawTransaction(this.connection, rawTx).catch((sendRawTransactionError) => {
                const logErrorMsg = opt?.logErrorMsg ?? !ENV.IN_PRODUCTION
                if (logErrorMsg) log({ sendRawTransactionError })
                return undefined
            })
        })
        if (!txSignature) throw "Tx Failed"
        return txSignature
    }

    async createToken(input: CreateTokenInput): Promise<Result<{ txSignature: string, tokenAddress: string }, Web3Error>> {
        const user = this.provider.publicKey
        if (!user) return { Err: Web3Error.WALLET_NOT_FOUND }
        const { name, symbol, image, decimals, description, supply, socialLinks, immutable, revokeMint, revokeFreeze } = input
        let ipfsHash = "null";
        if (!ENV.SKIP_DEPLOY_JSON_METADATA) {
            const hash = await deployDataToIPFS({
                image, description,
                external_url: socialLinks?.website,
                extensions: {
                    ...socialLinks
                }
            })
            if (!hash) return { Err: Web3Error.FAILED_TO_DEPLOY_METADATA }
            ipfsHash = hash
        }
        const uri = `https://${ENV.PINATA_DOMAIN}/ipfs/${ipfsHash}`;
        const createTokenTxInfo = await this.baseMpl.createToken({
            name, uri,
            symbol,
            isMutable: !immutable,
            decimals,
            initialSupply: supply,
        })
        if (!createTokenTxInfo) {
            return { Err: Web3Error.FAILED_TO_PREPARE_TX }
        }
        if (revokeMint) createTokenTxInfo.ixs.push(this.baseSpl.revokeAuthority({ authorityType: "MINTING", currentAuthority: user, mint: createTokenTxInfo.mintKeypair.publicKey }))
        if (revokeFreeze) createTokenTxInfo.ixs.push(this.baseSpl.revokeAuthority({ authorityType: "FREEZING", currentAuthority: user, mint: createTokenTxInfo.mintKeypair.publicKey }))
        const mintKeypair = createTokenTxInfo.mintKeypair
        const tokenAddress = mintKeypair.publicKey.toBase58()
        const txSignature = await this.sendTransaction(createTokenTxInfo.ixs, [mintKeypair]).catch((sendTransactionError) => {
            if (!ENV.IN_PRODUCTION) {
                log(sendTransactionError)
            }
        })
        if (!txSignature) return { Err: Web3Error.TRANSACTION_FAILED }
        return {
            Ok: {
                txSignature,
                tokenAddress
            }
        }
    }

    async revokeAuthority(input: RevokeTokenAuthorityInput): Promise<Result<TxPassResult, Web3Error>> {
        const user = this.provider.publicKey
        if (!user) return { Err: Web3Error.WALLET_NOT_FOUND }
        const mint = getPubkeyFromStr(input.mint)
        if (!mint) return { Err: Web3Error.INVALID_PUBKEY_STR }
        const mintAccountInfo = await this.connection.getAccountInfo(mint).catch(async () => {
            await sleep(2_000)
            return await this.connection.getAccountInfo(mint).catch((getAccountInfoError) => {
                log({ getAccountInfoError })
                return undefined
            })
        })
        if (mintAccountInfo === undefined) return { Err: Web3Error.FAILED_TO_FETCH_DATA }
        if (!mintAccountInfo
            || mintAccountInfo.owner.toBase58() != TOKEN_PROGRAM_ID.toBase58()
            || mintAccountInfo.data.length != MintLayout.span
        ) return { Err: Web3Error.TOKEN_NOT_FOUND }
        const mintInfo = MintLayout.decode(mintAccountInfo.data)
        const ixs: web3.TransactionInstruction[] = []
        if (input.minting) {
            if (mintInfo.mintAuthorityOption == 0) return { Err: Web3Error.AUTHORITY_ALREADY_REVOKED }
            if (mintInfo.mintAuthority.toBase58() != user.toBase58()) return { Err: Web3Error.UNAUTHORISED }
            ixs.push(this.baseSpl.revokeAuthority({ mint, currentAuthority: user, authorityType: 'MINTING' }))
        }
        if (input.freezing) {
            if (mintInfo.freezeAuthorityOption == 0) return { Err: Web3Error.AUTHORITY_ALREADY_REVOKED }
            if (mintInfo.freezeAuthority.toBase58() != user.toBase58()) return { Err: Web3Error.UNAUTHORISED }
            ixs.push(this.baseSpl.revokeAuthority({ mint, currentAuthority: user, authorityType: 'FREEZING' }))
        }
        if (!ixs) return { Err: Web3Error.AUTHORITY_ALREADY_REVOKED }
        const txSignature = await this.sendTransaction(ixs, [], { logErrorMsg: !ENV.IN_PRODUCTION }).catch((sendTransactionError) => {
            log({ sendTransactionError })
            return null
        })
        if (!txSignature) return { Err: Web3Error.TRANSACTION_FAILED }
        return { Ok: { txSignature } }
    }

    async airdrop(input: AirdropInput) {
        const user = this.provider.publicKey
        if (!user) return { Err: Web3Error.WALLET_NOT_FOUND }
        const mint = getPubkeyFromStr(input.mint)
        if (!mint) return { Err: Web3Error.INVALID_PUBKEY_STR }
        const _totalAmount = { amount: 0 }
        input.receivers.map(({ amount }) => _totalAmount.amount += amount)
        const userAta = getAssociatedTokenAddressSync(mint, user)
        const [userAtaAccountInfo, mintAccountInfo] = await this.connection.getMultipleAccountsInfo([userAta, mint]).catch(async () => {
            await sleep(2_000)
            return await this.connection.getMultipleAccountsInfo([userAta, mint]).catch(() => [undefined, undefined])
        })
        if (userAtaAccountInfo === undefined || mintAccountInfo === undefined) return { Err: Web3Error.FAILED_TO_FETCH_DATA }
        if (!mintAccountInfo) return { Err: Web3Error.TOKEN_NOT_FOUND }
        if (!userAtaAccountInfo) return { Err: Web3Error.NOT_ENOUGH_TOKEN }
        if (mintAccountInfo.owner.toBase58() != TOKEN_PROGRAM_ID.toBase58()
            || mintAccountInfo.data.length != MintLayout.span
        ) return { Err: Web3Error.TOKEN_NOT_FOUND }
        const mintInfo = MintLayout.decode(mintAccountInfo.data)
        const userAtaInfo = TokenAccountLayout.decode(userAtaAccountInfo.data)
        const availableTokens = calcNonDecimalValue(Number(userAtaInfo.amount.toString()), mintInfo.decimals)
        const totalAirdropAmount = calcNonDecimalValue(_totalAmount.amount, mintInfo.decimals)
        if (availableTokens < totalAirdropAmount) return { Err: Web3Error.NOT_ENOUGH_TOKEN }
        const __mlp = 10 ** mintInfo.decimals
        input.receivers.map((e) => e.amount = Math.trunc(e.amount * __mlp))
        const atas: web3.PublicKey[] = []
        type OneAirdropReceiverInfo = {
            receiverAta: web3.PublicKey;
            receiver: web3.PublicKey;
            amount: number;
            initAta: boolean;
        }
        const airdropTxInfo: OneAirdropReceiverInfo[] = input.receivers.map((e) => {
            const receiver = new web3.PublicKey(e.wallet)
            const receiverAta = getAssociatedTokenAddressSync(mint, receiver)
            atas.push(receiverAta)
            return {
                receiverAta,
                receiver,
                amount: e.amount,
                initAta: false,
            }
        })
        const receiversAtaInfo = await this.connection.getMultipleAccountsInfo(atas).catch(async () => {
            await sleep(2_000)
            return await this.connection.getMultipleAccountsInfo(atas).catch((getMultipleAccountsInfoError: any) => {
                if (!ENV.IN_PRODUCTION) {
                    log({ getMultipleAccountsInfoError })
                }
                return null
            })
        })
        if (!receiversAtaInfo) return { Err: Web3Error.FAILED_TO_FETCH_DATA }
        let chunkc: OneAirdropReceiverInfo[] = []
        const airdropTxInfoChunks: OneAirdropReceiverInfo[][] = []
        for (let i = 1; i <= receiversAtaInfo.length; ++i) {
            const info = airdropTxInfo[i - 1]
            const ataInfo = receiversAtaInfo[i - 1]
            if (!ataInfo) info.initAta = true
            chunkc.push(info)
            if (i % 10 == 0) {
                airdropTxInfoChunks.push(chunkc)
                chunkc = []
            }
        }
        if (chunkc.length != 0) airdropTxInfoChunks.push(chunkc)
        const recentBlockhash = (await this.connection.getLatestBlockhash()
            .catch(async () => {
                await sleep(2_000)
                return (await this.connection.getLatestBlockhash()
                    .catch((getLatestBlockhashError) => {
                        if (!ENV.IN_PRODUCTION) log({ getLatestBlockhashError })
                        return null
                    }))
            })
        )?.blockhash
        if (!recentBlockhash) return { Err: Web3Error.FAILED_TO_FETCH_DATA }
        const txs: web3.VersionedTransaction[] = []
        for (const infoes of airdropTxInfoChunks) {
            const ixs: web3.TransactionInstruction[] = []
            for (const { amount, initAta, receiver, receiverAta } of infoes) {
                if (initAta) ixs.push(
                    createAssociatedTokenAccountInstruction(
                        user,
                        receiverAta,
                        receiver,
                        mint
                    )
                )
                ixs.push(createTransferInstruction(
                    userAta, receiverAta, user, BigInt(amount.toString())
                ))
            }
            const msg = new web3.TransactionMessage({
                instructions: ixs,
                payerKey: user,
                recentBlockhash,
            }).compileToV0Message()
            const tx = new web3.VersionedTransaction(msg)
            txs.push(tx)
        }
        const signedTxs = await this.provider.wallet.signAllTransactions(txs).catch((signAllTransactionsError) => {
            if (!ENV.IN_PRODUCTION) log({ signAllTransactionsError })
            return null
        })
        if (!signedTxs) return { Err: Web3Error.TX_SIGN_FAILED }
        const txsRes: (string | undefined)[] = []
        const asyncTxsHandler: Promise<(string | undefined)>[] = []
        for (const tx of signedTxs) {
            const rawTx = Buffer.from(tx.serialize())
            const handler = web3.sendAndConfirmRawTransaction(this.connection, rawTx).catch(async () => {
                await sleep(2_000)
                return web3.sendAndConfirmRawTransaction(this.connection, rawTx).catch((sendRawTransactionError) => {
                    if (!ENV.IN_PRODUCTION) log({ sendRawTransactionError })
                    return undefined
                })
            })
            asyncTxsHandler.push(handler)
        }
        for (const handler of asyncTxsHandler) {
            txsRes.push(await handler);
        }
        const passTxReceiver = []
        const failTxReceiver = []
        const txsSignature: string[] = []
        for (let i = 0; i < txsRes.length; ++i) {
            const txRes = txsRes[i]
            const start = i * 10
            const end = start + 10
            const _info = input.receivers.slice(start, end)
            const info = _info.map(e => {
                e.amount = e.amount / __mlp
                return e
            })
            if (txRes) {
                txsSignature.push(txRes)
                passTxReceiver.push(...info)
            } else {
                failTxReceiver.push(...info)
            }
        }
        return { passTxReceiver, failTxReceiver, txsSignature }
    }

    async getAllTokens() {
        const user = this.provider.publicKey;
        if (!user) throw "Wallet not connected"
        const tokens = await this.baseMpl.getAllTokensWithMetadata(user).catch(() => null) ?? []
        const res: AllUserTokens[] = []
        const asyncHandlers: Promise<void>[] = []
        for (const token of tokens) {
            const metadata = token.metadata
            const tokenInfo = token.tokenInfo
            const e: AllUserTokens = {
                name: metadata.data.name,
                symbol: metadata.data.symbol,
                image: "",
                description: "",
                decimals: tokenInfo.mintState.decimals,
                mintingAuthority: tokenInfo.mintState.mintAuthority.toBase58(),
                isMintingAuthRevoke: tokenInfo.mintState.mintAuthorityOption == 0 ? true : false,
                freezingAuthority: tokenInfo.mintState.freezeAuthority.toBase58(),
                isFreezingAuthRevoke: tokenInfo.mintState.freezeAuthorityOption == 0 ? true : false,
                mint: tokenInfo.mint.toBase58(),
                supply: tokenInfo.supply,
                balance: tokenInfo.balance,
            }
            asyncHandlers.push(fetch(metadata.data.uri)
                .catch(() => null)
                .then(value => value?.json()
                    .then((jsonMetadata: any) => {
                        e.image = jsonMetadata?.image ?? "";
                        e.description = jsonMetadata?.description ?? ""
                    })
                ))
        }
        for (const handler of asyncHandlers) await handler;
        return res
    }
}