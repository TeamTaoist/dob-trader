import Layout_ckb from "../components/layout.jsx";
import React, {useEffect, useState} from 'react';
import { Button, Table,Tag } from 'antd';
import BuyModal from "../components/Buy.jsx";
import Loading from "../components/loading.jsx";
import styled from "styled-components";
import {shortAddress} from "../utils/global.js";
import {BI, formatUnit} from "@ckb-lumos/bi";
import CkbImg from "../assets/ckb.png";
import {getmarket} from "../api/index.js";
import {OrderArgs as OrderArqs} from "@nervina-labs/ckb-dex";
import { v4 as uuidv4 } from 'uuid';
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

const PageBox = styled.div`
    background: #f5f5f5;
    width: 100%;
    margin-top: 20px;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
`


export default function Home(){
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [loading, setLoading] = useState(false);
    const [showBuy, setShowBuy] = useState(false);
    const [list,setList] = useState([])
    const [last,setLast] = useState('')
    const [selectItem,setSelectItem]  = useState([]);

    const account = useSelector(store => store.account);
    console.log(account)

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
        {
            title: 'Price',
            dataIndex: 'price',
            key:"price",
            render: (_, record) => <PriceBox> <img src={CkbImg} alt=""/>{formatPrice(record)} <span>CKB</span></PriceBox>
        },
    ];

    useEffect(() => {
        getList()
    }, []);

    const getList = async () =>{
        let rt = await getmarket(10,last);
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

    const formatPrice = (element) =>{
        let outputArgs = element.output. lock.args;
        if(outputArgs){
            const orderAras = OrderArqs. fromHex (outputArgs) ;
            const {totalValue} = orderAras
            let rt = BI.from(totalValue).sub(7000000000)
            return formatUnit(rt,'ckb')
        }
    }

    const getMore = () =>{
        getList()
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
            showBuy && <BuyModal handleClose={handleClose} show={showBuy} selectItem={selectItem} handleLoading={handleLoading} CloseLoading={CloseLoading} />
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
            <Table rowSelection={rowSelection} columns={columns} dataSource={list} pagination={{
                position: ["none", "none"],
            }} />
            <PageBox onClick={()=>getMore()}>Load more</PageBox>
        </Box>
    </Layout_ckb>
}
