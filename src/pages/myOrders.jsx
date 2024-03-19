import Layout_ckb from "../components/layout.jsx";
import React, { useState } from 'react';
import {Button, Table, Tag} from 'antd';
import styled from "styled-components";

const Box = styled.div`
.nft{
    width: 50px;
    height: 50px;
    border-radius: 50px;
    object-fit: cover;
    object-position: center;
}
    
`


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
        title: 'Age',
        dataIndex: 'age',
    },
    {
        title: 'Address',
        dataIndex: 'address',
    },
    {
        title: 'Tags',
        dataIndex: 'tags',
        render: (_, record) => <Tag  color="magenta">{record.status}</Tag>
    },
];
const data = [];
for (let i = 0; i < 46; i++) {
    data.push({
        key: i,
        name: `Edward King ${i}`,
        age: 32,
        status:"Success",
        img:"https://img2.baidu.com/it/u=2007734149,2491858995&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=500",
        address: `London, Park Lane no. ${i}`,
    });
}

export default function MyOrders(){
    return <Layout_ckb>
        <Box>
            <Table columns={columns} dataSource={data}/>
        </Box>
    </Layout_ckb>
}
