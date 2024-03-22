var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { addressToScript, blake160, getTransactionSize, serializeScript, serializeWitnessArgs } from '@nervosnetwork/ckb-sdk-utils';
import { blockchain } from '@ckb-lumos/base';
import { getDexLockScript, getCotaTypeScript, getJoyIDCellDep, MAX_FEE, JOYID_ESTIMATED_WITNESS_LOCK_SIZE, CKB_UNIT, } from '../constants';
import { CKBAsset } from '../types';
import { append0x, remove0x, u128ToLe } from '../utils';
import { AssetException, NoCotaCellException, NoLiveCellException, NFTException, NoSupportSUDTAssetException } from '../exceptions';
import { calculateEmptyCellMinCapacity, calculateNFTCellCapacity, calculateTransactionFee, calculateUdtCellCapacity, generateSporeCoBuild, getAssetCellDep, isUdtAsset, } from './helper';
import { OrderArgs } from './orderArgs';
// The difference between the capacity occupied by the owner lock and the seller lock and the result may be negative
export const calculateNFTMakerListPackage = (seller) => {
    const sellerLock = typeof seller === 'string' ? addressToScript(seller) : seller;
    const sellerLockArgsSize = remove0x(sellerLock.args).length / 2;
    // The setup and totalValue are only used as a placeholder and does not affect the final size calculation.
    const setup = 4;
    const totalValue = BigInt(0);
    const orderArgs = new OrderArgs(sellerLock, setup, totalValue);
    const orderArgsSize = remove0x(orderArgs.toHex()).length / 2;
    return BigInt(orderArgsSize - sellerLockArgsSize) * CKB_UNIT;
};
export const buildMakerTx = ({ collector, joyID, seller, listAmount = BigInt(0), totalValue, assetType, fee, ckbAsset = CKBAsset.XUDT, }) => __awaiter(void 0, void 0, void 0, function* () {
    let txFee = fee !== null && fee !== void 0 ? fee : MAX_FEE;
    const isMainnet = seller.startsWith('ckb');
    const sellerLock = addressToScript(seller);
    const assetTypeScript = blockchain.Script.unpack(assetType);
    const emptyCells = yield collector.getCells({
        lock: sellerLock,
    });
    if (!emptyCells || emptyCells.length === 0) {
        throw new NoLiveCellException('The address has no empty cells');
    }
    const setup = isUdtAsset(ckbAsset) ? 0 : 4;
    const orderArgs = new OrderArgs(sellerLock, setup, totalValue);
    const orderLock = Object.assign(Object.assign({}, getDexLockScript(isMainnet)), { args: orderArgs.toHex() });
    const minCellCapacity = calculateEmptyCellMinCapacity(sellerLock);
    let inputs = [];
    let outputs = [];
    let outputsData = [];
    let cellDeps = [];
    let changeCapacity = BigInt(0);
    let orderCellCapacity = BigInt(0);
    let sporeCoBuild = '0x';
    if (isUdtAsset(ckbAsset)) {
        const udtCells = yield collector.getCells({
            lock: sellerLock,
            type: assetTypeScript,
        });
        if (!udtCells || udtCells.length === 0) {
            throw new AssetException('The address has no UDT cells');
        }
        const { inputs: udtInputs, capacity: udtInputsCapacity, amount: inputsAmount } = collector.collectUdtInputs(udtCells, listAmount);
        orderCellCapacity = calculateUdtCellCapacity(orderLock, assetTypeScript);
        const orderNeedCapacity = orderCellCapacity - udtInputsCapacity;
        const needCKB = ((orderNeedCapacity + minCellCapacity + CKB_UNIT) / CKB_UNIT).toString();
        const errMsg = `At least ${needCKB} free CKB (refundable) is required to place a sell order.`;
        const { inputs: emptyInputs, capacity: emptyInputsCapacity } = collector.collectInputs(emptyCells, orderNeedCapacity, txFee, minCellCapacity, errMsg);
        inputs = [...emptyInputs, ...udtInputs];
        outputs.push({
            lock: orderLock,
            type: assetTypeScript,
            capacity: append0x(orderCellCapacity.toString(16)),
        });
        outputsData.push(append0x(u128ToLe(listAmount)));
        changeCapacity = emptyInputsCapacity - orderNeedCapacity - txFee;
        if (inputsAmount > listAmount) {
            const udtCellCapacity = calculateUdtCellCapacity(sellerLock, assetTypeScript);
            changeCapacity -= udtCellCapacity;
            outputs.push({
                lock: sellerLock,
                type: assetTypeScript,
                capacity: append0x(udtCellCapacity.toString(16)),
            });
            outputsData.push(append0x(u128ToLe(inputsAmount - listAmount)));
        }
        outputs.push({
            lock: sellerLock,
            capacity: append0x(changeCapacity.toString(16)),
        });
        outputsData.push('0x');
    }
    else {
        const nftCells = yield collector.getCells({
            lock: sellerLock,
            type: assetTypeScript,
        });
        if (!nftCells || nftCells.length === 0) {
            throw new NFTException('The address has no NFT cells');
        }
        const nftCell = nftCells[0];
        orderCellCapacity = calculateNFTCellCapacity(orderLock, nftCell);
        const nftInputCapacity = BigInt(nftCell.output.capacity);
        const orderNeedCapacity = orderCellCapacity - nftInputCapacity;
        const needCKB = ((orderNeedCapacity + minCellCapacity + CKB_UNIT) / CKB_UNIT).toString();
        const errMsg = `At least ${needCKB} free CKB (refundable) is required to place a sell order.`;
        const { inputs: emptyInputs, capacity: emptyInputsCapacity } = collector.collectInputs(emptyCells, orderNeedCapacity, txFee, minCellCapacity, errMsg);
        const nftInput = {
            previousOutput: nftCell.outPoint,
            since: '0x0',
        };
        inputs = [...emptyInputs, nftInput];
        const orderOutput = {
            lock: orderLock,
            capacity: append0x(orderCellCapacity.toString(16)),
            type: nftCell.output.type,
        };
        outputs.push(orderOutput);
        outputsData.push(nftCell.outputData);
        changeCapacity = emptyInputsCapacity - orderNeedCapacity - txFee;
        outputs.push({
            lock: sellerLock,
            capacity: append0x(changeCapacity.toString(16)),
        });
        outputsData.push('0x');
        if (ckbAsset === CKBAsset.SPORE) {
            sporeCoBuild = generateSporeCoBuild([nftCell], [orderOutput]);
        }
    }
    cellDeps.push(getAssetCellDep(ckbAsset, isMainnet));
    if (joyID) {
        cellDeps.push(getJoyIDCellDep(isMainnet));
    }
    const emptyWitness = { lock: '', inputType: '', outputType: '' };
    let witnesses = inputs.map((_, index) => (index === 0 ? serializeWitnessArgs(emptyWitness) : '0x'));
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
        witnesses[0] = serializeWitnessArgs(emptyWitness);
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
    const listPackage = isUdtAsset(ckbAsset) ? orderCellCapacity : calculateNFTMakerListPackage(seller);
    return { rawTx: tx, txFee, listPackage, witnessIndex: 0 };
});
export const buildMultiNftsMakerTx = ({ collector, joyID, seller, fee, ckbAsset = CKBAsset.SPORE }, nfts) => __awaiter(void 0, void 0, void 0, function* () {
    let txFee = fee !== null && fee !== void 0 ? fee : MAX_FEE;
    const isMainnet = seller.startsWith('ckb');
    const sellerLock = addressToScript(seller);
    const emptyCells = yield collector.getCells({
        lock: sellerLock,
    });
    if (!emptyCells || emptyCells.length === 0) {
        throw new NoLiveCellException('The address has no empty cells');
    }
    if (isUdtAsset(ckbAsset)) {
        throw new NoSupportSUDTAssetException('Just support nft asset');
    }
    const minCellCapacity = calculateEmptyCellMinCapacity(sellerLock);
    let inputs = [];
    let outputs = [];
    let outputsData = [];
    let cellDeps = [];
    let changeCapacity = BigInt(0);
    let sporeCoBuild = '';
    if (!isUdtAsset(ckbAsset)) {
        let orderNeedCapacity = BigInt(0);
        let nftCellList = [];
        for (let i = 0; i < nfts.length; i++) {
            const nft = nfts[i];
            const assetTypeScript = blockchain.Script.unpack(nft.assetType);
            const setup = isUdtAsset(ckbAsset) ? 0 : 4;
            const orderArgs = new OrderArgs(sellerLock, setup, nft.totalValue);
            const orderLock = Object.assign(Object.assign({}, getDexLockScript(isMainnet)), { args: orderArgs.toHex() });
            const nftCells = yield collector.getCells({
                lock: sellerLock,
                type: assetTypeScript,
            });
            if (!nftCells || nftCells.length === 0) {
                throw new NFTException('The address has no NFT cells');
            }
            const nftCell = nftCells[0];
            const orderCellCapacity = calculateNFTCellCapacity(orderLock, nftCell);
            const nftInputCapacity = BigInt(nftCell.output.capacity);
            const oneOrderNeedCellCapacity = orderCellCapacity - nftInputCapacity;
            orderNeedCapacity = orderNeedCapacity + oneOrderNeedCellCapacity;
            nftCellList.push({
                nftCell,
                orderLock,
                orderCellCapacity,
            });
        }
        const needCKB = ((orderNeedCapacity + minCellCapacity + CKB_UNIT) / CKB_UNIT).toString();
        const errMsg = `At least ${needCKB} free CKB (refundable) is required to place a sell order.`;
        const { inputs: emptyInputs, capacity: emptyInputsCapacity } = collector.collectInputs(emptyCells, orderNeedCapacity, txFee, minCellCapacity, errMsg);
        const nftInputList = [];
        let sporeCoBuildNftCellList = [];
        let sporeCoBuildOutputList = [];
        for (let i = 0; i < nftCellList.length; i++) {
            const nftCell = nftCellList[i].nftCell;
            const orderLock = nftCellList[i].orderLock;
            const orderCellCapacity = nftCellList[i].orderCellCapacity;
            const nftInput = {
                previousOutput: nftCell.outPoint,
                since: '0x0',
            };
            nftInputList.push(nftInput);
            const orderOutput = {
                lock: orderLock,
                capacity: append0x(orderCellCapacity.toString(16)),
                type: nftCell.output.type,
            };
            outputs.push(orderOutput);
            outputsData.push(nftCell.outputData);
            if (ckbAsset === CKBAsset.SPORE) {
                sporeCoBuildNftCellList.push(nftCell);
                sporeCoBuildOutputList.push(orderOutput);
            }
        }
        inputs = [...emptyInputs, ...nftInputList];
        if (ckbAsset === CKBAsset.SPORE) {
            sporeCoBuild = generateSporeCoBuild(sporeCoBuildNftCellList, sporeCoBuildOutputList);
        }
        changeCapacity = emptyInputsCapacity - orderNeedCapacity - txFee;
        outputs.push({
            lock: sellerLock,
            capacity: append0x(changeCapacity.toString(16)),
        });
        outputsData.push('0x');
    }
    cellDeps.push(getAssetCellDep(ckbAsset, isMainnet));
    if (joyID) {
        cellDeps.push(getJoyIDCellDep(isMainnet));
    }
    const emptyWitness = { lock: '', inputType: '', outputType: '' };
    let witnesses = inputs.map((_, index) => (index === 0 ? serializeWitnessArgs(emptyWitness) : '0x'));
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
        witnesses[0] = serializeWitnessArgs(emptyWitness);
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
    const listPackage = calculateNFTMakerListPackage(seller);
    return { rawTx: tx, txFee, listPackage, witnessIndex: 0 };
});
