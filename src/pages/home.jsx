import Layout_ckb from "../components/layout.jsx";
import React, { useEffect, useState } from 'react';
import { Button, notification, Table, Tag } from 'antd';
import BuyModal from "../components/Buy.jsx";
import styled from "styled-components";
import { shortAddress } from "../utils/global.js";
import { BI, formatUnit } from "@ckb-lumos/bi";
import CkbImg from "../assets/ckb.png";
import { getmarket } from "../api/index.js";
import { OrderArgs as OrderArqs } from "@nervina-labs/ckb-dex";
import { v4 as uuidv4 } from 'uuid';
import store from "../store/index.js";
import { saveLoading } from "../store/reducer.js";
import { PAGE_SIZE } from "../utils/const.js";
import { utils } from "@ckb-lumos/lumos";


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

const PageBox = styled.div`
    background: #f5f5f5;
    width: 100%;
    margin-top: 20px;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
`


export default function Home() {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [showBuy, setShowBuy] = useState(false);
    const [list, setList] = useState([])
    const [page, setPage] = useState(0)
    const [selectItem, setSelectItem] = useState([]);
    const [more, setMore] = useState(false)


    const columns = [
        {
            title: 'NFT',
            dataIndex: 'nft',
            render: (_, record) => <img className="nft" src="https://arseed.web3infra.dev/0kNCtP7aiArSYolnBOedfpUEI9HUKrs21BD7rIRGsVw" />
        },
        {
            title: 'Name',
            dataIndex: 'name',
            render: (_, record) => <span>Unicorn Box</span>
        },
        {
            title: 'Tx',
            dataIndex: 'tx',
            render: (_, record) => <span>{shortAddress(record?.out_point?.tx_hash)}</span>
        },
        // {
        //     title: 'Occupied',
        //     dataIndex: 'occupied',
        //     render: (_, record) => <Tag>&lt;{formatUnit(record.Occupied,'ckb') } CKBytes&gt;</Tag>
        // },
        {
            title: 'Price',
            dataIndex: 'price',
            render: (_, record) => <PriceBox> <img src={CkbImg} alt="" />{formatPrice(record)} <span>CKB</span></PriceBox>
        },
    ];

    useEffect(() => {
        getList()
    }, []);

    const getList = async () => {
        store.dispatch(saveLoading(true));
        try {
            let rt = await getmarket(PAGE_SIZE, page);
            const { objects } = rt;
            let arr = objects.map(item => {
                return {
                    ...item,
                    key: item.outPoint.txHash + item.outPoint.index
                }
            })
            setMore(arr.length === PAGE_SIZE)
            setList([...list, ...arr]);
            if (objects.length > 0) {
                setPage(page + 1)
            } else {
                setPage(page)
            }
        } catch (e) {
            console.error("==getList=", e)

        } finally {
            store.dispatch(saveLoading(false));
        }

    }

    const formatPrice = (element) => {
        let outputArgs = element.cellOutput.lock.args;
        if (outputArgs) {
            const orderAras = OrderArqs.fromHex(outputArgs);
            const { totalValue } = orderAras
            let rt = BI.from(totalValue).sub(7000000000)
            return formatUnit(rt, 'ckb')
        }
    }

    const getMore = () => {
        if (more) {
            getList()
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

    const handleClose = () => {
        setShowBuy(false);
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
            showBuy && <BuyModal handleClose={handleClose} show={showBuy} selectItem={selectItem} handleResult={handleResult} />
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
                <Button type="primary" disabled={!selectItem?.length} onClick={() => setShowBuy(true)}>
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
            <Table rowSelection={rowSelection} columns={columns} dataSource={list} pagination={false} />
            {
                more && <PageBox onClick={() => getMore()}>Load more</PageBox>
            }

        </Box>
    </Layout_ckb>
}
