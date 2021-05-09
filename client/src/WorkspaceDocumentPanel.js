import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Peer from 'peerjs';
import showdown from 'showdown';
import "./markdown-example.css"

// Our modules
import Peerify from "./PeerifyV2";
import WorkspaceEditor from "./WorkspaceEditor";
import { safeToString, escapeHtml } from './utils'

// ANTD Components
import { Layout, Collapse, Card, Row, Col, message } from 'antd';
const { Content } = Layout;
const { Panel } = Collapse;

// Mutations
const CACHE_PEERID_TO_PROJECTFILE = gql`
  mutation CACHE_PEERID_TO_PROJECTFILE(
    $projectId: String!
    $fileName: String!
    $peerId: String!
  ) {
    connectToProjectFile(
      projectId: $projectId
      fileName: $fileName
      peerId: $peerId
    ) {
      peerId,
    }
  }
`;

const CACHE_REMOVE_PEERID_FROM_PROJECTFILE = gql`
  mutation CACHE_REMOVE_PEERID_FROM_PROJECTFILE(
    $projectId: String!
    $fileName: String!
    $peerId: String!
  ) {
    disconnectPeerFromProjectFile(
      projectId: $projectId
      fileName: $fileName
      peerId: $peerId
    )
  }
`;

const GET_FILE_DATA = gql`
  query GET_FILE_DATA (
    $fileId: ID!
  ) {
    getFile(fileId: $fileId) {
      data
    }
  }
`;

const SAVE_FILE_DATA = gql`
  mutation SAVE_FILE_DATA (
    $fileId: ID!
    $data: String!
  ) {
    addFileData(
      fileId: $fileId
      data: $data
    ) {
      id
    }
  }
`;

