import React from "react";
import { Card, List, Button, Modal } from "antd";
import {
  DeleteOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import { Link } from "react-router-dom";
import { PROJECT_URL, COLLAB_URL } from "./urls";
import "./SigninPage.css";

const { confirm } = Modal;

const ProjectsList = ({ projectList, title, deleteHandler, isOwner }) => {
  // The following delete confirm alert is from: https://ant.design/components/modal/
  const showDeleteConfirm = (projectId) => {
    confirm({
      title: "Are you sure you want to delete this project?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        deleteHandler(projectId);
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  return (
    <Card className="card-section">
      <h1>{title}</h1>
      <List
        itemLayout="horizontal"
        dataSource={projectList}
        renderItem={(proj) => (
          <List.Item
            actions={
              isOwner === true
                ? [
                    <Link
                      to={
                        COLLAB_URL +
                        "?projectID=" +
                        proj.id +
                        "&projectName=" +
                        proj.projectName +
                        "&owner=" +
                        proj.owner +
                        "&isOwner=true"
                      }
                    >
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<TeamOutlined />}
                      />
                    </Link>,
                    <Button
                      onClick={() => showDeleteConfirm(proj.id)}
                      type="primary"
                      shape="circle"
                      icon={<DeleteOutlined />}
                      danger
                    />,
                  ]
                : [
                    <Link
                      to={
                        COLLAB_URL +
                        "?projectID=" +
                        proj.id +
                        "&projectName=" +
                        proj.projectName +
                        "&owner=" +
                        proj.owner +
                        "&isOwner=false"
                      }
                    >
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<TeamOutlined />}
                      />
                    </Link>,
                  ]
            }
          >
            <List.Item.Meta
              title={
                <Link to={PROJECT_URL + "?projectID=" + proj.id}>
                  {proj.projectName}
                </Link>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ProjectsList;
