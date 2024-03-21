import {Modal,Flex,notification} from "antd";
import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {handleBuildTakerTx} from "../api/index.js";
import {useSelector} from "react-redux";
import {OrderArgs as OrderArqs} from "@nervina-labs/ckb-dex/lib/order/orderArgs.js";
import {BI, formatUnit} from "@ckb-lumos/bi";
import store from "../store/index.js";
import {saveLoading} from "../store/reducer.js";

const Box = styled.div`

    .item{
        margin: 10px 0;
        gap:20px;
    }
    .num{
        font-size: 18px;
        font-weight: bold;
    }
    .symbol{
        opacity: 0.6;
        font-size: 12px;
    }
    .total{
        margin-left: 10px;
    }
`

export default function BuyModal({handleClose,show,selectItem,handleResult}){
    const connectData = useSelector(store => store.connectData);
    const account = useSelector(store => store.account);
    const [price,setPrice] = useState(0)


    let Sum = BI.from(0)

    useEffect(() => {
        selectItem.map((item)=>{
            let outputArgs = item.output.lock.args;
            if(outputArgs){
                const orderAras = OrderArqs. fromHex (outputArgs) ;
                const {totalValue} = orderAras
                let rt = BI.from(totalValue).sub(7000000000)
                Sum = Sum.add(rt)
            }
        })
        let sumFormat = formatUnit(Sum,"ckb")
        setPrice(sumFormat)

    }, [selectItem]);


    const handleConfirm = async () =>{
        store.dispatch(saveLoading(true));

        try {
            let txHash = await handleBuildTakerTx(connectData,account,selectItem)
            handleResult('success',"Success",txHash)

        }catch (e) {
            console.error("submitBuy",e)
            handleResult('error',"Failed",e.message)
        }finally {
            handleClose()
            store.dispatch(saveLoading(false));
        }


    }
    return <div>

        <Modal
            title="Buy"
            centered
            open={show}
            onOk={() => handleConfirm()}
            onCancel={() => handleClose()}
        >
            <Box>
                <Flex align="center" justify="center" className="item">
                    <div>Buy {selectItem.length} NFT, <span className="total">Total</span></div>
                    <div>
                        <span className="num">{price}</span> <span className="symbol">CKB</span>
                    </div>
                </Flex>

            </Box>

        </Modal>
    </div>
}
