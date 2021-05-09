// import logo from './logo.svg';
import "./App.css";

import AppRouter from "./router";
import Navbar from "./Navbar";
import { HashRouter as Router, Link } from "react-router-dom";

import { RequireAuth } from "./contextTypes/authentication";
import { Layout } from "antd";
import { CREDITS } from "./urls";

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <div className="App">
      <RequireAuth>
        <Router>
          <Layout style={{ background: "inherit", height: "100vh" }}>
            <Header style={{ height: "3.5em" }}>
              <Navbar />
            </Header>
            <Content id="content-body">
              <AppRouter />
            </Content>
            <Footer id="footer">
              <p>Design ©2021 Created by Jenny Quach & Maunica Toleti</p>
              <Link className="footer-link" to={CREDITS}>
                Credits
              </Link>
            </Footer>
          </Layout>
        </Router>
      </RequireAuth>
    </div>
  );
}

export default App;
