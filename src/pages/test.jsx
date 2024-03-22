import { connect, initConfig, signRawTransaction } from "@joyid/ckb";
import { Aggregator, buildTakerTx, buildMakerTx, CKBAsset, Collector } from "@nervina-labs/ckb-dex";
import { serializeOutPoint, serializeScript } from "@nervosnetwork/ckb-sdk-utils";
import Layout_ckb from "../components/layout.jsx";
import { getDexLockScript, getSporeTypeScript, append0x, calculateNFTMakerListPackage, OrderArgs, buildCancelTx } from "@nervina-labs/ckb-dex";
import { Client, cacheExchange, fetchExchange, gql } from "urql";
import { config, helpers } from "@ckb-lumos/lumos";
import {PAGE_SIZE} from "../utils/const.js";

export default function Test() {

    // test take multi tx
    // <<
    // buildTakerTxExample().then(txHash => {
    //     console.info(`The taker of Spore asset has been finished with tx hash: ${txHash}`)
    // }).catch(err => {
    //     console.error(err);
    // })
    // >>

    // test maker one tx
    // <<
    // buildMakerTxExample().then(txHash => {
    //     console.info(`The maker of Spore asset has been finished with tx hash: ${txHash}`)
    // }).catch(err => {
    //     console.error(err);
    // })
    // >>

    // test cancel multi order tx
    // <<
    // buildCancelTxExample().then(txHash => {
    //     console.info(`The maker of Spore asset has been finished with tx hash: ${txHash}`)
    // }).catch(err => {
    //     console.error(err);
    // })
    // >>

    // test get my spores
    // <<
    // initConfig({
    //     name: "JoyID demo",
    //     logo: "https://fav.farm/🆔",
    //     joyidAppURL: "https://testnet.joyid.dev",
    // });
    // connect().then(connection => {
    //     getSporesByRPC(connection.address).then(spores => {
    //         console.log(spores);
    //     });
    // });
    // >>

    // test get my order
    // <<
    // initConfig({
    //     name: "JoyID demo",
    //     logo: "https://fav.farm/🆔",
    //     joyidAppURL: "https://testnet.joyid.dev",
    // });
    // connect().then(connection => {
    //     getMySporeOrder(connection.address).then(orders => {
    //         console.log(orders);
    //     });
    // });
    // >>

    // test get transaction all info and status
    // <<
    getTransaction('0x56b8f7439e5c26b93140a0ae7ef927c0737c36c8077910ded8eba1a87c6f4000').then(info => {
        console.log("0x56b8f7439e5c26b93140a0ae7ef927c0737c36c8077910ded8eba1a87c6f4000 TxInfo:", info);
    });
    // >>

    return <Layout_ckb>Test</Layout_ckb>
}

async function getTransaction(txHash) {
    const txInfo = await baseRPC('get_transaction', [txHash]);
    return txInfo;
}

async function buildCancelTxExample() {
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

    const connectData = await connect();

    const seller = connectData.address;

    console.log("seller", seller);

    const aggregator = new Aggregator('https://cota.nervina.dev/aggregator');

    const joyID = {
        connectData,
        aggregator
    };

    const dexLock = getDexLockScript(false);
    const sporeType = getSporeTypeScript(false);
    const ownerlock = helpers.parseAddress(seller, { config: config.TESTNET });
    const cells = await baseRPC('get_cells', [
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
        }, 'asc', '0x3E8'
    ]);

    // cells order
    console.log(cells);

    const orderOutPoints = [];
    for (let i = 0; i < cells.objects.length; i++) {
        const element = cells.objects[i];

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

async function getMySporeOrder(address) {
    const ownerlock = helpers.parseAddress(address, { config: config.TESTNET });

    const dexLock = getDexLockScript(false);
    const sporeType = getSporeTypeScript(false);
    const cells = await baseRPC('get_cells', [
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
        }, 'asc', '0x3E8'
    ]);

    return cells;
}


