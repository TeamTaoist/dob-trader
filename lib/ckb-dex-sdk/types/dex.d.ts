import { CKBTransaction, ConnectResponseData } from '@joyid/ckb';
import { Aggregator } from '../aggregator';
import { Collector } from '../collector';
import { Address, Hex } from './common';
export interface JoyIDConfig {
    aggregator: Aggregator;
    connectData: ConnectResponseData;
}
export declare enum CKBAsset {
    XUDT = 0,
    SUDT = 1,
    SPORE = 2,
    MNFT = 3
}
interface BaseParams {
    collector: Collector;
    fee?: bigint;
    joyID?: JoyIDConfig;
    ckbAsset?: CKBAsset;
}
export interface MakerParams extends BaseParams {
    seller: Address;
    totalValue: bigint;
    listAmount?: bigint;
    assetType: Hex;
}
export interface MakerResult {
    rawTx: CKBTransaction;
    listPackage: bigint;
    txFee: bigint;
    witnessIndex?: number;
}
export interface TakerParams extends BaseParams {
    orderOutPoints: Hex[];
    buyer: Address;
}
export interface TakerResult {
    rawTx: CKBTransaction;
    txFee: bigint;
    witnessIndex?: number;
}
export interface CancelParams extends BaseParams {
    orderOutPoints: Hex[];
    seller: Address;
}
export interface CancelResult {
    rawTx: CKBTransaction;
    txFee: bigint;
    witnessIndex?: number;
}
export {};
//# sourceMappingURL=dex.d.ts.map