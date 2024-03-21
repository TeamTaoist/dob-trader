import {config, helpers} from "@ckb-lumos/lumos";
import {
    Aggregator,
    append0x, buildCancelTx, buildMakerTx,
    buildTakerTx, calculateNFTMakerListPackage, CKBAsset,
    Collector,
    getDexLockScript,
    getSporeTypeScript, OrderArgs
} from "@nervina-labs/ckb-dex";
import {connect, initConfig, signRawTransaction} from "@joyid/ckb";
import {serializeOutPoint, serializeScript} from "@nervosnetwork/ckb-sdk-utils";
import {parseUnit} from "@ckb-lumos/bi";

async function baseRPC(
    method,
    req,
    url = "https://testnet.ckb.dev/rpc"
) {
    const payload = {
        id: 1,
        jsonrpc: '2.0',
        method,
        params: req ?? null,
    }
    const body = JSON.stringify(payload, null, '')

    const data = await fetch(url, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body,
    }).then((res) => res.json())

    if (data.error) {
        throw new Error(`RPC error: ${JSON.stringify(data.error)}`)
    }

    return data.result
}


export async function getSporesByRPC(address, limit = 5, after) {
    const lockScript = helpers.parseAddress(address, { config: config.TESTNET });

    const sporeType = getSporeTypeScript(false); // test network

    const limitHex = append0x(limit.toString(16));

    const paramList = [
        {
            script: {
                code_hash: lockScript.codeHash,
                hash_type: lockScript.hashType,
                args: lockScript.args,
            },
            script_type: 'lock',
            script_search_mode: "exact",
            filter: {
                script: {
                    code_hash: sporeType.codeHash,
                    hash_type: sporeType.hashType,
                    args: "0x",
                },
                script_search_mode: 'prefix',
                script_type: 'type',
            },
        }, 'desc', limitHex
    ];

    if (after) {
        paramList.push(after);
    }

    const cells = await baseRPC('get_cells', paramList);

    return cells;
}


export async function getmarket(limit = 5,after) {
    const dexLock = getDexLockScript(false);
    const sporeType = getSporeTypeScript(false);
    const limitHex = append0x(limit.toString(16));
    const paramList = [
        {
            script: {
                code_hash: dexLock.codeHash,
                hash_type: dexLock.hashType,
                args: "0x",
            },
            script_type: 'lock',
            script_search_mode: "prefix",
            filter: {
                script: {
                    code_hash: sporeType.codeHash,
                    hash_type: sporeType.hashType,
                    args: "0x",
                },
                script_search_mode: 'prefix',
                script_type: 'type',
            },
        }, 'asc', limitHex
    ];

    if (after) {
        paramList.push(after);
    }

    const cells = await baseRPC('get_cells', paramList);

    return cells;
}


