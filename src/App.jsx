import React from 'react';
import Routerlink from './router/router';
import {HashRouter as Router} from "react-router-dom";
import GlobalStyle from "./utils/GlobalStyle";
function App() {


  return (
      <Router>
        <Routerlink />
        <GlobalStyle />
      </Router>
  )
}

export default App
