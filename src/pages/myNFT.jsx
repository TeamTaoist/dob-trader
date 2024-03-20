import Layout_ckb from "../components/layout.jsx";
import React, {useEffect, useState} from 'react';
import { Button, Table,Tag } from 'antd';
import ListModal from "../components/list.jsx";
import styled from "styled-components";
import {shortAddress} from "../utils/global.js";
import {useSelector} from "react-redux";
import {getSporesByRPC} from "../api/index.js";
import {v4 as uuidv4} from "uuid";

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

export default function MyNFT(){
    const account = useSelector(store => store.account);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showList, setShowList] = useState(false);
    const [list,setList] = useState([])
    const [last,setLast] = useState('');
    const [selectItem,setSelectItem]  = useState([]);


    const columns = [
        {
            title: 'NFT',
            dataIndex: 'nft',
            key:"nft",
            render: (_, record) => <img className="nft" src="https://arseed.web3infra.dev/0kNCtP7aiArSYolnBOedfpUEI9HUKrs21BD7rIRGsVw" />
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key:"name",
            render: (_, record) => <span>Unicorn Box</span>
        },
        {
            title: 'Tx',
            dataIndex: 'tx',
            key:"tx",
            render: (_, record) => <span>{shortAddress(record?.out_point?.tx_hash)}</span>
        },
        // {
        //     title: 'Occupied',
        //     dataIndex: 'occupied',
        //     render: (_, record) => <Tag>&lt;{formatUnit(record.Occupied,'ckb') } CKBytes&gt;</Tag>
        // },
        // {
        //     title: 'Price',
        //     dataIndex: 'price',
        //     key:"price",
        //     render: (_, record) => <PriceBox> <img src={CkbImg} alt=""/>{formatPrice(record)} <span>CKB</span></PriceBox>
        // },
    ];

    useEffect(() => {
        getList()
    }, []);

    const getList = async () =>{
        let rt = await getSporesByRPC(account,10,last);
        const {objects,last_cursor} = rt;

        let arr = objects.map(item=> {
            return {
                ...item,
                key:uuidv4()
            }
        })
        setList([...list,...arr])
        setLast(last_cursor)
    }


    const onSelectChange = (newSelectedRowKeys) => {
        let newSeletItem = []
        list.map((item)=>{
            newSelectedRowKeys.map((sl) =>{
                if(item.key === sl){
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

    const handleClose = () =>{
        setShowList(false);
    }

    return <Layout_ckb>

        {
            showList && <ListModal handleClose={handleClose} show={showList} selectItem={selectItem} />
        }
        <Box>
            <div
                style={{
                    marginBottom: 16,
                    display:"flex",
                    gap:10
                }}
            >
                <Button type="primary"  onClick={() => setShowList(true)}>
                    List
                </Button>
                <span
                    style={{
                        marginLeft: 8,
                    }}
                >
          {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
        </span>
            </div>
            <Table rowSelection={rowSelection} columns={columns} dataSource={list} pagination={{
                position: ["none", "none"],
            }} />
        </Box>
    </Layout_ckb>
}
