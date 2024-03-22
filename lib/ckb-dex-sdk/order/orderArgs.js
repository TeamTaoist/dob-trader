import { blockchain } from '@ckb-lumos/base';
import { OrderLockArgsException } from '../exceptions';
import { append0x, beToU128, leToU32, remove0x, u128ToBe, u8ToHex } from '../utils';
import { serializeScript } from '@nervosnetwork/ckb-sdk-utils';
export class OrderArgs {
    constructor(ownerLock, setup, totalValue) {
        this.ownerLock = ownerLock;
        this.setup = setup;
        this.totalValue = totalValue;
    }
    static fromHex(args) {
        const data = remove0x(args);
        if (data.length < 132) {
            throw new OrderLockArgsException('The length of dex lock args must not be smaller than 66bytes');
        }
        const ownerLockHexLen = leToU32(data.substring(0, 8)) * 2;
        const ownerLock = blockchain.Script.unpack(append0x(data.substring(0, ownerLockHexLen)));
        if (data.length < ownerLockHexLen + 34) {
            throw new OrderLockArgsException('The length of dex lock args is invalid');
        }
        const setup = parseInt(data.substring(ownerLockHexLen, ownerLockHexLen + 2), 16);
        const totalValue = beToU128(data.substring(ownerLockHexLen + 2, ownerLockHexLen + 34));
        return {
            ownerLock,
            setup,
            totalValue,
        };
    }
    toHex() {
        return `${serializeScript(this.ownerLock)}${u8ToHex(this.setup)}${u128ToBe(this.totalValue)}`;
    }
}
