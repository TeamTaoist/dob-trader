import { blake160, hexToBytes, scriptToAddress } from '@nervosnetwork/ckb-sdk-utils';
import { ec as EC } from 'elliptic';
import { getJoyIDLockScript } from '../constants';
import { append0x, remove0x } from './hex';
export const keyFromP256Private = (privateKey) => {
    const privkey = typeof privateKey == 'string' ? remove0x(privateKey) : privateKey;
    const ec = new EC('p256');
    return ec.keyFromPrivate(privkey);
};
// uncompressed pubkey without 0x
export const getPublicKey = (key) => key.getPublic(false, 'hex').substring(2);
export const addressFromP256PrivateKey = (privateKey, isMainnet = false) => {
    const pubkey = append0x(getPublicKey(keyFromP256Private(privateKey)));
    const lock = Object.assign(Object.assign({}, getJoyIDLockScript(isMainnet)), { args: `0x0001${blake160(hexToBytes(pubkey), 'hex')}` });
    return scriptToAddress(lock, isMainnet);
};
export const pubkeyFromP256PrivateKey = (privateKey) => {
    return append0x(getPublicKey(keyFromP256Private(privateKey)));
};
