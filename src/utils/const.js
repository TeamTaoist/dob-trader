import { config, helpers } from "@ckb-lumos/lumos";

// Testnet
// const CKB_NODE_RPC_URL = "https://testnet.ckb.dev/rpc";
// const CKB_INDEXER_URL = "https://testnet.ckb.dev/indexer";
// const DOB_AGGREGATOR_URL = "https://cota.nervina.dev/aggregator";
// const JOYID_APP_URL = "https://testnet.joyid.dev";
// const CONFIG = config.TESTNET;
// const isMainnet = false;

// Mainnet
export const CKB_NODE_RPC_URL = "https://mainnet.ckbapp.dev/rpc";
export const CKB_INDEXER_URL = "https://mainnet.ckbapp.dev/indexer";
export const DOB_AGGREGATOR_URL = "https://cota.nervina.dev/mainnet-aggregator";
export const JOYID_APP_URL = "https://app.joy.id";
export const CONFIG = config.MAINNET;
export const isMainnet = true;
export const PAGE_SIZE = 10;