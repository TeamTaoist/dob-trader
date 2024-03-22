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
import { getCotaTypeScript, getJoyIDCellDep, getDexCellDep, MAX_FEE, JOYID_ESTIMATED_WITNESS_LOCK_SIZE, CKB_UNIT } from '../constants';
import { CKBAsset } from '../types';
import { append0x } from '../utils';
import { AssetException, NoCotaCellException, NoLiveCellException } from '../exceptions';
import { calculateEmptyCellMinCapacity, calculateTransactionFee, deserializeOutPoints, cleanUpUdtOutputs, isUdtAsset, calculateNFTCellCapacity, generateSporeCoBuild, getAssetCellDep, } from './helper';
import { OrderArgs } from './orderArgs';
import { calculateNFTMakerListPackage } from './maker';
export const matchOrderOutputs = (orderCells) => {
    const sellerOutputs = [];
    const sellerOutputsData = [];
    let sumSellerCapacity = BigInt(0);
    for (const orderCell of orderCells) {
        const orderArgs = OrderArgs.fromHex(orderCell.output.lock.args);
        sumSellerCapacity += orderArgs.totalValue;
        const payCapacity = orderArgs.totalValue + BigInt(append0x(orderCell.output.capacity));
        const output = {
            lock: orderArgs.ownerLock,
            capacity: append0x(payCapacity.toString(16)),
        };
        sellerOutputs.push(output);
        sellerOutputsData.push('0x');
    }
    return { sellerOutputs, sellerOutputsData, sumSellerCapacity };
};
export const matchNftOrderCells = (orderCells, buyerLock) => {
    var _a;
    let dexOutputs = [];
    let dexOutputsData = [];
    let makerNetworkFee = BigInt(0);
    let dexOutputsCapacity = BigInt(0);
    const buyerOutputs = [];
    const buyerOutputsData = [];
    for (const orderCell of orderCells) {
        const orderArgs = OrderArgs.fromHex(orderCell.output.lock.args);
        dexOutputsCapacity += orderArgs.totalValue;
        const output = {
            lock: orderArgs.ownerLock,
            capacity: append0x(orderArgs.totalValue.toString(16)),
        };
        dexOutputs.push(output);
        dexOutputsData.push('0x');
        makerNetworkFee += calculateNFTMakerListPackage(orderArgs.ownerLock);
        const buyerNftCapacity = calculateNFTCellCapacity(buyerLock, orderCell);
        buyerOutputs.push({
            lock: buyerLock,
            type: orderCell.output.type,
            capacity: `0x${buyerNftCapacity.toString(16)}`,
        });
        buyerOutputsData.push((_a = orderCell.data) === null || _a === void 0 ? void 0 : _a.content);
    }
    dexOutputs = dexOutputs.concat(buyerOutputs);
    dexOutputsData = dexOutputsData.concat(buyerOutputsData);
    return { dexOutputs, dexOutputsData, makerNetworkFee, dexOutputsCapacity };
};
export const buildTakerTx = ({ collector, joyID, buyer, orderOutPoints, fee, ckbAsset = CKBAsset.XUDT, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    let txFee = fee !== null && fee !== void 0 ? fee : MAX_FEE;
    const isMainnet = buyer.startsWith('ckb');
    const buyerLock = addressToScript(buyer);
    const emptyCells = yield collector.getCells({
        lock: buyerLock,
    });
    if (!emptyCells || emptyCells.length === 0) {
        throw new NoLiveCellException('The address has no empty cells');
    }
    // Deserialize outPointHex array to outPoint array
    const outPoints = deserializeOutPoints(orderOutPoints);
    // Fetch udt order cells with outPoints
    const orderCells = [];
    try {
        for (var _d = true, outPoints_1 = __asyncValues(outPoints), outPoints_1_1; outPoints_1_1 = yield outPoints_1.next(), _a = outPoints_1_1.done, !_a; _d = true) {
            _c = outPoints_1_1.value;
            _d = false;
            const outPoint = _c;
            const cell = yield collector.getLiveCell(outPoint);
            if (!cell) {
                throw new AssetException('The udt cell specified by the out point has been spent');
            }
            if (!cell.output.type || !cell.data) {
                throw new AssetException('The udt cell specified by the out point must have type script');
            }
            orderCells.push(cell);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = outPoints_1.return)) yield _b.call(outPoints_1);
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
    if (isUdtAsset(ckbAsset)) {
        const { sellerOutputs, sellerOutputsData, sumSellerCapacity } = matchOrderOutputs(orderCells);
        const { udtOutputs, udtOutputsData, sumUdtCapacity } = cleanUpUdtOutputs(orderCells, buyerLock);
        const needInputsCapacity = sumSellerCapacity + sumUdtCapacity;
        outputs = [...sellerOutputs, ...udtOutputs];
        outputsData = [...sellerOutputsData, ...udtOutputsData];
        const minCellCapacity = calculateEmptyCellMinCapacity(buyerLock);
        const needCKB = ((needInputsCapacity + minCellCapacity + CKB_UNIT) / CKB_UNIT).toString();
        const errMsg = `At least ${needCKB} free CKB is required to take the order.`;
        const { inputs: emptyInputs, capacity: inputsCapacity } = collector.collectInputs(emptyCells, needInputsCapacity, txFee, minCellCapacity, errMsg);
        inputs = [...orderInputs, ...emptyInputs];
        changeCapacity = inputsCapacity - needInputsCapacity - txFee;
        const changeOutput = {
            lock: buyerLock,
            capacity: append0x(changeCapacity.toString(16)),
        };
        outputs.push(changeOutput);
        outputsData.push('0x');
    }
    else {
        const { dexOutputs, dexOutputsData, makerNetworkFee, dexOutputsCapacity } = matchNftOrderCells(orderCells, buyerLock);
        outputs = dexOutputs;
        outputsData = dexOutputsData;
        const minCellCapacity = calculateEmptyCellMinCapacity(buyerLock);
        const needCKB = ((dexOutputsCapacity + minCellCapacity + CKB_UNIT) / CKB_UNIT).toString();
        const errMsg = `At least ${needCKB} free CKB is required to take the order.`;
        const { inputs: emptyInputs, capacity: inputsCapacity } = collector.collectInputs(emptyCells, dexOutputsCapacity, txFee, minCellCapacity, errMsg);
        inputs = [...orderInputs, ...emptyInputs];
        if (ckbAsset === CKBAsset.SPORE) {
            const sporeOutputs = dexOutputs.slice(orderCells.length);
            sporeCoBuild = generateSporeCoBuild(orderCells, sporeOutputs);
        }
        changeCapacity = inputsCapacity + makerNetworkFee - dexOutputsCapacity - txFee;
        const changeOutput = {
            lock: buyerLock,
            capacity: append0x(changeCapacity.toString(16)),
        };
        outputs.push(changeOutput);
        outputsData.push('0x');
    }
    cellDeps.push(getAssetCellDep(ckbAsset, isMainnet));
    if (joyID) {
        cellDeps.push(getJoyIDCellDep(isMainnet));
    }
    const emptyWitness = { lock: '', inputType: '', outputType: '' };
    const witnesses = inputs.map((_, index) => (index === orderInputs.length ? serializeWitnessArgs(emptyWitness) : '0x'));
    if (ckbAsset === CKBAsset.SPORE) {
        witnesses.push(sporeCoBuild);
    }
    else if (ckbAsset === CKBAsset.MNFT) {
        // MNFT must not be held and transferred by anyone-can-pay lock
        witnesses[0] = serializeWitnessArgs({ lock: '0x00', inputType: '', outputType: '' });
    }
    if (joyID && joyID.connectData.keyType === 'sub_key') {
        const pubkeyHash = append0x(blake160(append0x(joyID.connectData.pubkey), 'hex'));
        const req = {
            lockScript: serializeScript(buyerLock),
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
        const cotaCells = yield collector.getCells({ lock: buyerLock, type: cotaType });
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
