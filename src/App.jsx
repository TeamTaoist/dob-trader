import React from 'react';
import Routerlink from './router/router';
import {HashRouter as Router} from "react-router-dom";
import GlobalStyle from "./utils/GlobalStyle";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store";

function App() {


  return (
      <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
      <Router>
        <Routerlink />
        <GlobalStyle />
      </Router>
          </PersistGate>
      </Provider>
  )
}

export default App
