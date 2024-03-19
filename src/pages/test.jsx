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

    const buyerAddr = connectData.address;

    const aggregator = new Aggregator('https://cota.nervina.dev/aggregator');

    const joyID = {
        connectData,
        aggregator
    };

    const orderOutPoints = [
        {
            txHash: '',
            index: '0x0',
        },
        {
            txHash: '',
            index: '0x0',
        }
    ];

    const { rawTx } = await buildTakerTx({
        collector,
        joyID,
        buyerAddr,
        orderOutPoints: orderOutPoints.map(serializeOutPoint),
        ckbAsset: CKBAsset.SPORE,
    });

    const signedTx = await signRawTransaction(rawTx, buyerAddr);

    return collector.getCkb().rpc.sendTransaction(signedTx, 'passthrough');
}