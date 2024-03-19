import { Flex, Spin } from 'antd';
import styled from "styled-components";

const Box = styled.div`
    width: 100vw;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 9;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.3);
    backdrop-filter: blur(4px);
    /* HTML: <div class="loader"></div> */
    .loader {
        width: fit-content;
        font-weight: bold;
        font-family: monospace;
        font-size: 30px;
        background:linear-gradient(90deg,#4096ff 50%,#4096ff00 0) right/200% 100%;
        animation: l21 2s infinite linear;
    }
    .loader::before {
        content :"Loading...";
        color: #0000;
        padding: 0 5px;
        background: inherit;
        background-image: linear-gradient(90deg,#fff 50%,#000 0);
        -webkit-background-clip:text;
        background-clip:text;
    }

    @keyframes l21{
        100%{background-position: left}
    }
    
`
export default function (){
    return <Box>
        <div className="loader"></div>
    </Box>
}
