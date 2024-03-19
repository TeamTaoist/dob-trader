import styled from "styled-components";
import { connect } from '@joyid/ckb';
import store from "../store";
import {saveAccount} from "../store/reducer";
import {useSelector} from "react-redux";
import {Button} from "antd";
import {shortAddress} from "../utils/global";
import {
    CloseCircleOutlined
} from '@ant-design/icons';


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


export default function Joyid (){
    const account = useSelector(store => store.account);

    const onConnect = async() =>{
        try {
            const authData = await connect();
            store.dispatch(saveAccount(authData.address));
        } catch (error) {
            console.error(error);
        }
    }

    const Disconnect = () =>{
        store.dispatch(saveAccount(null));
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
            !!account  &&  <RhtBox >{shortAddress(account)}<CloseCircleOutlined className="wallet" onClick={()=>Disconnect()} /></RhtBox>
        }

    </Box>
}