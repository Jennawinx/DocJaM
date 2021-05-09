import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Form, Input, Button, Card } from "antd";
import { useLazyQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { SIGNUP_URL } from "./urls";
import { AuthenticationContext } from "./contextTypes/authentication";

import "./SigninPage.css";
import "./ErrorMessage.css";

// Query to signin
const SIGNIN = gql`
  query signin($username: String!, $password: String!) {
    signin(username: $username, password: $password) {
      id
      username
      firstname
      lastname
      email
      token
      createdAt
    }
  }
`;

/*Form component and other components from antd.design */

const SigninPage = () => {
  const contextAuth = useContext(AuthenticationContext);

  const [errs, setErrs] = useState({});

  const [signinValues, setSigninValues] = useState({
    username: "",
    password: "",
  });

  const [signinUser] = useLazyQuery(SIGNIN, {
    onCompleted(data) {
      setErrs({});
      contextAuth.signin(data.signin);
    },
    onError(err) {
      console.error(err.networkError.result.errors[0].extensions.errors);
      setErrs(err.networkError.result.errors[0].extensions.errors);
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    variables: signinValues,
  });

  const onFinish = (values) => {
    setSigninValues({
      username: values.username,
      password: values.password,
    });

    signinUser();
  };

  const onFinishFailed = (errorInfo) => {
    console.error("Failed:", errorInfo);
  };

  return (
    <div className="content-page reading">
      <Card
        className="card-section"
        style={{
          width: "500px",
        }}
      >
        <Form
          name="basic"
          layout={"vertical"}
          initialValues={{
            remember: true,
          }}
          noValidate
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item>
            <div id="big-site-title">DocJaM</div>
            <h1>Sign In</h1>
          </Form.Item>
          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: "Please enter your username!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter your password!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item className="center-item signup-link">
            <Link to={SIGNUP_URL}>New user? Sign up here!</Link>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="form-button">
              Sign In
            </Button>
          </Form.Item>
          <Form.Item className="error-box center-item">
            {Object.keys(errs).length > 0 ? (
              <div className="error">
                <ul className="error-list">
                  {Object.values(errs).map((value) => (
                    <li key={value}>{value}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div></div>
            )}
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SigninPage;
