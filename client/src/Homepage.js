import React, { useContext, useState } from "react";
import { Card, Button, Form, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { AuthenticationContext } from "./contextTypes/authentication";

import ProjectsList from "./ProjectsList";

import "./index.css";
import "./ErrorMessage.css";
import "./InputForm.css";

const CREATE_PROJECT = gql`
  mutation createProject($projectName: String!) {
    createProject(projectName: $projectName) {
      id
      projectName
      owner
      users
      createdAt
    }
  }
`;

const OWN_PROJECTS = gql`
  query getOwnProjects {
    getOwnProjects {
      id
      projectName
      owner
      users
      createdAt
    }
  }
`;

const SHARED_PROJECTS = gql`
  query getSharedProjects {
    getSharedProjects {
      id
      projectName
      owner
      users
      createdAt
    }
  }
`;

const DELETE_PROJECT = gql`
  mutation deleteProject($projectId: ID!) {
    deleteProject(projectId: $projectId)
  }
`;

const Homepage = () => {
  const [form] = Form.useForm();

  const { currUser } = useContext(AuthenticationContext);

  const [addProjectError, setAddProjectError] = useState("");

  const getOwnProjects = useQuery(OWN_PROJECTS);
  const getSharedProjects = useQuery(SHARED_PROJECTS);

  const [createProject] = useMutation(CREATE_PROJECT);
  const [deleteProject] = useMutation(DELETE_PROJECT);

  const deleteHandler = (projectId) => {
    deleteProject({
      variables: {
        projectId,
      },
    })
      .then((res) => {
        getOwnProjects.refetch();
        getSharedProjects.refetch();
      })
      .catch((err) => {
        console.error(err.networkError.result.errors[0].message);
      });
    setAddProjectError("");
    form.resetFields();
  };

  const onFinish = (values) => {
    createProject({
      variables: {
        projectName: values.project,
      },
    })
      .then((res) => {
        if (res) {
          setAddProjectError("");
          getOwnProjects.refetch();
          getSharedProjects.refetch();
          form.resetFields();
        }
      })
      .catch((err) => {
        console.error(err.networkError.result.errors[0].message);
        setAddProjectError(err.networkError.result.errors[0].message);
      });
  };

  const homepage = currUser ? (
    <div className="content-page reading">
      <Card className="card-section">
        <h1>Create a New Project</h1>
        <Form
          name="horizontal_login"
          layout="inline"
          className="addForm"
          onFinish={onFinish}
          form={form}
        >
          <Form.Item
            className="inputField"
            name="project"
            rules={[
              { required: true, message: "Please enter the project name!" },
            ]}
          >
            <Input placeholder="Enter Project Name" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              shape="circle"
              icon={<PlusOutlined />}
            />
          </Form.Item>
        </Form>

        {addProjectError !== "" ? (
          <div className="error">{addProjectError}</div>
        ) : (
          <div></div>
        )}
      </Card>
      {getOwnProjects.loading === true ? (
        <p></p>
      ) : (
        <ProjectsList
          title={"My Projects"}
          projectList={getOwnProjects.data.getOwnProjects}
          deleteHandler={deleteHandler}
          isOwner={true}
        />
      )}
      {getSharedProjects.loading === true ? (
        <p></p>
      ) : (
        <ProjectsList
          title={"Shared Projects"}
          projectList={getSharedProjects.data.getSharedProjects}
          deleteHandler={deleteHandler}
          isOwner={false}
        />
      )}
    </div>
  ) : (
    <div className="content-page reading">
      <h1>Multiuser Markdown Editor</h1>
    </div>
  );
  return homepage;
};

export default Homepage;
