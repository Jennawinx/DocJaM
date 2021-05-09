import React, { useContext } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import {
  HOME_URL,
  SIGNIN_URL,
  SIGNUP_URL,
  PROJECT_URL,
  COLLAB_URL,
  CREDITS,
} from "./urls";

import Homepage from "./Homepage";
import SigninPage from "./SigninPage";
import SignupPage from "./SignupPage";
import WorkspaceMulti from "./ProjectMulti";
import { AuthenticationContext } from "./contextTypes/authentication";
import CollaboratorsPage from "./CollaboratorsPage";
import Credits from "./Credits";

// The following was wriitenwith reference to:
// https://github.com/hidjou/classsed-graphql-mern-apollo/blob/react5/client/src/util/AuthRoute.js
let RouteAuth = ({ component: Component, ...rest }) => {
  const { currUser } = useContext(AuthenticationContext);

  return (
    <Route
      {...rest}
      render={(props) =>
        currUser ? <Redirect to={HOME_URL} /> : <Component {...props} />
      }
    />
  );
};

let RouteNotAuth = ({ component: Component, ...rest }) => {
  const { currUser } = useContext(AuthenticationContext);

  return (
    <Route
      {...rest}
      render={(props) =>
        !currUser ? <Redirect to={SIGNIN_URL} /> : <Component {...props} />
      }
    />
  );
};

// Removed <RequireAuth> to test if redirection was working properly
// need to add back in after proper authentication
const AppRouter = () => (
  <Switch>
    <RouteAuth exact path={SIGNIN_URL} component={SigninPage} />
    <RouteAuth exact path={SIGNUP_URL} component={SignupPage} />
    <RouteNotAuth exact path={HOME_URL} component={Homepage} />
    <RouteNotAuth exact path={PROJECT_URL} component={WorkspaceMulti} />
    <RouteNotAuth exact path={COLLAB_URL} component={CollaboratorsPage} />
    <Route exact path={CREDITS} component={Credits} />
  </Switch>
);

export default AppRouter;
