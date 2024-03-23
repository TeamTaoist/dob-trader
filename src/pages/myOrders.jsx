import Layout_ckb from "../components/layout.jsx";
import React, { useEffect, useState } from 'react';
import { Button, notification, Table, Tag } from 'antd';
import ListModal from "../components/list.jsx";
import CancelModal from "../components/Cancel.jsx";
import styled from "styled-components";
import { shortAddress } from "../utils/global.js";
import { BI, formatUnit } from "@ckb-lumos/bi";
import CkbImg from "../assets/ckb.png";
import { getMySporeOrder, getSporesByRPC } from "../api/index.js";
import { v4 as uuidv4 } from "uuid";
import { useSelector } from "react-redux";
import { OrderArgs as OrderArqs } from "../../lib/ckb-dex-sdk/index.js";
import store from "../store/index.js";
import { saveLoading } from "../store/reducer.js";
import { PAGE_SIZE } from "../utils/const.js";

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



export default function MyOrders() {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCancel, setShowCancel] = useState(false);
    const [list, setList] = useState([])
    const [last, setLast] = useState('');
    const account = useSelector(store => store.account);
    const [selectItem, setSelectItem] = useState([]);

    const columns = [
        {
            title: 'NFT',
            dataIndex: 'nft',
            key: "nft",
            render: (_, record) => <img className="nft" src="https://arseed.web3infra.dev/0kNCtP7aiArSYolnBOedfpUEI9HUKrs21BD7rIRGsVw" />
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: "name",
            render: (_, record) => <span>Unicorn Box</span>
        },
        {
            title: 'Tx',
            dataIndex: 'tx',
            render: (_, record) => <span>{shortAddress(record.out_point?.tx_hash)}</span>
        },
        // {
        //     title: 'Occupied',
        //     dataIndex: 'occupied',
        //     render: (_, record) => <Tag>&lt;{formatUnit(record.Occupied,'ckb') } CKBytes&gt;</Tag>
        // },
        {
            title: 'Price',
            dataIndex: 'price',
            key: "price",
            render: (_, record) => <PriceBox> <img src={CkbImg} alt="" />{formatPrice(record)} <span>CKB</span></PriceBox>
        },
    ];

    const formatPrice = (element) => {
        let outputArgs = element.output.lock.args;
        if (outputArgs) {
            const orderAras = OrderArqs.fromHex(outputArgs);
            const { totalValue } = orderAras
            let rt = BI.from(totalValue).sub(7000000000)
            return formatUnit(rt, 'ckb')
        }
    }



    useEffect(() => {
        if (!account) return;
        getList()
    }, [account]);

    const getList = async () => {
        store.dispatch(saveLoading(true));
        try {
            let rt = await getMySporeOrder(account, PAGE_SIZE, last);
            const { objects, last_cursor } = rt;

            let arr = objects.map(item => {
                return {
                    ...item,
                    key: uuidv4()
                }
            })
            setList([...list, ...arr])
            setLast(last_cursor)
        } catch (e) {
            console.error(e)
        } finally {
            store.dispatch(saveLoading(false));
        }

    }


    const onSelectChange = (newSelectedRowKeys) => {

        let newSeletItem = []
        list.map((item) => {
            newSelectedRowKeys.map((sl) => {
                if (item.key === sl) {
                    newSeletItem.push(item)
                }
            })
        })

        setSelectItem(newSeletItem);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;


    const handleCloseCancel = () => {
        setShowCancel(false);
    }


    const [api, contextHolder] = notification.useNotification();
    const openNotificationWithIcon = (type, tips, desc) => {
        api[type]({
            message: tips,
            description: desc,
            duration: 2000,
        });
    };

    const handleResult = (type, tip, desc) => {
        openNotificationWithIcon(type, tip, desc)
        setTimeout(() => {
            window.location.reload()
        }, 2000)


    }
    return <Layout_ckb>

        {
            showCancel && <CancelModal handleClose={handleCloseCancel} show={showCancel} selectItem={selectItem} handleResult={handleResult} />
        }
        {contextHolder}
        <Box>
            <div
                style={{
                    marginBottom: 16,
                    display: "flex",
                    gap: 10
                }}
            >
                <Button type="primary" disabled={!selectItem?.length} onClick={() => setShowCancel(true)}>
                    Cancel
                </Button>
                <span
                    style={{
                        marginLeft: 8,
                    }}
                >
                    {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
                </span>
            </div>
            <Table rowSelection={rowSelection} columns={columns} dataSource={list} pagination={false} />
        </Box>
    </Layout_ckb>
}
