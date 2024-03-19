import { connect, initConfig, signRawTransaction } from "@joyid/ckb";
import { Aggregator, buildTakerTx, CKBAsset, Collector } from "@nervina-labs/ckb-dex";
import { serializeOutPoint } from "@nervosnetwork/ckb-sdk-utils";
import Layout_ckb from "../components/layout.jsx";

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

    const orderOutPoints = [
        {
            txHash: '0x24dcaabc5da6e4dc4e4257b425d718507e1f891fb9e26df41e12dbe3d41afe50',
            index: '0x0',
        },
        {
            txHash: '0x484c581b5697839ac5adc0bf94894f60482f99f86286d9e8b080561435cf1440',
            index: '0x0',
        },
    ];

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