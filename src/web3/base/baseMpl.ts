import { AnchorProvider, web3 } from "@coral-xyz/anchor";
import { Wallet } from "@coral-xyz/anchor/dist/cjs/provider";
import { utf8 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { getMultipleAccounts } from "@coral-xyz/anchor/dist/cjs/utils/rpc";
// import { TokenMetadataAuthorizationDetails, getAccountParsingAndAssertingFunction, Sft } from '@metaplex-foundation/js/dist/types';
import {
  createCreateMetadataAccountV3Instruction,
  Metadata,
  PROGRAM_ID as MPL_ID,
  TokenStandard} from "@metaplex-foundation/mpl-token-metadata";

// import {
//   CreateNftBuilderParams,
//   Metaplex
// } from "@metaplex-foundation/js";
import { BaseSpl, ParseTokenInfo } from "./baseSpl";

const log = console.log;


type MPLTransferInput = {
  mint: web3.PublicKey | string,
  sender: web3.PublicKey | string,
  receiver: web3.PublicKey | string,
  /** default it take a single one token easy for NFT, SFT */
  amount?: number
  /** default (`true`)*/
  init_ata_if_needed?: boolean
  tokenStandard: TokenStandard
  /** default (`false`)*/
  isPNFT?: boolean
}

type BurnInput = {
  mint: web3.PublicKey | string,
  owner: web3.PublicKey | string,
  /** default it burn a single one token easy for NFT, SFT */
  amount?: number
  /** default(`get from the onchain data`) */
  decimal?: number
}

export type CreateTokenParams = {
  name: string,
  symbol: string,
  uri: string,
  decimals?: number,
  initialSupply?: number,
  mintKeypair?: web3.Keypair,
  isMutable: boolean
}

export class BaseMpl {
  connection: web3.Connection;
  mplIxs: web3.TransactionInstruction[] = [];
  mplSigns: web3.Keypair[] = [];
  // metaplex: Metaplex;
  provider: AnchorProvider
  baseSpl: BaseSpl

  constructor(wallet: Wallet | AnchorProvider, web3Config: { endpoint: string }) {
    this.connection = new web3.Connection(web3Config.endpoint, { commitment: 'confirmed' });
    // this.metaplex = new Metaplex(this.connection);
    if (wallet instanceof AnchorProvider)
      this.provider = wallet
    else
      this.provider = new AnchorProvider(this.connection, wallet, { commitment: 'confirmed' });
    this.baseSpl = new BaseSpl(this.connection)

    // if (this.metaplex.identity()?.publicKey?.toBase58() != wallet?.publicKey?.toBase58()) {
    //   this.metaplex.identity().setDriver({
    //     publicKey: wallet?.publicKey,
    //     signMessage: null as any, //TODO: Need to improve it
    //     signTransaction: this.provider.wallet.signTransaction as any,
    //     signAllTransactions: this.provider.wallet.signAllTransactions as any,
    //   });
    // }
  }

  setUpCallBack = (
    ixs: web3.TransactionInstruction[],
    signs: web3.Keypair[]
  ) => {
    if (ixs) {
      this.mplIxs.push(...ixs);
      log("ixs added to mpl : ", ixs);
    }
    if (signs) {
      log("sings added to mpl : ", signs);
      this.mplSigns.push(...signs);
    }
  };

  reinit(wallet: Wallet): void {
    const user = wallet.publicKey
    // if (this.metaplex.identity().publicKey.toBase58() != user.toBase58()) {
    //   this.metaplex.identity().setDriver({
    //     publicKey: user,
    //     signMessage: (wallet as any).signMessage,
    //     signTransaction: wallet.signTransaction,
    //     signAllTransactions: wallet.signAllTransactions,
    //   });
    // }
    this.mplIxs = [];
    this.mplSigns = []
    this.provider = new AnchorProvider(this.connection, wallet, { commitment: 'confirmed' });
  }

  static getEditionAccount(tokenId: web3.PublicKey) {
    return web3.PublicKey.findProgramAddressSync(
      [
        utf8.encode("metadata"),
        MPL_ID.toBuffer(),
        tokenId.toBuffer(),
        utf8.encode("edition"),
      ],
      MPL_ID
    )[0];
  }

  static getMetadataAccount(tokenId: web3.PublicKey) {
    return web3.PublicKey.findProgramAddressSync(
      [utf8.encode("metadata"), MPL_ID.toBuffer(), tokenId.toBuffer()],
      MPL_ID
    )[0];
  }

  static getCollectionAuthorityRecordAccount(collection: web3.PublicKey, authority: web3.PublicKey): web3.PublicKey {
    return web3.PublicKey.findProgramAddressSync(
      [
        utf8.encode("metadata"),
        MPL_ID.toBuffer(),
        collection.toBuffer(),
        utf8.encode("collection_authority"),
        authority.toBuffer()
      ],
      MPL_ID
    )[0];
  }

  async createToken(input: CreateTokenParams) {
    const user = this?.provider?.publicKey;
    let { decimals, initialSupply, mintKeypair } = input;
    initialSupply = initialSupply ?? 0;
    decimals = decimals ?? 0;
    mintKeypair = mintKeypair ?? web3.Keypair.generate()
    const mint = mintKeypair.publicKey
    const ixs: web3.TransactionInstruction[] = []
    const createTokenIxs = (await this.baseSpl.createToken({
      mintAuthority: user,
      decimal: decimals,
      freezAuthority: user,
      mintingInfo: { tokenAmount: initialSupply },
      mintKeypair,
    })).ixs
    ixs.push(...createTokenIxs)

    const { isMutable, name, symbol, uri } = input
    const metadata = BaseMpl.getMetadataAccount(mint)
    const metadataIx = createCreateMetadataAccountV3Instruction({
      metadata, mint, mintAuthority: user, payer: user, updateAuthority: user,
    }, {
      createMetadataAccountArgsV3: {
        collectionDetails: null,
        data: {
          collection: null,
          creators: [{ address: user, share: 100, verified: true }],
          name,
          symbol,
          uri,
          uses: null,
          sellerFeeBasisPoints: 0,
        },
        isMutable,
      }
    })
    ixs.push(metadataIx)
    return {
      mintKeypair,
      ixs,
    }
  }

  // async transfer(input: MPLTransferInput) {
  //   let {
  //     mint,
  //     receiver,
  //     sender,
  //     amount,
  //     tokenStandard,
  //     isPNFT
  //   } = input;
  //   if (typeof mint == 'string') mint = new web3.PublicKey(mint)
  //   if (typeof sender == 'string') sender = new web3.PublicKey(sender)
  //   if (typeof receiver == 'string') receiver = new web3.PublicKey(receiver)
  //   amount = amount ?? 1;
  //   isPNFT = isPNFT ?? false
  //   let authorizationDetails: TokenMetadataAuthorizationDetails | undefined;
  //   if (isPNFT) {
  //     const tokenInfo = await this.getTokenInfo(mint)
  //     const rules = tokenInfo.metadata?.programmableConfig?.ruleSet
  //     if (rules) authorizationDetails = { rules }
  //   }
  //   try {
  //     const ixs = this.metaplex.nfts().builders().transfer({
  //       nftOrSft: { address: mint, tokenStandard },
  //       toOwner: receiver,
  //       amount: { basisPoints: new BN(amount) as any, currency: { decimals: 0, namespace: "spl-token", symbol: "" } },//TODO:
  //       // amount: null as any,
  //       fromOwner: sender,
  //       authorizationDetails
  //     }).getInstructions()
  //     const tx = new web3.Transaction().add(...ixs)
  //     const sign = await this.provider.sendAndConfirm(tx)
  //     return sign
  //   } catch (error) {
  //     log({ mplTransferError: error })
  //   }
  // }

  // async burn(input: BurnInput) {
  //   let {
  //     mint,
  //     owner,
  //     amount,
  //     decimal
  //   } = input
  //   if (typeof mint == 'string') mint = new web3.PublicKey(mint)
  //   if (typeof owner == 'string') owner = new web3.PublicKey(owner)
  //   if (!amount) {
  //     amount = 1
  //     decimal = 0;
  //   } else {
  //     if (!decimal)
  //       decimal = (await this.baseSpl.getMint(mint)).decimals
  //     amount = amount * (10 ** decimal)
  //   }

  //   const ixs = this.metaplex.nfts().builders().delete({
  //     mintAddress: mint,
  //     amount: { basisPoints: new BN(amount) as any, currency: { decimals: decimal, namespace: "spl-token", symbol: "" } }//TODO:
  //     // amount: token(amount)
  //   }).getInstructions()
  //   const tx = new web3.Transaction().add(...ixs)
  //   const sign = await this.provider.sendAndConfirm(tx)
  //   return sign
  // }

  // async getTokenInfo(mint: web3.PublicKey | string): Promise<MPLTokenInfo> {
  //   if (typeof mint == 'string') mint = new web3.PublicKey(mint)
  //   const metadataAccount = BaseMpl.getMetadataAccount(mint)
  //   const accountInfoes = await this.connection.getMultipleAccountsInfo([mint, metadataAccount])
  //   if (!accountInfoes[0]) throw "Token not found"
  //   let tokenInfo = MintLayout.decode(accountInfoes[0].data)
  //   if (!tokenInfo.isInitialized) throw "Token dosen't initialise"
  //   let metadata: Metadata | null = null
  //   if (accountInfoes[1]) metadata = Metadata.deserialize(accountInfoes[1].data)[0]
  //   return {
  //     address: mint,
  //     mintInfo: tokenInfo,
  //     metadata
  //   }
  // }

  // async getAndCheckTokenName(mint: web3.PublicKey, defaultName = ' ') {
  //   try {
  //     const metadataAccount = BaseMpl.getMetadataAccount(mint)
  //     const [mintAccountInfo, metadataAccountInfo] = await this.connection.getMultipleAccountsInfo([mint, metadataAccount]).catch(error => [null, null]);
  //     if (!mintAccountInfo
  //       || mintAccountInfo.owner.toBase58() != TOKEN_PROGRAM_ID.toBase58()
  //       || mintAccountInfo.data.length != MintLayout.span
  //     ) return null
  //     let name = mint.toBase58()
  //     if (metadataAccountInfo) {
  //       const res = BaseMpl.getTokenNameFromAccountInfo(metadataAccountInfo)
  //       if (res) return res
  //     }
  //     return defaultName
  //   } catch (error) {
  //     return null
  //   }
  // }

  // static getTokenNameFromAccountInfo(accountInfo: web3.AccountInfo<Buffer> | null) {
  //   if (!accountInfo) return undefined
  //   try {
  //     const metadata = Metadata.deserialize(accountInfo.data)[0]
  //     return metadata?.data?.name?.split("\0")[0]
  //   } catch (error) {
  //     return undefined
  //   }
  // }

  // async verifyCollectionItem(input: VerifyNftCollectionBuilderParams) {
  //   const ixs = this.metaplex
  //     .nfts()
  //     .builders()
  //     .verifyCollection(input)
  //     .getInstructions();
  //   const tx = new web3.Transaction().add(...ixs);
  //   return { tx };
  // }

  // getRevokeMetadataAuthIx(token: web3.PublicKey, owner: web3.PublicKey) {
  //   const metadata = BaseMpl.getMetadataAccount(token)
  //   const ix = createUpdateMetadataAccountV2Instruction({
  //     metadata, updateAuthority: owner
  //   }, {
  //     updateMetadataAccountArgsV2: {
  //       data: null,
  //       isMutable: false,
  //       primarySaleHappened: false,
  //       updateAuthority: null
  //     }
  //   })
  //   return ix
  // }

  async getAllTokensWithMetadata(user: web3.PublicKey) {
    let allTokensRes = await this.baseSpl.getAllSplMints(user)
      .catch((getAllSplMintsError) => { log({ getAllSplMintsError }); return null });
    allTokensRes = allTokensRes ?? []
    const metadataAddresses = allTokensRes.map((e) => BaseMpl.getMetadataAccount(e.mint))
    const accountInfoes = await getMultipleAccounts(this.connection, metadataAddresses)
    const mainRes: {
      tokenInfo: ParseTokenInfo,
      metadata: Metadata
    }[] = []
    for (let i = 0; i < accountInfoes.length; ++i) {
      const tokenInfo = allTokensRes[i]
      const accountInfo = accountInfoes[i]
      if (!accountInfo) continue;
      const metadata = Metadata.deserialize(accountInfo.account.data)[0]
      if (metadata.tokenStandard != TokenStandard.Fungible) continue
      const { name, symbol, uri } = metadata.data
      metadata.data.name = name.split("\0")[0]
      metadata.data.symbol = symbol.split("\0")[0]
      metadata.data.uri = uri.split("\0")[0]
      mainRes.push({
        metadata, tokenInfo
      })
    }
    return mainRes
  }
}
