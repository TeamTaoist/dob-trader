var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
import CKB from '@nervosnetwork/ckb-sdk-core';
import { toCamelcase } from '../utils/case-parser';
import { MIN_CAPACITY } from '../constants';
import { CapacityNotEnoughException, IndexerException, UdtAmountNotEnoughException } from '../exceptions';
import { leToU128 } from '../utils';
export class Collector {
    constructor({ ckbNodeUrl, ckbIndexerUrl }) {
        this.ckbNodeUrl = ckbNodeUrl;
        this.ckbIndexerUrl = ckbIndexerUrl;
    }
    getCkb() {
        return new CKB(this.ckbNodeUrl);
    }
    getCells({ lock, type }) {
        return __awaiter(this, void 0, void 0, function* () {
            let param;
            if (lock) {
                const filter = type
                    ? {
                        script: {
                            code_hash: type.codeHash,
                            hash_type: type.hashType,
                            args: type.args,
                        },
                    }
                    : {
                        script: null,
                        output_data_len_range: ['0x0', '0x1'],
                    };
                param = {
                    script: {
                        code_hash: lock.codeHash,
                        hash_type: lock.hashType,
                        args: lock.args,
                    },
                    script_type: 'lock',
                    script_search_mode: 'exact',
                    filter,
                };
            }
            else if (type) {
                param = {
                    script: {
                        code_hash: type.codeHash,
                        hash_type: type.hashType,
                        args: type.args,
                    },
                    script_search_mode: 'exact',
                    script_type: 'type',
                };
            }
            let payload = {
                id: 1,
                jsonrpc: '2.0',
                method: 'get_cells',
                params: [param, 'asc', '0x3E8'],
            };
            const body = JSON.stringify(payload, null, '  ');
            let response = (yield axios({
                method: 'post',
                url: this.ckbIndexerUrl,
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 20000,
                data: body,
            })).data;
            if (response.error) {
                console.error(response.error);
                throw new IndexerException('Get cells error');
            }
            else {
                return toCamelcase(response.result.objects);
            }
        });
    }
    getCapacity(lock) {
        return __awaiter(this, void 0, void 0, function* () {
            let payload = {
                id: 1,
                jsonrpc: '2.0',
                method: 'get_cells_capacity',
                params: [
                    {
                        script: {
                            code_hash: lock.codeHash,
                            hash_type: lock.hashType,
                            args: lock.args,
                        },
                        script_type: 'lock',
                    },
                ],
            };
            const body = JSON.stringify(payload, null, '  ');
            let response = (yield axios({
                method: 'post',
                url: this.ckbIndexerUrl,
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 20000,
                data: body,
            })).data;
            if (response.error) {
                console.error(response.error);
                throw new IndexerException('Get cells capacity error');
            }
            else {
                return toCamelcase(response.result);
            }
        });
    }
    collectInputs(liveCells, needCapacity, fee, minCapacity, errMsg) {
        const changeCapacity = minCapacity !== null && minCapacity !== void 0 ? minCapacity : MIN_CAPACITY;
        let inputs = [];
        let sum = BigInt(0);
        for (let cell of liveCells) {
            inputs.push({
                previousOutput: {
                    txHash: cell.outPoint.txHash,
                    index: cell.outPoint.index,
                },
                since: '0x0',
            });
            sum = sum + BigInt(cell.output.capacity);
            if (sum >= needCapacity + changeCapacity + fee) {
                break;
            }
        }
        if (sum < needCapacity + changeCapacity + fee) {
            const message = errMsg !== null && errMsg !== void 0 ? errMsg : 'Insufficient free CKB balance';
            throw new CapacityNotEnoughException(message);
        }
        return { inputs, capacity: sum };
    }
    collectUdtInputs(liveCells, needAmount) {
        let inputs = [];
        let sumCapacity = BigInt(0);
        let sumAmount = BigInt(0);
        for (let cell of liveCells) {
            inputs.push({
                previousOutput: {
                    txHash: cell.outPoint.txHash,
                    index: cell.outPoint.index,
                },
                since: '0x0',
            });
            sumCapacity = sumCapacity + BigInt(cell.output.capacity);
            sumAmount += leToU128(cell.outputData);
            if (sumAmount >= needAmount) {
                break;
            }
        }
        if (sumAmount < needAmount) {
            throw new UdtAmountNotEnoughException('Insufficient UDT balance');
        }
        return { inputs, capacity: sumCapacity, amount: sumAmount };
    }
    getLiveCell(outPoint) {
        return __awaiter(this, void 0, void 0, function* () {
            const ckb = new CKB(this.ckbNodeUrl);
            const { cell } = yield ckb.rpc.getLiveCell(outPoint, true);
            return cell;
        });
    }
}
