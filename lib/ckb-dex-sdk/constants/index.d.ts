/// <reference types="@nervosnetwork/ckb-types" />
export declare const CKB_UNIT: bigint;
export declare const MAX_FEE: bigint;
export declare const MIN_CAPACITY: bigint;
export declare const WITNESS_NATIVE_MODE = "01";
export declare const WITNESS_SUBKEY_MODE = "02";
export declare const SECP256R1_PUBKEY_SIG_LEN: number;
export declare const JOYID_ESTIMATED_WITNESS_LOCK_SIZE: number;
export declare const getJoyIDLockScript: (isMainnet: boolean) => CKBComponents.Script;
export declare const getJoyIDCellDep: (isMainnet: boolean) => CKBComponents.CellDep;
export declare const getCotaTypeScript: (isMainnet: boolean) => CKBComponents.Script;
export declare const getCotaCellDep: (isMainnet: boolean) => CKBComponents.CellDep;
export declare const getDexLockScript: (isMainnet: boolean) => CKBComponents.Script;
export declare const getDexCellDep: (isMainnet: boolean) => CKBComponents.CellDep;
export declare const getXudtTypeScript: (isMainnet: boolean) => CKBComponents.Script;
export declare const getXudtDep: (isMainnet: boolean) => CKBComponents.CellDep;
export declare const getSudtTypeScript: (isMainnet: boolean) => CKBComponents.Script;
export declare const getSudtDep: (isMainnet: boolean) => CKBComponents.CellDep;
export declare const getSporeTypeScript: (isMainnet: boolean) => CKBComponents.Script;
export declare const getSporeDep: (isMainnet: boolean) => CKBComponents.CellDep;
export declare const getMNftTypeScript: (isMainnet: boolean) => CKBComponents.Script;
export declare const getMNftDep: (isMainnet: boolean) => CKBComponents.CellDep;
//# sourceMappingURL=index.d.ts.map