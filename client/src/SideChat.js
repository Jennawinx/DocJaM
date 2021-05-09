import React, { useState } from 'react';
import { MessageOutlined } from '@ant-design/icons';
import { Layout, Input, Button } from 'antd';
import "./SideChat.css"

const { Sider } = Layout;

const SideChat = ({
  onSend
}) => {
    const [messageInput, setMessageInput] = useState("");

    return (
      <Sider theme="light" className="side-chat respect-parent-height" style={{overflow: "visible"}} breakpoint="xxl" collapsedWidth="0" width="350" collapsible trigger={<MessageOutlined />}>
        <div className="content-page respect-parent-height">
          <div style={{display: "flex", flexDirection:"column", height:"100%"}}>
            <div>
              <h1>Chat</h1>
              <hr/>
            </div>
            {/* EXAMPLE */}
            <div id="chatContainer" style={{flexGrow:"2", overflow:"scroll"}}></div>
            {/* 
              <div className="chat-message my-chat-message">
                <div className="chat-username">User name</div>
                <div className="chat-bubble">
                  My bubble Hello everyone awf awepf awefp fa awf awf awefa awef aafawef owpef aowpef apwofe awpfoie apwoefi apwef
                </div>
              </div>
              <div className="chat-message">
                <div className="chat-username">User name</div>
                <div className="chat-bubble">
                  My bubble Hello everyone awf awepf awefp fa awf awf awefa awef aafawef owpef aowpef apwofe awpfoie apwoefi apwef
                </div>
              </div> 
            */}
            <div>
              <Input.Group compact style={{margin: "5px 4px 0px 4px"}}>
                <Input placeholder="Message" block="true" style={{width: "70%"}} 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}/>
                <Button  type="primary" style={{width: "28%"}} onClick={() => {onSend(messageInput); setMessageInput("");}}> Send </Button>
              </Input.Group>
            </div>
          </div>
        </div>
      </Sider>
    )
}

export default SideChat;