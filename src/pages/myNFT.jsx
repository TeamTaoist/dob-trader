import Layout_ckb from "../components/layout.jsx";
import React, {useEffect, useState} from 'react';
import {Button, notification, Table, Tag} from 'antd';
import ListModal from "../components/list.jsx";
import styled from "styled-components";
import {shortAddress} from "../utils/global.js";
import {useSelector} from "react-redux";
import {getSporesByRPC} from "../api/index.js";
import {v4 as uuidv4} from "uuid";
import store from "../store/index.js";
import {saveLoading} from "../store/reducer.js";

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

export default function MyNFT(){
    const account = useSelector(store => store.account);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [showList, setShowList] = useState(false);
    const [list,setList] = useState([])
    const [last,setLast] = useState('');
    const [selectItem,setSelectItem]  = useState([]);
    const [more,setMore] = useState(false)

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
        store.dispatch(saveLoading(true));
        try{
            let rt = await getSporesByRPC(account,5,last);
            const {objects,last_cursor} = rt;

            let arr = objects.map(item=> {
                return {
                    ...item,
                    key:uuidv4()
                }
            })
            setMore(arr.length===5)
            setList([...list,...arr])
            setLast(last_cursor)

        }catch (e) {
            console.error(e)
        }finally {
            store.dispatch(saveLoading(false));
        }

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

    const getMore = () =>{
        if(more){
            getList()
        }
    }

    const [api,contextHolder] = notification.useNotification();
    const openNotificationWithIcon = (type,tips,desc) => {
        api[type]({
            message: tips,
            description:desc,
            duration: 2000,
        });
    };

    const handleResult = (type,tip,desc,isEnd) =>{
        openNotificationWithIcon(type,tip,desc)
        if(isEnd){
            setTimeout(()=>{
                window.location.reload()
            },2000)
        }

    }

    return <Layout_ckb>

        {
            showList && <ListModal handleClose={handleClose} show={showList} selectItem={selectItem}  handleResult={handleResult}/>
        }

        {contextHolder}
        <Box>
            <div
                style={{
                    marginBottom: 16,
                    display:"flex",
                    gap:10
                }}
            >
                <Button type="primary"  disabled={!selectItem?.length}  onClick={() => setShowList(true)}>
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
            <Table rowSelection={rowSelection} columns={columns} dataSource={list} pagination={false} />
            {
                more&&<PageBox onClick={()=>getMore()}>Load more</PageBox>
            }
        </Box>
    </Layout_ckb>
}
