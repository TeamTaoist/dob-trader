import { Indexer, helpers, utils } from "@ckb-lumos/lumos";
import {
  Aggregator,
  append0x,
  buildCancelTx,
  buildMakerTx,
  buildTakerTx,
  calculateNFTMakerListPackage,
  CKBAsset,
  Collector,
  getDexLockScript,
  getSporeTypeScript,
  OrderArgs,
} from "../../lib/ckb-dex-sdk/index";
import { initConfig, signRawTransaction } from "@joyid/ckb";
import {
  serializeOutPoint,
  serializeScript,
} from "@nervosnetwork/ckb-sdk-utils";
import { parseUnit } from "@ckb-lumos/bi";
import { buildMultiNftsMakerTx } from "../../lib/ckb-dex-sdk/order/maker";

import {
  CKB_NODE_RPC_URL,
  CKB_INDEXER_URL,
  DOB_AGGREGATOR_URL,
  JOYID_APP_URL,
  CONFIG,
  isMainnet,
  PAGE_SIZE,
} from "../utils/const";

initConfig({
  name: "JoyID",
  logo: "https://fav.farm/🆔",
  joyidAppURL: JOYID_APP_URL,
  network: isMainnet ? "mainnet" : "testnet",
});

async function baseRPC(method, req, url = CKB_NODE_RPC_URL) {
  const payload = {
    id: 1,
    jsonrpc: "2.0",
    method,
    params: req ?? null,
  };
  const body = JSON.stringify(payload, null, "");

  const data = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  }).then((res) => res.json());

  if (data.error) {
    throw new Error(`RPC error: ${JSON.stringify(data.error)}`);
  }

  return data.result;
}

export async function getSporesByRPC(address, limit = PAGE_SIZE, after) {
  const lockScript = helpers.parseAddress(address, { config: CONFIG });

  const sporeType = getSporeTypeScript(isMainnet);

  const limitHex = append0x(limit.toString(16));

  const paramList = [
    {
      script: {
        code_hash: lockScript.codeHash,
        hash_type: lockScript.hashType,
        args: lockScript.args,
      },
      script_type: "lock",
      script_search_mode: "exact",
      filter: {
        script: {
          code_hash: sporeType.codeHash,
          hash_type: sporeType.hashType,
          args: "0x",
        },
        script_search_mode: "prefix",
        script_type: "type",
      },
    },
    "desc",
    limitHex,
  ];

  if (after) {
    paramList.push(after);
  }

  const cells = await baseRPC("get_cells", paramList);

  return cells;
}

export async function getmarket(limit = PAGE_SIZE, page = 0) {
  const dexLock = getDexLockScript(isMainnet);
  const sporeType = getSporeTypeScript(isMainnet);
  // const limitHex = append0x(limit.toString(16));
  // const paramList = [
  //   {
  //     script: {
  //       code_hash: dexLock.codeHash,
  //       hash_type: dexLock.hashType,
  //       args: "0x",
  //     },
  //     script_type: "lock",
  //     script_search_mode: "prefix",
  //     filter: {
  //       script: {
  //         code_hash: sporeType.codeHash,
  //         hash_type: sporeType.hashType,
  //         args: "0x",
  //       },
  //       script_search_mode: "prefix",
  //       script_type: "type",
  //     },
  //   },
  //   "asc",
  //   limitHex,
  // ];

  // if (after) {
  //   paramList.push(after);
  // }

  // const cells = await baseRPC("get_cells", paramList);

  let cells = [];

  let indexer = new Indexer(CKB_INDEXER_URL, CKB_NODE_RPC_URL);
  let collector = indexer.collector({
    lock: {
      script: {
        codeHash: dexLock.codeHash,
        hashType: dexLock.hashType,
        args: "0x",
      },
      searchMode: "prefix",
    },
    type: {
      script: {
        codeHash: sporeType.codeHash,
        hashType: sporeType.hashType,
        args: "0x",
      },
      searchMode: "prefix",
    },
  });

  for await (const cell of collector.collect()) {
    cells.push(cell);
  }

  cells.sort((a, b) => {
    const a_orderArgs = OrderArgs.fromHex(a.cellOutput.lock.args);
    const b_orderArgs = OrderArgs.fromHex(b.cellOutput.lock.args);

    if (a_orderArgs.totalValue > b_orderArgs.totalValue) {
      return 1;
    } else if (a_orderArgs.totalValue < b_orderArgs.totalValue) {
      return -1;
    } else {
      return 0;
    }
  });

  let objects = [];
  if (page > 0) {
    if (limit * page < cells.length) {
      const subArray = cells.slice(limit * page, limit * (page + 1));
      objects.push(...subArray);
    }
  } else {
    const subArray = cells.slice(0, limit);
    objects.push(...subArray);
  }

  return { objects: cells };
}

