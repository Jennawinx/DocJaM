import React, { useState, useRef, useEffect, useContext } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import Peer from 'peerjs';
import "./Workspace.css"

// Our modules
import { AuthenticationContext } from "./contextTypes/authentication";
import { safeToString, randomMediumColour, getUrlParam } from './utils';
import Peerify from "./PeerifyV2";
import WorkspaceDocumentPanel from "./WorkspaceDocumentPanel";
import FileNavigator from "./WorkspaceFileNavigator";
import SideChat from './SideChat';

// ANTD
import { Layout, Button, Collapse, Card, message } from 'antd';
const { Sider, Content } = Layout;
const { Panel } = Collapse;

// Mutations
const CACHE_PEERID_TO_PROJECT = gql`
  mutation CACHE_PEERID_TO_PROJECT(
    $projectId: String!
    $peerId: String!
  ) {
    connectToProject(
      projectId: $projectId
      peerId: $peerId
    ) {
      peerId,
    }
  }
`;

const CACHE_REMOVE_PEERID_FROM_PROJECT = gql`
  mutation CACHE_REMOVE_PEERID_FROM_PROJECT(
    $projectId: String!
    $peerId: String!
  ) {
    disconnectPeerFromProject(
      projectId: $projectId
      peerId: $peerId
    )
  }
`;

const GET_FILES_LIST = gql`
  query GET_FILES_LIST ($projectId: ID!) {
    getFiles(projectId: $projectId) {
      id,
      fileName
    }
  }
`;

const ADD_FILE = gql`
  mutation ADD_FILE(
    $projectId: ID!
    $fileName: String!
  ) {
    createFile (
      projectId: $projectId, 
      fileName: $fileName
    ) {
      id
    }
  }
`

const DELETE_FILE = gql`
  mutation DELETE_FILE(
    $fileId: ID!
  ) {
    deleteFile (fileId: $fileId)
  }
`

