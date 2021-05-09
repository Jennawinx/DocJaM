import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { HOME_URL, SIGNIN_URL } from "./urls";
import { Menu, PageHeader } from "antd";

import { AuthenticationContext } from "./contextTypes/authentication";
import "./Navbar.css";

const Navbar = () => {
  const { currUser, signout } = useContext(AuthenticationContext);
  return (
    <PageHeader
      ghost={false}
      style={{
        height: "100%",
        background: "inherit",
        padding: "0.5em"
      }}
      title={
        <Menu theme="dark" mode="horizontal">
          <Menu.Item key="1">
            <NavLink to={HOME_URL}>
              DocJaM
              {(currUser) 
                ? " | " + currUser.firstname + " (" + currUser.username + ")"
               : ""}
            </NavLink>{" "}
          </Menu.Item>
        </Menu>
      }
      extra={[
        <Menu key="right" theme="dark" mode="horizontal">
          {(currUser) 
            ? <Menu.Item key="1" onClick={signout}>Signout</Menu.Item>
            : <Menu.Item key="1"><NavLink to={SIGNIN_URL}>Signin</NavLink></Menu.Item>}
        </Menu>,
      ]}  
    />
  );
};

export default Navbar;