export async function handleBuildTakerTx(connectData, account, selectArr) {
  const collector = new Collector({
    ckbNodeUrl: CKB_NODE_RPC_URL,
    ckbIndexerUrl: CKB_INDEXER_URL,
  });

  const buyer = account;

  const aggregator = new Aggregator(DOB_AGGREGATOR_URL);

  const joyID = {
    connectData,
    aggregator,
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
    console.log("====handleBuildTakerTx", element);
    orderOutPoints.push({
      txHash: element.outPoint.txHash,
      index: element.outPoint.index,
    });
  }

  console.log(orderOutPoints);
  const { rawTx, witnessIndex } = await buildTakerTx({
    collector,
    joyID,
    buyer,
    orderOutPoints: orderOutPoints.map(serializeOutPoint),
    ckbAsset: CKBAsset.SPORE,
  });

  console.log(rawTx);

  const signedTx = await signRawTransaction(rawTx, buyer, {
    config: CONFIG,
    witnessIndex,
  });

  return collector.getCkb().rpc.sendTransaction(signedTx, "passthrough");
}

export const handleList = async (connectData, account, price, selectItem) => {
  const collector = new Collector({
    ckbNodeUrl: CKB_NODE_RPC_URL,
    ckbIndexerUrl: CKB_INDEXER_URL,
  });

  const seller = account;

  const aggregator = new Aggregator(DOB_AGGREGATOR_URL);

  const joyID = {
    connectData,
    aggregator,
  };

  const listPackage = calculateNFTMakerListPackage(seller);

  const totalValue = parseUnit(price, "ckb").add(listPackage);

  const sporeType = {
    ...getSporeTypeScript(isMainnet),
    args: selectItem.output.type.args,
  };
  const { rawTx } = await buildMakerTx({
    collector,
    joyID,
    seller,
    // The price whose unit is shannon for CKB native token
    totalValue,
    assetType: append0x(serializeScript(sporeType)),
    ckbAsset: CKBAsset.SPORE,
  });

  // You can call the `signRawTransaction` method to sign the raw tx with JoyID wallet through @joyid/ckb SDK
  // please make sure the buyer address is the JoyID wallet ckb address
  const signedTx = await signRawTransaction(rawTx, seller);

  return collector.getCkb().rpc.sendTransaction(signedTx, "passthrough");
};

export const handleMultiList = async (
  connectData,
  account,
  price,
  selectItemList
) => {
  const collector = new Collector({
    ckbNodeUrl: CKB_NODE_RPC_URL,
    ckbIndexerUrl: CKB_INDEXER_URL,
  });

  const seller = account;

  const aggregator = new Aggregator(DOB_AGGREGATOR_URL);

  const joyID = {
    connectData,
    aggregator,
  };

  const listPackage = calculateNFTMakerListPackage(seller);

  let nfts = [];

  for (let i = 0; i < selectItemList.length; i++) {
    const selectItem = selectItemList[i];
    const totalValue = parseUnit(price, "ckb").add(listPackage);

    const sporeType = {
      ...getSporeTypeScript(isMainnet),
      args: selectItem.output.type.args,
    };

    nfts.push({ totalValue, assetType: append0x(serializeScript(sporeType)) });
  }

  const { rawTx } = await buildMultiNftsMakerTx(
    {
      collector,
      joyID,
      seller,
      ckbAsset: CKBAsset.SPORE,
    },
    nfts
  );

  // You can call the `signRawTransaction` method to sign the raw tx with JoyID wallet through @joyid/ckb SDK
  // please make sure the buyer address is the JoyID wallet ckb address
  const signedTx = await signRawTransaction(rawTx, seller);

  return collector.getCkb().rpc.sendTransaction(signedTx, "passthrough");
};

export async function getMySporeOrder(address, limit = PAGE_SIZE, after) {
  const ownerlock = helpers.parseAddress(address, { config: CONFIG });
  const limitHex = append0x(limit.toString(16));
  const dexLock = getDexLockScript(isMainnet);
  const sporeType = getSporeTypeScript(isMainnet);

  const paramList = [
    {
      script: {
        code_hash: dexLock.codeHash,
        hash_type: dexLock.hashType,
        args: `${serializeScript(ownerlock)}`,
      },
      script_type: "lock",
      script_search_mode: "prefix",
      filter: {
        script: {
          code_hash: sporeType.codeHash,
          hash_type: sporeType.hashType,
          args: "0x",
        },
        script_search_mode: "prefix",
        script_type: "type",
      },
    },
    "asc",
    limitHex,
  ];
  if (after) {
    paramList.push(after);
  }
  const cells = await baseRPC("get_cells", paramList);

  return cells;
}

export async function handleCancelOrder(connectData, account, selectItem) {
  const collector = new Collector({
    ckbNodeUrl: CKB_NODE_RPC_URL,
    ckbIndexerUrl: CKB_INDEXER_URL,
  });

  const seller = account;

  const aggregator = new Aggregator(DOB_AGGREGATOR_URL);

  const joyID = {
    connectData,
    aggregator,
  };

  const dexLock = getDexLockScript(isMainnet);
  const sporeType = getSporeTypeScript(isMainnet);
  const ownerlock = helpers.parseAddress(seller, { config: CONFIG });

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
  });

  console.log(rawTx);

  const signedTx = await signRawTransaction(rawTx, seller, {
    config: CONFIG,
    witnessIndex,
  });

  console.log("signedTx", signedTx);

  return collector.getCkb().rpc.sendTransaction(signedTx, "passthrough");
}
