import React from 'react';
import {Route,Routes,Navigate} from "react-router-dom";
import Home from '../pages/home.jsx';
import Test from "../pages/test.jsx";
import MyNFT from "../pages/myNFT.jsx";
import MyOrders from "../pages/myOrders.jsx";
import LayoutOuter from "../components/layoutOuter.jsx";

function RouterLink() {
    return (
        <LayoutOuter>
        <Routes>
            <Route path="/" element={<Navigate to="/home" />}/>
            <Route path="/home" element={<Home />}/>
            <Route path="/test" element={<Test />}/>
            <Route path="/myNFT" element={<MyNFT />}/>
            <Route path="/myOrders" element={<MyOrders />}/>

        </Routes>
        </LayoutOuter>
   );
}

export default RouterLink;
