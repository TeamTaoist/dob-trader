import Layout_ckb from "../components/layout.jsx";
import React, { useState } from 'react';
import { Button, Table,Tag } from 'antd';
import BuyModal from "../components/Buy.jsx";
import Loading from "../components/loading.jsx";

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

export default function Home(){
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showBuy, setShowBuy] = useState(false);
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

        <div>
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
        </div>
    </Layout_ckb>
}