async function buildTakerTxExample() {
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

    const connectData = await connect();

    const buyer = connectData.address;

    console.log("buyer", buyer);

    const aggregator = new Aggregator('https://cota.nervina.dev/aggregator');

    const joyID = {
        connectData,
        aggregator
    };

    const dexLock = getDexLockScript(false);
    const sporeType = getSporeTypeScript(false);
    const cells = await baseRPC('get_cells', [
        {
            script: {
                code_hash: dexLock.codeHash,
                hash_type: dexLock.hashType,
                args: "0x",
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
        }, 'asc', '0x3E8'
    ]);

    // cells order
    console.log(cells);

    const orderOutPoints = [];
    for (let i = 0; i < cells.objects.length; i++) {
        const element = cells.objects[i];

        let outputArgs = element.output.lock.args;
        if (outputArgs) {
            try {
                const orderArgs = OrderArgs.fromHex(outputArgs);
                console.log(orderArgs.totalValue, orderArgs.setup);

                if (orderArgs.totalValue < BigInt(2000_0000_0000)) {
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

    if (orderOutPoints.length <= 0) {
        throw new Error("not find order");
    }

    let { rawTx, witnessIndex } = await buildTakerTx({
        collector,
        joyID,
        buyer,
        orderOutPoints: orderOutPoints.map(serializeOutPoint),
        ckbAsset: CKBAsset.SPORE,
    });

    console.log(rawTx);

    const signedTx = await signRawTransaction(rawTx, buyer, { config: config.TESTNET, witnessIndex });

    console.log('signedTx', signedTx);

    return collector.getCkb().rpc.sendTransaction(signedTx, 'passthrough');
}

async function buildMakerTxExample() {
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

    const connectData = await connect();

    const seller = connectData.address;

    console.log('maker', seller, connectData);

    const aggregator = new Aggregator('https://cota.nervina.dev/aggregator');

    const joyID = {
        connectData,
        aggregator
    };

    const spores = await getSporesByRPC(seller);
    console.log(spores);

    if (spores.objects.length <= 0) {
        throw new Error("not find can maker spore");
    }

    const listPackage = calculateNFTMakerListPackage(seller)
    const totalValue = BigInt(100_0000_0000) + listPackage

    console.log(totalValue);

    const sporeType = {
        ...getSporeTypeScript(false),
        args: spores.objects[0].output.type.args,
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

    console.log(rawTx);

    // You can call the `signRawTransaction` method to sign the raw tx with JoyID wallet through @joyid/ckb SDK
    // please make sure the buyer address is the JoyID wallet ckb address
    const signedTx = await signRawTransaction(rawTx, seller)

    console.log('signed tx', signedTx);

    return collector.getCkb().rpc.sendTransaction(signedTx, 'passthrough')
}

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


async function getSpores(addresses, first, after) {


    const query_getNFTs = gql`
        query getNFTs(
            $filter: SporeFilterInput
            $first: Int
            $order: QueryOrder
            $after: String
        ) {
            spores(filter: $filter, first: $first, order: $order, after: $after) {
            capacityMargin
            codeHash
            cluster {
                codeHash
                description
                id
                name
            }
            cell {
                cellOutput {
                capacity
                lock {
                    args
                    codeHash
                    hashType
                }
                type {
                    args
                    codeHash
                    hashType
                }
                }
            }
            id
            }
        }
        `;

    let order = "desc";

    const client = new Client({
        url: "https://spore-graphql.vercel.app/api/graphql",
        exchanges: [cacheExchange, fetchExchange],
    });

    const spores = await client
        .query(query_getNFTs, {
            filter: {
                addresses: addresses,
            },
            first: first,
            after: after,
            order: order,
        })
        .toPromise()
        .then((res) => res.data)
        .catch((err) => {
            console.error(err);
        });

    return spores;
}

async function getSporesByRPC(address, limit = PAGE_SIZE, after) {
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