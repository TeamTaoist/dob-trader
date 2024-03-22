var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { addressToScript, blake160, getTransactionSize, serializeScript, serializeWitnessArgs } from '@nervosnetwork/ckb-sdk-utils';
import { getCotaTypeScript, getJoyIDCellDep, getDexCellDep, MAX_FEE, JOYID_ESTIMATED_WITNESS_LOCK_SIZE } from '../constants';
import { CKBAsset } from '../types';
import { append0x } from '../utils';
import { AssetException, NoCotaCellException, NoLiveCellException } from '../exceptions';
import { calculateEmptyCellMinCapacity, calculateNFTCellCapacity, calculateTransactionFee, cleanUpUdtOutputs as cleanUpUdtOutputs, deserializeOutPoints, generateSporeCoBuild, getAssetCellDep, isUdtAsset, } from './helper';
import { OrderArgs } from './orderArgs';
export const buildCancelTx = ({ collector, joyID, seller, orderOutPoints, fee, ckbAsset = CKBAsset.XUDT, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    var _d;
    let txFee = fee !== null && fee !== void 0 ? fee : MAX_FEE;
    const isMainnet = seller.startsWith('ckb');
    const sellerLock = addressToScript(seller);
    const emptyCells = yield collector.getCells({
        lock: sellerLock,
    });
    if (!emptyCells || emptyCells.length === 0) {
        throw new NoLiveCellException('The address has no empty cells');
    }
    const outPoints = deserializeOutPoints(orderOutPoints);
    let orderInputsCapacity = BigInt(0);
    // Fetch udt order cells with outPoints
    const orderCells = [];
    try {
        for (var _e = true, outPoints_1 = __asyncValues(outPoints), outPoints_1_1; outPoints_1_1 = yield outPoints_1.next(), _a = outPoints_1_1.done, !_a; _e = true) {
            _c = outPoints_1_1.value;
            _e = false;
            const outPoint = _c;
            const cell = yield collector.getLiveCell(outPoint);
            if (!cell) {
                throw new AssetException('The asset cell specified by the out point has been spent');
            }
            const orderArgs = OrderArgs.fromHex(cell.output.lock.args);
            if (serializeScript(orderArgs.ownerLock) !== serializeScript(sellerLock)) {
                throw new AssetException('The asset cell does not belong to the seller address');
            }
            if (!cell.output.type || !cell.data) {
                throw new AssetException('The asset cell specified by the out point must have type script');
            }
            orderInputsCapacity += BigInt(cell.output.capacity);
            orderCells.push(cell);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_e && !_a && (_b = outPoints_1.return)) yield _b.call(outPoints_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    const orderInputs = outPoints.map(outPoint => ({
        previousOutput: outPoint,
        since: '0x0',
    }));
    let inputs = [];
    let outputs = [];
    let outputsData = [];
    let cellDeps = [getDexCellDep(isMainnet)];
    let changeCapacity = BigInt(0);
    let sporeCoBuild = '0x';
    const minCellCapacity = calculateEmptyCellMinCapacity(sellerLock);
    const errMsg = `Insufficient CKB available balance to pay transaction fee`;
    const { inputs: emptyInputs, capacity: inputsCapacity } = collector.collectInputs(emptyCells, minCellCapacity, txFee, BigInt(0), errMsg);
    inputs = [...orderInputs, ...emptyInputs];
    if (isUdtAsset(ckbAsset)) {
        const { udtOutputs, udtOutputsData, sumUdtCapacity } = cleanUpUdtOutputs(orderCells, sellerLock);
        outputs = udtOutputs;
        outputsData = udtOutputsData;
        changeCapacity = inputsCapacity + orderInputsCapacity - sumUdtCapacity - txFee;
    }
    else {
        let sumNftCapacity = BigInt(0);
        for (const orderCell of orderCells) {
            const minNFTCapacity = calculateNFTCellCapacity(sellerLock, orderCell);
            outputs.push(Object.assign(Object.assign({}, orderCell.output), { lock: sellerLock, capacity: append0x(minNFTCapacity.toString(16)) }));
            sumNftCapacity += minNFTCapacity;
            outputsData.push((_d = orderCell.data) === null || _d === void 0 ? void 0 : _d.content);
        }
        if (ckbAsset === CKBAsset.SPORE) {
            sporeCoBuild = generateSporeCoBuild(orderCells, outputs);
        }
        changeCapacity = inputsCapacity + orderInputsCapacity - sumNftCapacity - txFee;
    }
    const changeOutput = {
        lock: sellerLock,
        capacity: append0x(changeCapacity.toString(16)),
    };
    outputs.push(changeOutput);
    outputsData.push('0x');
    cellDeps.push(getAssetCellDep(ckbAsset, isMainnet));
    if (joyID) {
        cellDeps.push(getJoyIDCellDep(isMainnet));
    }
    const emptyWitness = { lock: '', inputType: '', outputType: '' };
    const witnesses = inputs.map((_, index) => (index === orderInputs.length ? serializeWitnessArgs(emptyWitness) : '0x'));
    if (ckbAsset === CKBAsset.SPORE) {
        witnesses.push(sporeCoBuild);
    }
    if (joyID && joyID.connectData.keyType === 'sub_key') {
        const pubkeyHash = append0x(blake160(append0x(joyID.connectData.pubkey), 'hex'));
        const req = {
            lockScript: serializeScript(sellerLock),
            pubkeyHash,
            algIndex: 1, // secp256r1
        };
        const { unlockEntry } = yield joyID.aggregator.generateSubkeyUnlockSmt(req);
        const emptyWitness = {
            lock: '',
            inputType: '',
            outputType: append0x(unlockEntry),
        };
        witnesses[orderInputs.length] = serializeWitnessArgs(emptyWitness);
        const cotaType = getCotaTypeScript(isMainnet);
        const cotaCells = yield collector.getCells({ lock: sellerLock, type: cotaType });
        if (!cotaCells || cotaCells.length === 0) {
            throw new NoCotaCellException("Cota cell doesn't exist");
        }
        const cotaCell = cotaCells[0];
        const cotaCellDep = {
            outPoint: cotaCell.outPoint,
            depType: 'code',
        };
        cellDeps = [cotaCellDep, ...cellDeps];
    }
    const tx = {
        version: '0x0',
        cellDeps,
        headerDeps: [],
        inputs,
        outputs,
        outputsData,
        witnesses,
    };
    if (txFee === MAX_FEE) {
        const txSize = getTransactionSize(tx) + (joyID ? JOYID_ESTIMATED_WITNESS_LOCK_SIZE : 0);
        const estimatedTxFee = calculateTransactionFee(txSize);
        txFee = estimatedTxFee;
        const estimatedChangeCapacity = changeCapacity + (MAX_FEE - estimatedTxFee);
        tx.outputs[tx.outputs.length - 1].capacity = append0x(estimatedChangeCapacity.toString(16));
    }
    return { rawTx: tx, txFee, witnessIndex: orderInputs.length };
});
