import React, { useReducer } from "react";
import jwtDec from "jwt-decode";
import { cl } from "../Apollo";
import { HOME_URL } from "../urls";

// If token expires destory it
if (localStorage.getItem("token")) {
  const decToken = jwtDec(localStorage.getItem("token"));

  // Got the following snippet of code from:
  // https://github.com/hidjou/classsed-graphql-mern-apollo/blob/react5/client/src/context/auth.js
  // Check that the token is not expired
  // Otherwise set the user to the token
  if (decToken.exp * 1000 < Date.now()) {
    localStorage.removeItem("token");
    localStorage.removeItem("currUser");
  }
}

let authenticationRed = (state, action) => {
  switch (action.type) {
    case "SIGNIN":
      return {
        ...state,
        currUser: action.data,
      };
    case "SIGNOUT":
      return {
        ...state,
        currUser: null,
      };
    default:
      return state;
  }
};

export const initialAuthenticationContext = {
  currUser: JSON.parse(localStorage.getItem("currUser")),
  signin: (userData) => {},
  signout: () => {}
}

export const AuthenticationContext = React.createContext(initialAuthenticationContext);

export let RequireAuth = (props) => {
  const [state, dispatch] = useReducer(authenticationRed, {startState: initialAuthenticationContext});

  let signin = (userData) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("currUser", JSON.stringify(userData));
    dispatch({
      type: "SIGNIN",
      data: userData,
      state: state,
    });
    window.location.replace(HOME_URL);
  };

  let signout = () => {
    localStorage.clear();
    cl.clearStore().then(() => {
      cl.resetStore();
      dispatch({ type: "SIGNOUT" });
    });
    window.location.replace("/");
  };

  return (
    <AuthenticationContext.Provider
      value={{currUser: initialAuthenticationContext.currUser, signin, signout}}
      {...props}
    />
  );
};
