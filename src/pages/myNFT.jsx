import Layout_ckb from "../components/layout.jsx";
import React, {useEffect, useState} from 'react';
import { Button, Table,Tag } from 'antd';
import ListModal from "../components/list.jsx";
import CancelModal from "../components/Cancel.jsx";
import styled from "styled-components";
import {shortAddress} from "../utils/global.js";
import {formatUnit} from "@ckb-lumos/bi";
import CkbImg from "../assets/ckb.png";

import {cacheExchange, Client, fetchExchange, gql} from "urql";
import {useSelector} from "react-redux";


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

export default function MyNFT(){
    const account = useSelector(store => store.account);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showList, setShowList] = useState(false);
    const [showCancel, setShowCancel] = useState(false);
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

    useEffect(() => {
        getList()
    }, []);

    const getList = async() =>{
        let rt = await getSpores(account);
        console.log("===getSpores",rt)
    }

    async function getSpores(address, first, after) {


        const query_getNFTs = gql`
            query getNFTs(
                $filter: SporeFilterInput
                $first: Int
                $order: QueryOrder
                $after: String
            ) {
                spores(filter: $filter, first: $first, order: $order, after: $after) {
                    capacityMargin
                    codeHash
                    cluster {
                        codeHash
                        description
                        id
                        name
                    }
                    cell {
                        cellOutput {
                            capacity
                            lock {
                                args
                                codeHash
                                hashType
                            }
                            type {
                                args
                                codeHash
                                hashType
                            }
                        }
                    }
                    id
                }
            }
        `;

        const order = "desc";

        const client = new Client({
            url: "https://spore-graphql.vercel.app/api/graphql",
            exchanges: [cacheExchange, fetchExchange],
        });

        const spores = await client
            .query(query_getNFTs, {
                filter: {
                    address: address,
                },
                first: first,
                after: after,
                order: order,
            })
            .toPromise()
            .then((res) => res.data)
            .catch((err) => {
                console.error(err);
            });

        return spores;
    }



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
        setShowList(false);
    }
    const handleCloseCancel = () =>{
        setShowCancel(false);
    }
    return <Layout_ckb>

        {
            showList && <ListModal handleClose={handleClose} show={showList} selectedRowKeys={selectedRowKeys} />
        }
        {
            showCancel && <CancelModal handleClose={handleCloseCancel} show={showCancel} selectedRowKeys={selectedRowKeys} />
        }
        <Box>
            <div
                style={{
                    marginBottom: 16,
                    display:"flex",
                    gap:10
                }}
            >
                {/*<Button type="primary" onClick={start} disabled={!hasSelected} loading={loading}>*/}
                {/*    Reload*/}
                {/*</Button>*/}
                <Button type="primary"  onClick={() => setShowList(true)}>
                    List
                </Button>
                <Button type="primary"  onClick={() => setShowCancel(true)}>
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
            <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
        </Box>
    </Layout_ckb>
}
