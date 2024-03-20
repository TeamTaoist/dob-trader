import {Modal,Flex,Input} from "antd";
import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {handleList} from "../api/index.js";
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

export default function ListModal({handleClose,show,selectItem}){
    const [total,setTotal] = useState(100)
    const [price,setPrice] = useState('')
    const connectData = useSelector(store => store.connectData);
    const account = useSelector(store => store.account);

    useEffect(() => {
        let sum =  selectItem.length * price
        setTotal(sum)

    }, [selectItem,price]);

    const handleInput = (e) =>{
        const {value} = e.target;
        setPrice(value)

    }

    const handleConfirm = async () =>{
        try {


            let txHash = await handleList(connectData,account,price,selectItem[0])
            console.log("===handleBuildTakerTx==",txHash)
            window.location.reload()

        }catch (e) {
            console.error("submitBuy",e)
        }finally {
            handleClose()
        }


    }
    return <div>
        <Modal
            title="List"
            centered
            open={show}
            onOk={() => handleConfirm()}
            onCancel={() => handleClose()}
        >
            <Box>
                <Flex align="center" justify="center" className="item">
                    <div>List {selectItem.length} NFT, <span className="total">Total</span></div>
                    <div>
                        <span className="num">{total}</span> <span className="symbol">CKB</span>
                    </div>
                </Flex>
                <Flex align="center" justify="space-between" className="item">
                    <div>Price</div>
                    <Input type="number" placeholder="price" value={price} min={0} onChange={(e)=>handleInput(e)} />
                    <span className="symbol">CKB</span>
                </Flex>
            </Box>

        </Modal>
    </div>
}
