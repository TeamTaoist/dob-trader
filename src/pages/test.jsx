import { connect, initConfig, signRawTransaction } from "@joyid/ckb";
import { Aggregator, buildTakerTx, buildMakerTx, CKBAsset, Collector } from "@nervina-labs/ckb-dex";
import { serializeOutPoint } from "@nervosnetwork/ckb-sdk-utils";
import Layout_ckb from "../components/layout.jsx";
import { getDexLockScript, getSporeTypeScript, append0x, calculateNFTMakerListPackage, serializeScript } from "@nervina-labs/ckb-dex";
import { Client, cacheExchange, fetchExchange, gql } from "urql";
import { config, helpers } from "@ckb-lumos/lumos";

export default function Test() {

    // test take multi tx
    // <<
    // buildTakerTxExample().then(txHash => {
    //     console.info(`The taker of Spore asset has been finished with tx hash: ${txHash}`)
    // }).catch(err => {
    //     console.error(err);
    // })
    // >>

    // test maker multi tx
    // <<
    buildMakerTxExample().then(txHash => {
        console.info(`The maker of Spore asset has been finished with tx hash: ${txHash}`)
    }).catch(err => {
        console.error(err);
    })
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

    return <Layout_ckb>Test</Layout_ckb>
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
        }, 'desc', '0x3E8'
    ]);

    // cells order
    console.log(cells);

    const orderOutPoints = [];
    for (let i = 0; i < cells.objects.length && i < 3; i++) {
        const element = cells.objects[i];
        console.log(element);
        orderOutPoints.push({
            txHash: element.out_point.tx_hash,
            index: element.out_point.index,
        });
    }

    const { rawTx } = await buildTakerTx({
        collector,
        joyID,
        buyer,
        orderOutPoints: orderOutPoints.map(serializeOutPoint),
        ckbAsset: CKBAsset.SPORE,
    });

    const signedTx = await signRawTransaction(rawTx, buyer);

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

    const maker = connectData.address;

    const aggregator = new Aggregator('https://cota.nervina.dev/aggregator');

    const joyID = {
        connectData,
        aggregator
    };

    const dexLock = getDexLockScript(false);
    const sporeType = getSporeTypeScript(false);
    const spores = await getSporesByRPC(maker);


    const listPackage = calculateNFTMakerListPackage(maker)
    const totalValue = BigInt(800_0000_0000) + listPackage

    // const sporeType: CKBComponents.Script = {
    //     codeHash: '0x5e063b4c0e7abeaa6a428df3b693521a3050934cf3b0ae97a800d1bc31449398',
    //     hashType: 'data1',
    //     args: '0x22a0eb5644badac17316e17660bd5535f32665b806b1cbd243bb1dddbcca3bbd',
    // }

    const { rawTx } = await buildMakerTx({
        collector,
        joyID,
        maker,
        // The price whose unit is shannon for CKB native token
        totalValue,
        assetType: append0x(serializeScript(sporeType)),
        ckbAsset: CKBAsset.SPORE,
    })

    // You can call the `signRawTransaction` method to sign the raw tx with JoyID wallet through @joyid/ckb SDK
    // please make sure the buyer address is the JoyID wallet ckb address
    const signedTx = await signRawTransaction(rawTx, maker)

    let txHash = await collector.getCkb().rpc.sendTransaction(signedTx, 'passthrough')
    console.info(`The Spore asset has been listed with tx hash: ${txHash}`)

    return '';
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

async function getSporesByRPC(address, limit = 5, after) {
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