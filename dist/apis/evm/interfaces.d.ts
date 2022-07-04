/**
 * @packageDocumentation
 * @module EVM-Interfaces
 */
import { Buffer } from "buffer/";
import { Index, CredsInterface } from "../../common";
export interface GetAssetDescriptionParams {
    assetID: Buffer | string;
}
export interface GetAtomicTxStatusParams {
    txID: string;
}
export interface GetAtomicTxParams {
    txID: string;
}
export interface ExportDJTXParams extends CredsInterface {
    to: string;
    amount: string;
}
export interface ExportParams extends ExportDJTXParams {
    assetID: string;
}
export interface GetUTXOsParams {
    addresses: string[] | string;
    limit: number;
    sourceChain?: string;
    startIndex?: Index;
}
export interface ImportDJTXParams extends CredsInterface {
    to: string;
    sourceChain: string;
}
export interface ImportParams extends ImportDJTXParams {
}
export interface ImportKeyParams extends CredsInterface {
    privateKey: string;
}
export interface ExportKeyParams extends CredsInterface {
    address: string;
}
export interface CreateKeyPairResponse {
    address: string;
    publicKey: string;
    privateKey: string;
}
//# sourceMappingURL=interfaces.d.ts.map