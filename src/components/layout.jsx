import React, {useState} from 'react';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import styled from "styled-components";
const { Header, Content, Footer } = Layout;
const items = new Array(15).fill(null).map((_, index) => ({
    key: index + 1,
    label: `nav ${index + 1}`,
}));

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

    const [ list,setList] = useState([
        {
            key: 0,
            label: `Home`,
            value:"home"

        }
    ])
    return (<Box>
        <Layout>
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <div className="demo-logo" />
                <Menu
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={['0']}
                    items={list}
                    style={{
                        flex: 1,
                        minWidth: 0,
                    }}
                />
            </Header>
            <Content
                style={{
                    padding: '32px 48px',
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
                Ant Design ©{new Date().getFullYear()} Created by Ant UED
            </Footer>
        </Layout>
        </Box>
    );
};
export default Layout_ckb;
