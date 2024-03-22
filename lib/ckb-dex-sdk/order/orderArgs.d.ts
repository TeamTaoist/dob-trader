/// <reference types="@nervosnetwork/ckb-types" />
import { Hex } from '../types';
export declare class OrderArgs {
    ownerLock: CKBComponents.Script;
    setup: number;
    totalValue: bigint;
    constructor(ownerLock: CKBComponents.Script, setup: number, totalValue: bigint);
    static fromHex(args: Hex): {
        ownerLock: CKBComponents.Script;
        setup: number;
        totalValue: bigint;
    };
    toHex(): Hex;
}
//# sourceMappingURL=orderArgs.d.ts.map