export async function handleBuildTakerTx(connectData,account,selectArr) {
    // use test net
    const collector = new Collector({
        ckbNodeUrl: 'https://testnet.ckb.dev/rpc',
        ckbIndexerUrl: 'https://testnet.ckb.dev/indexer',
    });


    const buyer = account;

    const aggregator = new Aggregator('https://cota.nervina.dev/aggregator');

    const joyID = {
        connectData,
        aggregator
    };

    // const orderOutPoints = [];
    // for (let i = 0; i < selectArr.length && i < 3; i++) {
    //     const element = selectArr[i];
    //
    //     orderOutPoints.push({
    //         txHash: element.out_point.tx_hash,
    //         index: element.out_point.index,
    //     });
    // }



    const orderOutPoints = [];
    for (let i = 0; i < selectArr.length; i++) {
        const element = selectArr[i];
        console.log("====handleBuildTakerTx",element)
        let outputArgs = element.output.lock.args;
        if (outputArgs) {
            try {
                const orderArgs = OrderArgs.fromHex(outputArgs);
                console.log(orderArgs.totalValue, orderArgs.setup);

                if (orderArgs.totalValue < BigInt(200_0000_0000)) {
                    console.log(element);
                    orderOutPoints.push({
                        txHash: element.out_point.tx_hash,
                        index: element.out_point.index,
                    });
                    break;
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    console.log(orderOutPoints);
    const { rawTx, witnessIndex } = await buildTakerTx({
        collector,
        joyID,
        buyer,
        orderOutPoints: orderOutPoints.map(serializeOutPoint),
        ckbAsset: CKBAsset.SPORE,
    });

    console.log(rawTx)


    const signedTx = await signRawTransaction(rawTx, buyer, { config: config.TESTNET, witnessIndex });

    return collector.getCkb().rpc.sendTransaction(signedTx, 'passthrough');
}


export const handleList = async(connectData,account,price,selectItem) =>{
    const collector = new Collector({
        ckbNodeUrl: 'https://testnet.ckb.dev/rpc',
        ckbIndexerUrl: 'https://testnet.ckb.dev/indexer',
    });

    const seller = account;

    const aggregator = new Aggregator('https://cota.nervina.dev/aggregator');

    const joyID = {
        connectData,
        aggregator
    };

    const listPackage = calculateNFTMakerListPackage(seller)


    const totalValue = parseUnit(price,'ckb').add(listPackage) ;


    const sporeType = {
        ...getSporeTypeScript(false),
        args: selectItem.output.type.args,
    }
    const { rawTx } = await buildMakerTx({
        collector,
        joyID,
        seller,
        // The price whose unit is shannon for CKB native token
        totalValue,
        assetType: append0x(serializeScript(sporeType)),
        ckbAsset: CKBAsset.SPORE,
    })



    // You can call the `signRawTransaction` method to sign the raw tx with JoyID wallet through @joyid/ckb SDK
    // please make sure the buyer address is the JoyID wallet ckb address
    const signedTx = await signRawTransaction(rawTx, seller)

    return collector.getCkb().rpc.sendTransaction(signedTx, 'passthrough')
}

export async function getMySporeOrder(address,limit = 5,after) {
    const ownerlock = helpers.parseAddress(address, { config: config.TESTNET });
    const limitHex = append0x(limit.toString(16));
    const dexLock = getDexLockScript(false);
    const sporeType = getSporeTypeScript(false);

    const paramList = [
        {
            script: {
                code_hash: dexLock.codeHash,
                hash_type: dexLock.hashType,
                args: `${serializeScript(ownerlock)}`,
            },
            script_type: 'lock',
            script_search_mode: 'prefix',
            filter: {
                script: {
                    code_hash: sporeType.codeHash,
                    hash_type: sporeType.hashType,
                    args: "0x",
                },
                script_search_mode: 'prefix',
                script_type: 'type',
            },
        }, 'asc', limitHex
    ];
    if (after) {
        paramList.push(after);
    }
    const cells = await baseRPC('get_cells', paramList);

    return cells;
}

export  async function handleCancelOrder(connectData,account,selectItem) {
    // use test net
    const collector = new Collector({
        ckbNodeUrl: 'https://testnet.ckb.dev/rpc',
        ckbIndexerUrl: 'https://testnet.ckb.dev/indexer',
    });

    initConfig({
        name: "JoyID demo",
        logo: "https://fav.farm/🆔",
        joyidAppURL: "https://testnet.joyid.dev",
    });


    const seller = account;

    const aggregator = new Aggregator('https://cota.nervina.dev/aggregator');

    const joyID = {
        connectData,
        aggregator
    };

    const dexLock = getDexLockScript(false);
    const sporeType = getSporeTypeScript(false);
    const ownerlock = helpers.parseAddress(seller, { config: config.TESTNET });


    const orderOutPoints = [];
    for (let i = 0; i < selectItem.length; i++) {
        const element = selectItem[i];

        orderOutPoints.push({
            txHash: element.out_point.tx_hash,
            index: element.out_point.index,
        });
    }

    if (orderOutPoints.length <= 0) {
        throw new Error("not find order");
    }

    const { rawTx, witnessIndex } = await buildCancelTx({
        collector,
        joyID,
        seller,
        orderOutPoints: orderOutPoints.map(serializeOutPoint),
        ckbAsset: CKBAsset.SPORE,
    })

    console.log(rawTx);

    const signedTx = await signRawTransaction(rawTx, seller, { config: config.TESTNET, witnessIndex });

    console.log('signedTx', signedTx);

    return collector.getCkb().rpc.sendTransaction(signedTx, 'passthrough');
}
