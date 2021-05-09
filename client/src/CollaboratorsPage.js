import React, { useRef, useState } from "react";
import { Select, Button, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { gql } from "graphql-tag";
import "./SigninPage.css";
import UsersList from "./UsersList";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { getUrlParam } from "./utils";
import "./index.css";
import "./ErrorMessage.css";
import "./InputForm.css";

const { Option } = Select;

const ADD_USER = gql`
  mutation addCollaborator($projectId: ID!, $username: String!) {
    addCollaborator(projectId: $projectId, username: $username) {
      id
      projectName
      owner
      users
      createdAt
    }
  }
`;
const DELETE_USER = gql`
  mutation deleteCollaborator($projectId: ID!, $username: String!) {
    deleteCollaborator(projectId: $projectId, username: $username) {
      id
      projectName
      owner
      users
      createdAt
    }
  }
`;

const USER = gql`
  query user($userId: ID!) {
    user(userId: $userId) {
      firstname
    }
  }
`;

const USERS = gql`
  query getProjectCollaborators($projectId: ID!) {
    getProjectCollaborators(projectId: $projectId) {
      id
      username
      firstname
    }
  }
`;

const NON_USERS = gql`
  query getNonCollaborators($projectId: ID!) {
    getNonCollaborators(projectId: $projectId) {
      id
      username
      firstname
    }
  }
`;

const Collaborators = ({ projectId, projectName, owner, isOwner }) => {
  // Queries to get and add users
  const getUsers = useQuery(USERS, { variables: { projectId } });
  const projectOwner = useQuery(USER, { variables: { userId: owner } });
  const getNonUsers = useQuery(NON_USERS, { variables: { projectId } });

  const [addUser] = useMutation(ADD_USER);

  // For error handling
  const [addUserError, setAddUserError] = useState("");

  // To get the username of who is selected
  const username = useRef("");

  // Called when add button is clicked
  const onAddUser = () => {
    addUser({
      variables: {
        projectId,
        username: username.current,
      },
    })
      .then((res) => {
        if (res) {
          setAddUserError("");
          getUsers.refetch();
          getNonUsers.refetch();
        }
      })
      .catch((err) => {
        console.log(err.networkError.result.errors[0].message);
        setAddUserError(err.networkError.result.errors[0].message);
      });
  };

  // To delete a user
  const [deleteUser] = useMutation(DELETE_USER);

  const deleteHandler = (username) => {
    deleteUser({
      variables: {
        projectId,
        username,
      },
    })
      .then((res) => {
        if (res) {
          setAddUserError("");
          getUsers.refetch();
          getNonUsers.refetch();
        }
      })
      .catch((err) => {
        console.log(err.networkError.result.errors[0].message);
      });
  };

  // The following modal template is from: https://ant.design/components/modal/
  return (
    <div>
      <Card className="card-section">
        <div className="project_header">
          <h1 className="card_title">Project: {projectName}</h1>
          <h1>
            {projectOwner.loading === true
              ? ""
              : "Owner: " + projectOwner.data.user.firstname}
          </h1>
        </div>
      </Card>

      {isOwner === true ? (
        <Card className="card-section">
          <div className="addForm">
            <h2>Add New User</h2>
            <Select
              showSearch
              className="inputField select"
              placeholder="Select a user"
              filterOption={false}
              onChange={(value) => {
                username.current = value;
              }}
              onSearch={(value) => {
                username.current = value;
              }}
            >
              {getNonUsers.loading === true ? (
                <Option></Option>
              ) : (
                getNonUsers.data.getNonCollaborators.length > 0 &&
                getNonUsers.data.getNonCollaborators.map((user) => {
                  return (
                    <Option key={user.id} value={user.username}>
                      {user.username}
                    </Option>
                  );
                })
              )}
            </Select>
            <Button
              type="primary"
              htmlType="submit"
              shape="circle"
              onClick={onAddUser}
              icon={<PlusOutlined />}
            />
          </div>
          {addUserError !== "" ? (
            <div className="error">{addUserError}</div>
          ) : (
            <div></div>
          )}
        </Card>
      ) : (
        <div></div>
      )}
      {getUsers.loading === true ? (
        <p></p>
      ) : (
        <UsersList
          usersList={getUsers.data.getProjectCollaborators}
          owner={owner}
          isOwner={isOwner}
          deleteHandler={deleteHandler}
        />
      )}
    </div>
  );
};

const CollaboratorsPage = () => {
  let projectId = getUrlParam("projectID");
  let projectName = getUrlParam("projectName");
  let owner = getUrlParam("owner");
  let isOwner = getUrlParam("isOwner");

  return (
    <Collaborators
      key={projectId}
      projectId={projectId}
      projectName={projectName}
      owner={owner}
      isOwner={isOwner === "true"}
    />
  );
};

export default CollaboratorsPage;
