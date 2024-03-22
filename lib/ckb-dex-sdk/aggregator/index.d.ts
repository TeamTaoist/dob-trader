import { SubkeyUnlockReq, SubkeyUnlockResp } from '../types/joyid';
export declare class Aggregator {
    private url;
    constructor(url: string);
    private baseRPC;
    generateSubkeyUnlockSmt(req: SubkeyUnlockReq): Promise<SubkeyUnlockResp>;
}
//# sourceMappingURL=index.d.ts.map