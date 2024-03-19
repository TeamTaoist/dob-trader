import Layout_ckb from "../components/layout.jsx";
import React, { useState } from 'react';
import { Button, Table,Tag } from 'antd';
import BuyModal from "../components/Buy.jsx";
import Loading from "../components/loading.jsx";
import styled from "styled-components";
import {shortAddress} from "../utils/global.js";
import {formatUnit} from "@ckb-lumos/bi";
import CkbImg from "../assets/ckb.png";

const Box = styled.div`
.nft{
    width: 80px;
    height: 80px;
    border-radius: 10px;
    object-fit: cover;
    object-position: center;
}
`

const PriceBox = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    img{
        width: 24px;
        height: 24px;
    }
`
const data = [];
for (let i = 0; i < 46; i++) {
    data.push({
        key: i,
        name: `Edward King ${i}`,
        out_point: "0xa303647db127a198eb0fd42f86717e0e80f500bdcebdac8fb65cf5b0b06123e5",
        Occupied:"34000000000",
        price: "5497700000000",
        img:"https://arseed.web3infra.dev/0kNCtP7aiArSYolnBOedfpUEI9HUKrs21BD7rIRGsVw",
    });
}

export default function Home(){
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showBuy, setShowBuy] = useState(false);

    const columns = [
        {
            title: 'NFT',
            dataIndex: 'nft',
            render: (_, record) => <img className="nft" src={record.img} />
        },
        {
            title: 'Name',
            dataIndex: 'name',
        },
        {
            title: 'Tx',
            dataIndex: 'tx',
            render: (_, record) => <span>{shortAddress(record.out_point)}</span>
        },
        {
            title: 'Occupied',
            dataIndex: 'occupied',
            render: (_, record) => <Tag>&lt;{formatUnit(record.Occupied,'ckb') } CKBytes&gt;</Tag>
        },
        {
            title: 'Price',
            dataIndex: 'price',
            render: (_, record) => <PriceBox> <img src={CkbImg} alt=""/>{formatUnit(record.price,"ckb")} <span>CKB</span></PriceBox>
        },
    ];

    const start = () => {
        setLoading(true);
        // ajax request after empty completing
        setTimeout(() => {
            setSelectedRowKeys([]);
            setLoading(false);
        }, 1000);
    };
    const onSelectChange = (newSelectedRowKeys) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;

    const handleClose = () =>{
        setShowBuy(false);
    }
    const handleLoading = () =>{
        setLoading(true)
    }
    const CloseLoading = () =>{
        setLoading(false)
    }

    return <Layout_ckb>

        {
            showBuy && <BuyModal handleClose={handleClose} show={showBuy} selectedRowKeys={selectedRowKeys} handleLoading={handleLoading} CloseLoading={CloseLoading} />
        }
        {
            loading &&  <Loading />
        }

        <Box>
            <div
                style={{
                    marginBottom: 16,
                    display:"flex",
                    gap:10
                }}
            >
                <Button type="primary"  onClick={() => setShowBuy(true)}>
                   Buy
                </Button>

                <span
                    style={{
                        marginLeft: 8,
                    }}
                >
          {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
        </span>
            </div>
            <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
        </Box>
    </Layout_ckb>
}
