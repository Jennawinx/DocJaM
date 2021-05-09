import React, { useState, useContext } from "react";
import { Form, Input, Button, Card } from "antd";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

import "./ErrorMessage.css";
import "./SigninPage.css";

import { AuthenticationContext } from "./contextTypes/authentication";

import { HOME_URL } from "./urls";

const SignupPage = (props) => {
  const contextAuth = useContext(AuthenticationContext);

  const [errs, setErrs] = useState({});
  const [data, setData] = useState({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [createUser, { loading }] = useMutation(SIGNUP, {
    update(_proxy, result) {
      contextAuth.signin(result.data.signup);
      props.history.push(HOME_URL);
    },
    onError(err) {
      console.error(err.networkError.result.errors[0].extensions.errors);
      setErrs(err.networkError.result.errors[0].extensions.errors);
    },
    variables: data,
  });

  const onFinish = (values) => {
    setData({
      username: values.username,
      firstname: values.firstname,
      lastname: values.lastname,
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
    });

    createUser();
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
          noValidate
          layout={"vertical"}
          className={loading ? "loading" : ""}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item>
            <div id="big-site-title">DocJaM</div>
            <h1>Sign Up</h1>
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
            label="Firstname"
            name="firstname"
            rules={[
              {
                required: true,
                message: "Please enter your firstname!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Lastname"
            name="lastname"
            rules={[
              {
                required: true,
                message: "Please enter your lastname!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please enter a valid email!",
                type: "email",
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
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            rules={[
              {
                required: true,
                message: "Please re-enter your password!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="form-button">
              Sign Up
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

const SIGNUP = gql`
  mutation signup(
    $username: String!
    $email: String!
    $firstname: String!
    $lastname: String!
    $password: String!
    $confirmPassword: String!
  ) {
    signup(
      userData: {
        username: $username
        firstname: $firstname
        lastname: $lastname
        email: $email
        password: $password
        confirmPassword: $confirmPassword
      }
    ) {
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
export default SignupPage;
