/// <reference types="@nervosnetwork/ckb-types" />
import { CKBAsset, Hex, IndexerCell } from '../types';
export declare const calculateUdtCellCapacity: (lock: CKBComponents.Script, udtType: CKBComponents.Script) => bigint;
export declare const calculateNFTCellCapacity: (lock: CKBComponents.Script, cell: IndexerCell | CKBComponents.LiveCell) => bigint;
export declare const calculateEmptyCellMinCapacity: (lock: CKBComponents.Script) => bigint;
export declare const calculateTransactionFee: (txSize: number) => bigint;
export declare const deserializeOutPoints: (outPointHexList: Hex[]) => CKBComponents.OutPoint[];
export declare const cleanUpUdtOutputs: (orderCells: CKBComponents.LiveCell[], lock: CKBComponents.Script) => {
    udtOutputs: CKBComponents.CellOutput[];
    udtOutputsData: string[];
    sumUdtCapacity: bigint;
};
export declare const isUdtAsset: (asset: CKBAsset) => boolean;
export declare const generateSporeCoBuild: (sporeCells: IndexerCell[] | CKBComponents.LiveCell[], outputCells: CKBComponents.CellOutput[]) => string;
export declare const getAssetCellDep: (asset: CKBAsset, isMainnet: boolean) => CKBComponents.CellDep;
//# sourceMappingURL=helper.d.ts.map