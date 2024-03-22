import { ec as EC } from 'elliptic';
import { Address, Hex } from '../types';
export declare const keyFromP256Private: (privateKey: Uint8Array | Hex) => EC.KeyPair;
export declare const getPublicKey: (key: EC.KeyPair) => string;
export declare const addressFromP256PrivateKey: (privateKey: Uint8Array | Hex, isMainnet?: boolean) => Address;
export declare const pubkeyFromP256PrivateKey: (privateKey: Uint8Array | Hex) => string;
//# sourceMappingURL=crypto.d.ts.map