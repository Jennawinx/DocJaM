import React, { useState } from "react";
import { DeleteFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { Layout, Menu, Button, Input, Modal } from "antd";
const { confirm } = Modal;


const { Sider } = Layout;
// const { SubMenu } = Menu;

const AddFile = ({onCreate}) => {
  const [fileNameInput, setfileNameInput] = useState("");
  const addFile = (fileName) => {
    if (fileName != null && fileName.trim() !== "") {
      onCreate(fileName);
      setfileNameInput("");
    }
  };
  return (
    <Input.Group compact style={{margin: "10px"}}>
      <Input placeholder="File Name" block="true" style={{width: "68%"}} 
        onChange={(e) => setfileNameInput(e.target.value)}
        value={fileNameInput}/>
      <Button  type="primary" style={{width: "24%"}} onClick={() => addFile(fileNameInput)}>Add</Button>
    </Input.Group>
  )
}

const FileNavigator = ({
    // Required
    fileList, 
    onDelete,
    onCreate,
    onSelect,
    // Optional
    className
  }) => {

  const showDeleteConfirm = (fileId) => {
    confirm({
      title: "Are you sure you want to delete this file?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => onDelete(fileId),
    });
  };

  return (
    <Sider style={{overflow: "visible"}} breakpoint="xxl" collapsedWidth="0" width="250" className={className} collapsible>
      <AddFile onCreate={onCreate}/>
      <Menu mode="inline" theme="dark">
        <Menu.Item key="files" className="display-only-menu-item" disabled>Files</Menu.Item>
        {fileList.map((file) => 
          <Menu.Item key={file.id}>
            <div style={{display:"flex", justifyContent:"space-between"}}>
              <span style={{flexGrow:1}} onClick={() => onSelect(file)}>{file.fileName}</span>
              <span><DeleteFilled onClick={() => showDeleteConfirm(file.id)}/></span>
            </div>
          </Menu.Item>
        )}
        <Menu.Item key="margin_for_button" className="invisible"></Menu.Item>
      </Menu>
    </Sider>
  );
}

export default FileNavigator;