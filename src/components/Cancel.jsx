import {Modal,Flex,Input} from "antd";
import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {BI, formatUnit} from "@ckb-lumos/bi";
import {OrderArgs as OrderArqs} from "@nervina-labs/ckb-dex";

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

export default function CancelModal({handleClose,show,selectItem}){

    const [price,setPrice] = useState(0)

    let Sum = BI.from(0)

    useEffect(() => {
        selectItem.map((item)=>{
            let outputArgs = item.output.lock.args;
            if(outputArgs){
                const orderAras = OrderArqs.fromHex (outputArgs) ;
                const {totalValue} = orderAras
                let rt = BI.from(totalValue).sub(7000000000)
                Sum = Sum.add(rt)
            }
        })
        let sumFormat = formatUnit(Sum,"ckb")
        setPrice(sumFormat)

    }, [selectItem]);

    const handleConfirm = () =>{
        console.log("===handleConfirm=")
        handleClose()

    }
    return <div>
        <Modal
            title="Cancel"
            centered
            open={show}
            onOk={() => handleConfirm()}
            onCancel={() => handleClose()}
        >
            <Box>
                <Flex align="center" justify="center" className="item">
                    <div>Cancel {selectItem.length} NFT, <span className="total">Total</span></div>
                    <div>
                        <span className="num">{price}</span> <span className="symbol">CKB</span>
                    </div>
                </Flex>

            </Box>

        </Modal>
    </div>
}
