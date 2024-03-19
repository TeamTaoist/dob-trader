import { createGlobalStyle } from "styled-components";


const GlobalStyle = createGlobalStyle`
  body,html{
    color: #333;
    padding: 0;
    margin: 0;
    overscroll-behavior: none;
  }

 
  dl,dt,ul,li{
    padding: 0;
    margin: 0;
    
  }
  li {
    list-style: none;
  }
  * {
    font-family: -apple-system,BlinkMacSystemFont,
    "Segoe UI",Roboto,"Helvetica Neue",
    Arial,sans-serif,"Apple Color Emoji",
    "Segoe UI Emoji","Segoe UI Symbol" ;
    padding: 0;
    margin: 0;
    &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
    &:focus{
      outline: none;
    }
    &:focus-visible{
      outline: none!important;
    }
  }
  a{
    text-decoration: none;
    color: #000;
  
  }
`;

export default GlobalStyle;
