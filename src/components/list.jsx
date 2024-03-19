import {Modal,Flex,Input} from "antd";
import React, {useEffect, useState} from "react";
import styled from "styled-components";

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

export default function ListModal({handleClose,show,selectedRowKeys}){
    const [total,setTotal] = useState(100)
    const [price,setPrice] = useState('')

    useEffect(() => {
        console.error(selectedRowKeys)
        let sum =  selectedRowKeys.length * price

        setTotal(sum)

    }, [selectedRowKeys,price]);

    const handleInput = (e) =>{
        const {value} = e.target;
        setPrice(value)

    }

    const handleConfirm = () =>{
        console.log("===handleConfirm=")
        handleClose()

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
                    <div>List {selectedRowKeys.length} NFT, <span className="total">Total</span></div>
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
