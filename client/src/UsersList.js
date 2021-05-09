import React from "react";
import { Card, List, Button, Modal } from "antd";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import "./SigninPage.css";

const { confirm } = Modal;

const UsersList = ({ usersList, deleteHandler, isOwner }) => {
  // The following delete confirm alert is from: https://ant.design/components/modal/
  const showDeleteConfirm = (username) => {
    confirm({
      title: "Are you sure you want to remove this user?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        console.log(username);
        deleteHandler(username);
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  return (
    <Card className="card-section">
      <h1>Collaborators</h1>

      <List
        itemLayout="horizontal"
        dataSource={usersList}
        renderItem={(user) => (
          <List.Item
            actions={
              isOwner === true
                ? [
                    <Button
                      onClick={() => showDeleteConfirm(user.username)}
                      type="primary"
                      shape="circle"
                      icon={<DeleteOutlined />}
                      danger
                    />,
                  ]
                : []
            }
          >
            <List.Item.Meta title={user.firstname} />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default UsersList;