const Workspace = ({projectId, debug}) => {
  
    // Session
    const { currUser } = useContext(AuthenticationContext); 
    
    // For Server Calls
    const [sendPeerId]       = useMutation(CACHE_PEERID_TO_PROJECT);
    const [removeSentPeerId] = useMutation(CACHE_REMOVE_PEERID_FROM_PROJECT);
    const [addFile]          = useMutation(ADD_FILE);
    const [deleteFile]       = useMutation(DELETE_FILE);
    const fetchedFilesList   = useQuery(GET_FILES_LIST, {variables: {projectId: projectId}});

    // For Peerify
    const [myPeerId,  setMyPeerId] = useState(null);       // My peer id
    const [peerConns, setPeerConn] = useState(new Set());  // Set of peer connections we directly talk to
    const [peersData, setPeerData] = useState(new Map());  // Map of peer to most recent data given
    const peerify = useRef({});

    // Input for getting another peer id to connect with // TODO: Remove
    const otherPeerIdInput = useRef(null);        

    // For workspace
    const [selectedFile, setSelectedFile] = useState(null);
    const projectPeerContext              = useRef({"peersAbout": {}});

    // Update the chat with messages from a message
    const recieveMessage = (peerId, data) => {
      if (projectPeerContext.current.peersAbout[peerId] != null) {
        UIappendMessage(projectPeerContext.current.peersAbout[peerId].firstName, data["message"], false);
      }
    };

    // Add connection updates when new peers are connected
    const connectionStatusUpdate = (peerId, data) => {
      if (data["message"] != null) {
        let item = document.createElement('div');
        item.classList.add("chat-connection-status");
        item.innerText = data["message"];
        document.getElementById("chatContainer").appendChild(item);
      }
    };

    // Save infomation about the peer that joined the network
    const saveNewPeer = (peerId, data) => {
      projectPeerContext.current.peersAbout[peerId] = data["newPeer"];
      peerify.current.sendPeerMsg(peerId, {
        "type": "initData",
        "peersAbout": projectPeerContext.current.peersAbout
      });
      peerify.current.sendPeerMsg(peerId, {
        "type": "connection", 
        "message": "You are connected to the project." 
      });
    };

    // Accept initial network state
    const recieveInitData = (peerId, data) => {
      projectPeerContext.current.peersAbout = data["peersAbout"];
      peerify.current.sendPeersData({
        "type": "connection", 
        "message": projectPeerContext.current.peersAbout[peerify.current.peerMeee._id].firstName + " " + projectPeerContext.current.peersAbout[peerify.current.peerMeee._id].lastName + " entered the project space." 
      });
    };
  
    // Remove cache from server if possible
    const cleanupOnLeave = () => {
      if (myPeerId !== null) {
        removeSentPeerId({variables: {
          projectId: projectId,
          peerId: myPeerId
        }})
        .then(/*nothing to do*/)
        .catch(() => {/*nothing can do*/});
      }
    }

    // Setup the peer 2 peer network
    useEffect(() => {
      peerify.current = Peerify({
        // Required
        "peerMeee":     new Peer(),
        "setMyPeerId":  setMyPeerId,
        "peerConns":    peerConns, 
        "setPeerConn":  setPeerConn,
        "peersData":    peersData, 
        "setPeerData":  setPeerData,
        // Optional
        "onRecieveData": (peerId, data) => {
          if (typeof(data) === "object" && "type" in data) {
            // Factory
            if      (data["type"] === "message")    recieveMessage(peerId, data);
            else if (data["type"] === "peerInit")   saveNewPeer(peerId, data);
            else if (data["type"] === "initData")   recieveInitData(peerId, data);
            else if (data["type"] === "peerLeft")   delete projectPeerContext.current.peersAbout[peerId];
            else if (data["type"] === "connection") connectionStatusUpdate(peerId, data);
            else if (data["type"] === "fileList")   fetchedFilesList.refetch();
          }
        },
        // Add save new peer that joins
        "onDirectConnect": (peerId) => {
          peerify.current.sendPeerMsg(peerId, {
            "type": "peerInit",
            "newPeer": projectPeerContext.current.peersAbout[peerify.current.peerMeee._id]
          })
        },
        // Notify that a direct peer has left
        "onRecieveClosedConnection": (peerId) => {
          delete projectPeerContext.current.peersAbout[peerId];
          peerify.current.sendPeersData({
            type: "peerLeft",
            peerId: peerId
          })
        }
      })
      return () => peerify.current.closeConnection();
    }, [projectId]);

    // INIT
    useEffect(() => {
      if (peerify.current.startConnection != null) {
        peerify.current.startConnection();
      }
    }, [myPeerId])

    // Cleanup when the user closes the browser
    useEffect(() => {
      window.addEventListener("unload", (e) => {
        cleanupOnLeave();
      });
    }, [cleanupOnLeave])

    // Give my peerId to the server to cache
    useEffect(() => {
      if (myPeerId != null) {
        sendPeerId({variables: {
          projectId: projectId,
          peerId: myPeerId
        }})
        .then(response => {
          let peerIds = response.data.connectToProject;
          if (peerIds.length > 0) peerify.current.directPeerConnect(peerIds[0].peerId);
        })
        .catch(() => message.error("Unable to initiate project connection"));
      }
      return cleanupOnLeave;
    }, [myPeerId])

    // Add infomation about me for the network
    useEffect(() => {
      if (myPeerId != null) {
        projectPeerContext.current.peersAbout[myPeerId] = {
          "peerId": myPeerId,
          "peerUsername": currUser.username,
          "firstName": currUser.firstname, // TODO:
          "lastName": currUser.lastname,
          "color": randomMediumColour()
        }
      }      
    }, [myPeerId]);

    // Kick user from the editor when the file no longer exists
    useEffect(() => {
      console.log("fileslist", fetchedFilesList.data, selectedFile);
      if (selectedFile != null && fetchedFilesList.data != null) {
        if (fetchedFilesList.data.getFiles.filter((file) => (file === selectedFile)).length < 1) {
          message.error("The file " + selectedFile.fileName + " has been deleted.");
          setSelectedFile(null);
        }
      }
    }, [fetchedFilesList.data])

    // ------------ Mutates chat directly through DOM ----------

    // Adds new messages to the chat
    const UIappendMessage = (displayName, message, isMines) => {
      const chatContainer = document.getElementById("chatContainer");
      if (chatContainer != null) {
        let item = document.createElement('div');
        item.classList.add("chat-message");

        if (isMines) item.classList.add("my-chat-message");

        item.innerHTML = `
          <div class="chat-username">${displayName}</div>
          <div class="chat-bubble">${message}</div>
        `;
        chatContainer.appendChild(item);
      }
    }
    
    // Sends peer a chat mesage
    const sendChatMessage = (message) => {
      UIappendMessage("Me", message, true);
      peerify.current.sendPeersData({
        "type": "message", 
        "message": message
      });
    }

    // Creates a new file and notifies peers
    const createFileHandler = (fileName) => {
      addFile({variables: {
        projectId: projectId,
        fileName: fileName 
      }})
      .then(response => {
        peerify.current.sendPeersData({"type": "fileList"});
        fetchedFilesList.refetch();
      })
      .catch(({networkError}) => message.error(networkError.result.errors[0].message));
    };

    // Deletes a new file and notifies peers
    const deleteFileHandler = (fileId) => {
      deleteFile({variables: {
        projectId: projectId,
        fileId: fileId
      }})
      .then(() => {
        peerify.current.sendPeersData({"type": "fileList"});
        fetchedFilesList.refetch();
      })
      .catch(({networkError}) => message.error(networkError.result.errors[0].message));
    };

    // ------------ DEBUG ------------ 

    const handleFormSubmit = () => peerify.current.directPeerConnect(otherPeerIdInput.current.value);

    let ListPeers = () => {
        return Array.from(peersData, ([key, value]) => 
          <div key={key} id={key}>
            { (key in peerify.current.peerMeee.connections) ?
                <h4>Direct Peer: {key}</h4>
              : <h4>Indirect Peer: {key}</h4>
            }
            <pre>{safeToString(value)}</pre>
          </div>
        );
    };

    function ConnectionSetup() {
        return (
            <Collapse defaultActiveKey={['1']}>
            <Panel header="Connection Settings" key="1">
              <h3>My peerId </h3>
              <div>{myPeerId}</div>
              <h3>Join</h3>
              <div>
                <input ref={otherPeerIdInput} type="text" placeholder="Peer" />
                <button type="submit" onClick={handleFormSubmit}>Join</button>
              </div>
              <h3>My Message</h3>
              <textarea onChange={(e) => peerify.current.sendPeersData(e.target.value)}></textarea>
              <h3>Connected Users:</h3>
              <ListPeers/>
              <div>
                <button type="submit" onClick={() => console.log(peerify.current.peerMeee)}>peerMeee</button>
                <button type="submit" onClick={() => console.log(peerify.current.peerConns)}>peerConns</button>
                <button type="submit" onClick={() => console.log(projectPeerContext.current.peersAbout)}>peersAbout</button>
                <button type="submit" onClick={() => console.log(fetchedFilesList)}>fetchedFilesList</button>
                <button type="submit" onClick={() => console.log(peerify)}>peerify</button>
              </div>
            </Panel>
          </Collapse>
        );
    }

    // ---------------------------------

    // Display the list of peers working on this document
    let PeerListDisplay = () => {
      return Object.keys(projectPeerContext.current.peersAbout).map((peerId) => {
        let value = projectPeerContext.current.peersAbout[peerId];
        if (value != null) {
          return (
            <Button key={peerId} block="true" style={{color: "white", background: value.color}} onClick={() => console.log(peerId)}>
              {value.firstName[0] + value.lastName[0]}
            </Button>
          )
        } else {
          return <div key={peerId}></div>
        }
      });
    };

    return (
      <Layout className="respect-parent-height">
        {(fetchedFilesList.loading === true) 
          ? <div></div> 
          : <FileNavigator 
              className="fileNav respect-parent-height" 
              fileList={fetchedFilesList.data.getFiles}
              onSelect={setSelectedFile}
              onCreate={createFileHandler}
              onDelete={deleteFileHandler}
            />
        }
        <Sider className="fileNav respect-parent-height" breakpoint="xxl" collapsedWidth="60" width="60" style={{background: "inherit", padding: "10em 0.5em 0.5em 0.5em", textAlign: "center"}}>
          <div>Users</div>
          <PeerListDisplay/>
        </Sider>
        <SideChat onSend={sendChatMessage}/>
        { (debug) ? <ConnectionSetup/> : <div></div> } 
        { (selectedFile != null && projectId != null) 
          ? <WorkspaceDocumentPanel 
            key={selectedFile.id}
            projectId={projectId}
            myGlobalPeerId={myPeerId} 
            selectedFile={selectedFile}
            projectPeerConextRef={projectPeerContext}  
          />
          : <Content className="content-page respect-parent-height">
          <Card className="card-section">
            <h1>Welcome to the Project Workspace</h1>
            <div style={{textAlign:"center"}}>
              <h4>Tutorial</h4>
              <img className="project-tutorial" alt="tutorial" src="workspace-tutorial.png"/>
            </div>
          </Card>      
        </Content>
        }
      </Layout>
    )
}

const WorkspaceMulti = () => {
  let projectId = getUrlParam("projectID");
  return <Workspace key={projectId} projectId={projectId}/>;
};

export default WorkspaceMulti;
