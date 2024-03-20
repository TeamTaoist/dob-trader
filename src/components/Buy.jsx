import {Modal,Flex,Input} from "antd";
import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {handleBuildTakerTx} from "../api/index.js";
import {useSelector} from "react-redux";

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

export default function BuyModal({handleClose,show,selectItem}){
    const connectData = useSelector(store => store.connectData);
    const account = useSelector(store => store.account);

    const handleConfirm = async () =>{
        try {
            let txHash = await handleBuildTakerTx(connectData,account,selectItem)
            console.log("===handleBuildTakerTx==",txHash)

        }catch (e) {
            console.error("submitBuy",e)
        }finally {
            handleClose()
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
                        <span className="num">989008</span> <span className="symbol">CKB</span>
                    </div>
                </Flex>

            </Box>

        </Modal>
    </div>
}
