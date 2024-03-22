/// <reference types="@nervosnetwork/ckb-types" />
import { TakerParams, TakerResult } from '../types';
export declare const matchOrderOutputs: (orderCells: CKBComponents.LiveCell[]) => {
    sellerOutputs: CKBComponents.CellOutput[];
    sellerOutputsData: string[];
    sumSellerCapacity: bigint;
};
export declare const matchNftOrderCells: (orderCells: CKBComponents.LiveCell[], buyerLock: CKBComponents.Script) => {
    dexOutputs: CKBComponents.CellOutput[];
    dexOutputsData: string[];
    makerNetworkFee: bigint;
    dexOutputsCapacity: bigint;
};
export declare const buildTakerTx: ({ collector, joyID, buyer, orderOutPoints, fee, ckbAsset, }: TakerParams) => Promise<TakerResult>;
//# sourceMappingURL=taker.d.ts.map