const WorkspaceDocumentPanel = ({
  // Required
  myGlobalPeerId,            // My project peerId
  projectId,                 // String
  selectedFile,              // {id: String, fileName: String}
  projectPeerConextRef,      // Project ref for peer info
  // Optional 
  debug                      // if debug is on
}) => {
    
    // For Server Calls
    const [sendPeerId]       = useMutation(CACHE_PEERID_TO_PROJECTFILE);
    const [removeSentPeerId] = useMutation(CACHE_REMOVE_PEERID_FROM_PROJECTFILE);
    const [saveEdit]         = useMutation(SAVE_FILE_DATA);
    const fetchFileData      = useQuery(GET_FILE_DATA, {variables: {fileId: selectedFile.id}});

    // Toggle boolean to force rendered markdown to repaint
    const [trigger, setTrigger]           = useState(false);
    const [renderedHTML, setrenderedHTML] = useState("");

    // Editor
    const converter            = new showdown.Converter();
    const renderHTML           = (text) => setrenderedHTML(converter.makeHtml(text));
    const editorRef            = useRef(null);
    const [cursors, setCursor] = useState(new Map());  // TEMP
    const updatePeerCursor     = (k,v) => setCursor(new Map(cursors.set(k,v)));
    const editorIsSet          = () => {return editorRef != null && editorRef.current != null && editorRef.current.editor != null};
    const docPeerContext       = useRef({
                                  "localToGlobalPeerId": {},
                                  "globalToLocalPeerId": {},
                                  "lastUpdated": ""
                                });

    // Render the editor after some delay so its not too heavy
    let editingTimer           = useRef(null);
    const RENDER_DELAY = 150;

    // For Peerify
    const [myPeerId,  setMyPeerId] = useState(null);       // My peer id
    const [peerConns, setPeerConn] = useState(new Set());  // Set of peer connections we directly talk to
    const [peersData, setPeerData] = useState(new Map());  // Map of peer to most recent data given
    const peerify = useRef({});
    const { startConnection } = peerify.current;           // Pulling out this so that we can specifically check this dependency for useEffect

    // FOR DEBUGING
    const otherPeerIdInput = useRef(null);                // Input for getting another peer id to connect with

    const initData = (peerId, data) => {
      docPeerContext.current.localToGlobalPeerId = data["localToGlobalPeerId"];
      docPeerContext.current.globalToLocalPeerId = data["globalToLocalPeerId"];
    }

    const sendEdit = (change) => {
      peerify.current.sendPeersData({"type": "edit", "change": JSON.stringify(change)});
    };

    const peerInit = (peerId, data) => {
      docPeerContext.current.localToGlobalPeerId[peerId] = data["globalPeerId"];
      docPeerContext.current.globalToLocalPeerId[data["globalPeerId"]] = peerId;
      sendInitDoc(peerId);
      peerify.current.sendPeerMsg(peerId, {
        "type": "initData",
        "localToGlobalPeerId": docPeerContext.current.localToGlobalPeerId,
        "globalToLocalPeerId": docPeerContext.current.globalToLocalPeerId
      });
      peerify.current.sendPeersData({"type": "message", "msg": peerId + " connected!"});
    };

    const peerLeft = (peerId) => {
      let globalPeerId = docPeerContext.current.localToGlobalPeerId[peerId];
      delete docPeerContext.current.globalToLocalPeerId[globalPeerId];
      delete docPeerContext.current.localToGlobalPeerId[peerId];
    };

    const cleanupOnLeave = (e) => {
      if (myPeerId !== null) {
        removeSentPeerId({variables: {
          projectId: projectId,
          fileName: selectedFile.fileName,
          peerId: myPeerId
        }})
        .then(/*nothing to do*/)
        .catch(() => {/*nothing can do*/});
        peerify.current.sendPeersData({
          "type": "peerLeft",
          "globalPeerId": docPeerContext.current.localToGlobalPeerId[peerify.current.peerMeee._id]
        })
      }
    }

    // Render when text changes once in a while so its not so laggy
    useEffect(() => {
      // if (editorIsSet()) renderHTML(escapeHtml(editorRef.current.editor.getValue()));
      if (editingTimer.current != null) clearTimeout(editingTimer.current);
      editingTimer.current = setTimeout(() => {
        if (editorIsSet()) renderHTML(escapeHtml(editorRef.current.editor.getValue()));
      }, RENDER_DELAY);
    }, [trigger]);

    // Setup the peer2peer network
    useEffect(() => {
      peerify.current = Peerify({
        // Required
        "peerMeee": new Peer(),
        "setMyPeerId": setMyPeerId,
        "peerConns": peerConns, 
        "setPeerConn": setPeerConn,
        "peersData": peersData, 
        "setPeerData": setPeerData,
        // Optional
        "onRecieveData": (peerId, data) => {
          if (typeof(data) === "object" && "type" in data) {
            // Factory
            if      (data["type"] === "edit")     recieveEdit(peerId, data);
            else if (data["type"] === "saved")    docPeerContext.current.lastUpdated = data["datetime"];
            else if (data["type"] === "peerInit") peerInit(peerId, data);
            else if (data["type"] === "initDoc")  initDoc(data);
            else if (data["type"] === "initData") initData(peerId, data);
            else if (data["type"] === "peerLeft") peerLeft(peerId);
          }
        },
        // Notify peers to clean connection when a peer leaves
        "onRecieveClosedConnection": (peerId) => {
          peerLeft(peerId);
          peerify.current.sendPeersData({
            type: "peerLeft",
            peerId: peerId
          });
        },
        // Tell peer the associated global peerId
        "onDirectConnect": (peerId) => {
          peerify.current.sendPeerMsg(peerId, {
            "type": "peerInit",
            "globalPeerId": docPeerContext.current.localToGlobalPeerId[peerify.current.peerMeee._id]
          })
        },
      });
      return () => peerify.current.closeConnection();
    }, []);

    // INIT
    useEffect(() => {
      if (startConnection != null) {
        startConnection();
      }
    }, [startConnection])

    // Give my peerId to the server to cache
    useEffect(() => {
      if (myPeerId != null) {
        sendPeerId({variables: {
          projectId: projectId,
          fileName: selectedFile.fileName,
          peerId: myPeerId
        }}).then(response => {
          let peerIds = response.data["connectToProjectFile"];
          if (peerIds.length > 0) peerify.current.directPeerConnect(peerIds[0].peerId);
        }).catch(() => message.error("Unable to connect to the document"));
      }
      return cleanupOnLeave;
    }, [myPeerId])

    // Update changes
    useEffect(() => {
      if (myPeerId != null) {
        (function refresh(){
          setTimeout(function(e) {
            if (editorIsSet()) {
              // Find leader
              let largestPeer = myPeerId;
              peerConns.forEach((conn) => {
                if (conn.peer > largestPeer) {
                  largestPeer = conn.peer;
                }
              })
              // Push changes if I am leader
              if (largestPeer === myPeerId) {
                saveEdit({variables: {
                  fileId: selectedFile.id,
                  data: editorRef.current.editor.getValue()
                }})
                .then(response => {
                  let savedTime = new Date().toGMTString();
                  peerify.current.sendPeersData({"type": "saved", "datetime": savedTime});
                  docPeerContext.current.lastUpdated = savedTime;
                })
                .catch(({networkError}) => message.error(networkError.result.errors[0].message));
              }
            }
            refresh();
          }, 5000);
        }());
      }
    }, [myPeerId])

    // Setup safe exit
    useEffect(() => {
      // Browser leave cleanup
      window.addEventListener("beforeunload", (e) => {  
        e.preventDefault();
        return e.returnValue = 'Are you sure you want to exit?';
      });

      window.addEventListener("unload", (e) => {
        cleanupOnLeave(e);
      });

      // Hook cleanup
      return cleanupOnLeave;
    }, []);

    // Add mapping to my peer id to the global state
    useEffect(() => {
      if (myGlobalPeerId != null && myPeerId != null) {
        docPeerContext.current.localToGlobalPeerId[myPeerId] = myGlobalPeerId;
        docPeerContext.current.globalToLocalPeerId[myGlobalPeerId] = myPeerId;
      }
    }, [myPeerId, myGlobalPeerId]);

    // Create a cursor on the editor
    const makeCursor = (peerId, cursorPos) => {
      let cm        = editorRef.current.editor.doc.cm;
      let peerInfo  = projectPeerConextRef.current.peersAbout[docPeerContext.current.localToGlobalPeerId[peerId]];

      const cursorCoords = cm.cursorCoords(cursorPos);
      const cursorElement = document.createElement('span');

      cursorElement.id = "cursor-" + peerId
      cursorElement.style.height = `${(cursorCoords.bottom - cursorCoords.top)}px`;
      cursorElement.style.borderLeft = '4px solid ' + peerInfo.color;
      cursorElement.style.backgroundColor = peerInfo.color;
      cursorElement.classList.add("cursor");
      
      cursorElement.onmouseover = () => cursorElement.innerText = peerInfo.firstName + " " + peerInfo.lastName + " ";
      cursorElement.onmouseout  = () => cursorElement.innerText = "";

      updatePeerCursor(peerId, cm.setBookmark(cursorPos, { widget: cursorElement }));
    }

    // Add user changes to the editor
    const recieveEdit = (peerId, recievedData) => {
      let edit = JSON.parse(recievedData["change"]);
      if (editorIsSet()) {
        // Update editor with user changes
        editorRef.current.editor.doc.replaceRange((edit.origin === "+delete") ? "": edit.text, edit.from, edit.to, "PEER");
        // Clear the old cursor
        if (cursors.get(peerId) !== undefined) cursors.get(peerId).clear();   
        // Create a new cursor
        let cursorPos = edit.to; cursorPos.ch+=1;                             
        makeCursor(peerId, cursorPos);
      }
    }

    // Send peer new version of document
    const sendInitDoc = (peerId) => {
      if (editorIsSet()) 
        peerify.current.sendPeerMsg(peerId, {"type": "initDoc", "doc": editorRef.current.editor.getValue("\n")});
      else
        console.error("Could not send new peer editor data");
    }

    // Initialize the document with the last server save
    const initDoc = (recievedData) => {
      if (editorIsSet()) {
        editorRef.current.editor.doc.setValue(recievedData["doc"])
      }
    }

    // ------------ DEBUG TOOLS ------------ 

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
              <h3>My global id</h3>
              <div>{myGlobalPeerId}</div>
              <h3>My peerId</h3>
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
                <button type="submit" onClick={() => console.log(peerConns)}>peerConns</button>
                <button type="submit" onClick={() => console.log(docPeerContext.current)}>docPeerContext.current</button>
              </div>
            </Panel>
          </Collapse>
        );
    }
  
    // ------------ RENDER ------------ 

    return (
        <Content className="content-page respect-parent-height">
          { (debug) ? <ConnectionSetup/> : <div></div> } 
          <Card className="card-section">
            <h1>File: {selectedFile.fileName} - Saved: {docPeerContext.current.lastUpdated} </h1>
            { (fetchFileData.error != null) 
            ? <p>Unable to load the file :( This file may be deleted. Please try refreshing</p>
            : <Row gutter={16} style={{height: "75vh"}}>
                <Col span={12} className="respect-parent-height" style={{display: "grid"}}>
                  {(fetchFileData.loading === true)
                    ? <div></div>
                    : <WorkspaceEditor 
                        height="75vh"
                        editorRef={editorRef}
                        initText={fetchFileData.data.getFile.data}
                        onChange={(change) => {
                          // Forward changes only if this user has made them
                          if (change.origin === "+input" || change.origin === "+delete") sendEdit(change);
                          setTrigger(change.from.ch);
                        }}
                      />
                  }
                </Col>
                <Col span={12} className="respect-parent-height" style={{paddingLeft: "1.5em", borderLeft:"2px solid gainsboro", height: "inherit"}}>
                    <div className="markdown-css" dangerouslySetInnerHTML={{ __html: renderedHTML }} />
                </Col>
            </Row>}
          </Card>      
        </Content>
    )
};

export default WorkspaceDocumentPanel;
