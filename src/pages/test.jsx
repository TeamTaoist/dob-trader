import { connect, initConfig, signRawTransaction } from "@joyid/ckb";
import { Aggregator, buildTakerTx, CKBAsset, Collector } from "@nervina-labs/ckb-dex";
import { serializeOutPoint } from "@nervosnetwork/ckb-sdk-utils";
import Layout_ckb from "../components/layout.jsx";
import { getDexLockScript, getSporeTypeScript } from "@nervina-labs/ckb-dex";

export default function Test() {

    buildTakerTxExample().then(txHash => {
        console.info(`The taker of Spore asset has been finished with tx hash: ${txHash}`)
    }).catch(err => {
        console.error(err);
    })

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
        }, 'asc', '0x3E8'
    ]);

    // cells order
    console.log(cells);

    const orderOutPoints = [];
    for (let i = 0; i < cells.objects.length && i < 3; i++) {
        const element = cells.objects[i];
        orderOutPoints.push(element.output_point);
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