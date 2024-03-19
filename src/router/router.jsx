import React from 'react';
import {Route,Routes,Navigate} from "react-router-dom";
import Home from '../pages/home.jsx';
import Test from "../pages/test.jsx";

function RouterLink() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/home" />}/>
            <Route path="/home" element={<Home />}/>
            <Route path="/test" element={<Test />}/>

        </Routes>
   );
}

export default RouterLink;
