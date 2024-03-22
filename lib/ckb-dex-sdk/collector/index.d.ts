/// <reference types="@nervosnetwork/ckb-types" />
import CKB from '@nervosnetwork/ckb-sdk-core';
import { IndexerCell, CollectResult, IndexerCapacity, CollectUdtResult as CollectUdtResult } from '../types/collector';
export declare class Collector {
    private ckbNodeUrl;
    private ckbIndexerUrl;
    constructor({ ckbNodeUrl, ckbIndexerUrl }: {
        ckbNodeUrl: string;
        ckbIndexerUrl: string;
    });
    getCkb(): CKB;
    getCells({ lock, type }: {
        lock?: CKBComponents.Script;
        type?: CKBComponents.Script;
    }): Promise<IndexerCell[] | undefined>;
    getCapacity(lock: CKBComponents.Script): Promise<IndexerCapacity | undefined>;
    collectInputs(liveCells: IndexerCell[], needCapacity: bigint, fee: bigint, minCapacity?: bigint, errMsg?: string): CollectResult;
    collectUdtInputs(liveCells: IndexerCell[], needAmount: bigint): CollectUdtResult;
    getLiveCell(outPoint: CKBComponents.OutPoint): Promise<CKBComponents.LiveCell>;
}
//# sourceMappingURL=index.d.ts.map