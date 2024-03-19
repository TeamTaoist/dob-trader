import Layout_ckb from "../components/layout.jsx";
import React, { useState } from 'react';
import {Button, Table, Tag} from 'antd';
import styled from "styled-components";


const columns = [
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
        address: `London, Park Lane no. ${i}`,
    });
}

export default function MyOrders(){
    return <Layout_ckb>
        <div>
            <Table columns={columns} dataSource={data}/>
        </div>
    </Layout_ckb>
}
