export enum Web3Error {
    WALLET_NOT_FOUND,
    TRANSACTION_FAILED,
    INVALID_PUBKEY_STR,
    FAILED_TO_FETCH_DATA,
    FAILED_TO_DEPLOY_METADATA,
    FAILED_TO_PREPARE_TX,
    TX_SIGN_FAILED,

    //TOKEN
    TOKEN_NOT_FOUND,
    AUTHORITY_ALREADY_REVOKED,
    NOT_ENOUGH_TOKEN,
    UNAUTHORISED,
}

export function web3ErrorToStr(error: Web3Error) {
    switch (error) {
        case Web3Error.WALLET_NOT_FOUND: return "WALLET_NOT_FOUND"
        case Web3Error.TRANSACTION_FAILED: return "TRANSACTION_FAILED"
        case Web3Error.INVALID_PUBKEY_STR: return "INVALID_PUBKEY_STR"
        case Web3Error.FAILED_TO_FETCH_DATA: return "FAILED_TO_FETCH_DATA"
        case Web3Error.FAILED_TO_DEPLOY_METADATA: return "FAILED_TO_DEPLOY_METADATA"
        case Web3Error.FAILED_TO_PREPARE_TX: return "FAILED_TO_PREPARE_TX"
        case Web3Error.TX_SIGN_FAILED: return "TX_SIGN_FAILED"
        case Web3Error.TOKEN_NOT_FOUND: return "TOKEN_NOT_FOUND"
        case Web3Error.AUTHORITY_ALREADY_REVOKED: return "AUTHORITY_ALREADY_REVOKED"
        case Web3Error.NOT_ENOUGH_TOKEN: return "NOT_ENOUGH_TOKEN"
        case Web3Error.UNAUTHORISED: return "UNAUTHORISED"
    }
}
