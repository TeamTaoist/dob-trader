import React, {useEffect, useState} from 'react';
import {Layout, Menu } from 'antd';
import styled from "styled-components";
import {useLocation, useNavigate} from "react-router-dom";
const { Header, Content, Footer } = Layout;
import Connect from "./connect.jsx";
import {items} from "../constant/menu.jsx";

const Box = styled.div`
    display: flex;
    min-height: 100vh;
`
const ContentBox = styled.div`
    background: #fff;
    min-height: 100%;
    border-radius: 20px;
    box-sizing: border-box;
    padding: 20px;
`

const Layout_ckb = ({children}) => {
    const [current, setCurrent] = useState('home');
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        const cur = location.pathname.split("/")[1]
        setCurrent(cur)
    }, []);
    const onClick = (e) => {
        setCurrent(e.key);
        navigate(`/${e.key}`)
    };
    return (<Box>
        <Layout>
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    background:"#fff"
                }}
            >
                <div className="demo-logo" />
                <Menu
                    onClick={onClick}

                    mode="horizontal"
                    selectedKeys={[current]}
                    items={items}
                    style={{
                        flex: 1,
                        minWidth: 0,
                    }}
                />
                <Connect />
            </Header>
            <Content
                style={{
                    padding: '32px 48px 0',
                }}
            >

                <ContentBox>
                    {children}
                </ContentBox>
            </Content>
            <Footer
                style={{
                    textAlign: 'center',
                }}
            >
                ©{new Date().getFullYear()}
            </Footer>
        </Layout>
        </Box>
    );
};
export default Layout_ckb;
