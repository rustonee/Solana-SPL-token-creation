import { web3 } from "@coral-xyz/anchor";

export function getPubkeyFromStr(key: string) {
    try {
        return new web3.PublicKey(key)
    } catch (error) {
        return null
    }
}

export function generateKeypairs(count = 1) {
    const keypairs: web3.Keypair[] = []
    for (let i = 0; i < count; ++i) {
        keypairs.push(web3.Keypair.generate())
    }
    return keypairs
}