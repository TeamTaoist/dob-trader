import styled from "styled-components";
import { connect, initConfig } from '@joyid/ckb';
import store from "../store";
import { saveAccount, saveConnectData } from "../store/reducer";
import { useSelector } from "react-redux";
import { Button } from "antd";
import { shortAddress } from "../utils/global";
import {
    CloseCircleOutlined
} from '@ant-design/icons';

import { CKB_NODE_RPC_URL, CKB_INDEXER_URL, DOB_AGGREGATOR_URL, JOYID_APP_URL, CONFIG, isMainnet } from "../utils/const";

const Box = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`
const RhtBox = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    .wallet{
        //font-size: 20px;
        cursor: pointer;
        color: #f00;
    }
`


export default function Joyid() {
    const account = useSelector(store => store.account);


    const onConnect = async () => {
        try {
            const authData = await connect({
                name: "JoyID",
                logo: "https://fav.farm/🆔",
                joyidAppURL: JOYID_APP_URL,
                network: isMainnet ? "mainnet" : "testnet",
            });
            store.dispatch(saveAccount(authData.address));
            store.dispatch(saveConnectData(authData));
        } catch (error) {
            console.error(error);
        }
    }

    const Disconnect = () => {
        store.dispatch(saveAccount(null));
        store.dispatch(saveConnectData(null));
    }

    return <Box>

        {/*<SignModal />*/}
        {
            !account &&
            <>
                <Button type="primary" onClick={() => onConnect()}>Connect JoyID</Button>
            </>
        }
        {
            !!account && <RhtBox >{shortAddress(account)}<CloseCircleOutlined className="wallet" onClick={() => Disconnect()} /></RhtBox>
        }

    </Box>
}
