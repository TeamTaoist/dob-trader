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

export default function CancelModal({handleClose,show,selectedRowKeys}){

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
                    <div>Cancel {selectedRowKeys.length} NFT, <span className="total">Total</span></div>
                    <div>
                        <span className="num">989008</span> <span className="symbol">CKB</span>
                    </div>
                </Flex>

            </Box>

        </Modal>
    </div>
}
