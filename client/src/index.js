import ReactDOM from "react-dom";
import "./index.css";
import "antd/dist/antd.css";

import Apollo from "./Apollo";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(Apollo, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
