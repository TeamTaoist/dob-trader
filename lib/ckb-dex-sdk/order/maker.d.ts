/// <reference types="@nervosnetwork/ckb-types" />
import { MakerParams, MakerResult } from '../types';
import { CKBTransaction } from '@joyid/ckb';
export declare const calculateNFTMakerListPackage: (seller: string | CKBComponents.Script) => bigint;
export declare const buildMakerTx: ({ collector, joyID, seller, listAmount, totalValue, assetType, fee, ckbAsset, }: MakerParams) => Promise<MakerResult>;
export declare const buildMultiNftsMakerTx: ({ collector, joyID, seller, fee, ckbAsset }: MakerParams, nfts: {
    totalValue: bigint;
    assetType: string;
}[]) => Promise<{
    rawTx: CKBTransaction;
    txFee: bigint;
    listPackage: bigint;
    witnessIndex: number;
}>;
//# sourceMappingURL=maker.d.ts.map