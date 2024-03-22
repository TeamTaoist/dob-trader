import { hexToBytes, bytesToHex } from '@nervosnetwork/ckb-sdk-utils';
export const remove0x = (hex) => {
    if (hex.startsWith('0x')) {
        return hex.substring(2);
    }
    return hex;
};
export const append0x = (hex) => {
    return (hex === null || hex === void 0 ? void 0 : hex.startsWith('0x')) ? hex : `0x${hex}`;
};
const ArrayBufferToHex = (arrayBuffer) => {
    return Array.prototype.map.call(new Uint8Array(arrayBuffer), x => ('00' + x.toString(16)).slice(-2)).join('');
};
export const u16ToBe = (u16) => {
    let buffer = new ArrayBuffer(2);
    let view = new DataView(buffer);
    view.setUint16(0, u16, false);
    return ArrayBufferToHex(buffer);
};
const u32ToHex = (u32, littleEndian) => {
    let buffer = new ArrayBuffer(4);
    let view = new DataView(buffer);
    view.setUint32(0, Number(u32), littleEndian);
    return ArrayBufferToHex(buffer);
};
export const u32ToBe = (u32) => {
    return u32ToHex(u32, false);
};
export const u32ToLe = (u32) => {
    return u32ToHex(u32, true);
};
export const u8ToHex = (u8) => {
    let buffer = new ArrayBuffer(1);
    let view = new DataView(buffer);
    view.setUint8(0, u8);
    return ArrayBufferToHex(buffer);
};
export const hexToU8 = (hex) => {
    const tmp = remove0x(hex);
    if (tmp.length !== 2) {
        throw new Error('The hex format length of u8 must be equal to 2');
    }
    return parseInt(tmp, 16);
};
export const u64ToLe = (u64) => {
    const val = u64.toString(16).padStart(16, '0');
    const viewLeft = u32ToLe(`0x${val.slice(8)}`);
    const viewRight = u32ToLe(`0x${val.slice(0, 8)}`);
    return `${viewLeft}${viewRight}`;
};
export const u64ToBe = (u64) => {
    const val = u64.toString(16).padStart(16, '0');
    const viewLeft = u32ToBe(`0x${val.slice(0, 8)}`);
    const viewRight = u32ToBe(`0x${val.slice(8)}`);
    return `${viewLeft}${viewRight}`;
};
export const u128ToLe = (u128) => {
    const val = u128.toString(16).padStart(32, '0');
    const viewLeft = u64ToLe(BigInt(`0x${val.slice(16)}`));
    const viewRight = u64ToLe(BigInt(`0x${val.slice(0, 16)}`));
    return `${viewLeft}${viewRight}`;
};
export const u128ToBe = (u128) => {
    const val = u128.toString(16).padStart(32, '0');
    const viewLeft = u64ToBe(BigInt(`0x${val.slice(0, 16)}`));
    const viewRight = u64ToBe(BigInt(`0x${val.slice(16)}`));
    return `${viewLeft}${viewRight}`;
};
export const beToU128 = (beHex) => {
    return BigInt(append0x(beHex));
};
export const leToU128 = (leHex) => {
    const bytes = hexToBytes(append0x(leHex));
    const beHex = `0x${bytes.reduceRight((pre, cur) => pre + cur.toString(16).padStart(2, '0'), '')}`;
    return BigInt(beHex);
};
export const leToU32 = (leHex) => {
    const bytes = hexToBytes(append0x(leHex));
    const beHex = `0x${bytes.reduceRight((pre, cur) => pre + cur.toString(16).padStart(2, '0'), '')}`;
    return parseInt(beHex, 16);
};
export const utf8ToHex = (text) => {
    let result = text.trim();
    if (result.startsWith('0x')) {
        return result;
    }
    result = bytesToHex(new TextEncoder().encode(result));
    return result;
};
export const hexToUtf8 = (hex) => {
    let result = hex.trim();
    try {
        result = new TextDecoder().decode(hexToBytes(result));
    }
    catch (error) {
        console.error('hexToUtf8 error:', error);
    }
    return result;
};
