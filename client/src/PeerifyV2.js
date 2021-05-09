import { updateMap } from './utils'

/**
 * This module exposes the commands to setup and communicate in a Peer-2-Peer network
 * Read-only connections are exposed for debugging only, do not overwrite
 */

// TODO: resilience when peer graph is broken because a peer disconnects
//       Add a map to track the upstream peer for every peer to b

function Peerify({
  // Required
  peerMeee,                     // peerJS peer object
  
  // Required Hooks
  myPeerId,  setMyPeerId,       // const [myPeerId,  setMyPeerId] = useState("");
  peerConns, setPeerConn,       // const [peerConns, setPeerConn] = useState(new Set());
  peersData, setPeerData,       // const [peersData, setPeerData] = useState(new Map());
  
  // Optional
  onRecieveNewConnection,       // (peerId) => {}         // Handler called when user recieves a new peer connection
  onRecieveClosedConnection,    // (peerId) => {}         // Handler called when user is signaled a closed connection from a peer
  onRecieveData,                // (peerId, data) => {}   // Handler is called when user recieves a message from any peer
  onDirectConnect,              // (peerId) => {}         // Handler is called when this peer initiates a connection
  forwardingOn,                 // bool or true           // Forwards messages to all peers if true, does ammature flooding, beware of cyclic networks
}) {

  const _forwardingOn = (forwardingOn === undefined) 
    ? true 
    : forwardingOn;
  
  const _onRecieveData = (onRecieveData === undefined) 
    ? (peerId, data) => {console.log("Peer", peerId, "sent", data)} 
    : onRecieveData;
  
  const _onRecieveNewConnection = (onRecieveNewConnection === undefined) 
    ? (peerId) => {
      // console.log("Peer", peerId, "joined");
      sendPeerMsg(peerId, "Hello the other world!");
    }
    : onRecieveNewConnection;
  
  const _onRecieveClosedConnection = (onRecieveClosedConnection === undefined) 
    ? (peerId) => console.log("Peer", peerId, "left")
    : onRecieveClosedConnection;
  
  const _onDirectConnect = (onDirectConnect === undefined) 
    ? (peerId) => sendPeerMsg(peerId, "Hi!")
    : onDirectConnect;

  const updatePeerData = (k,v) => updateMap(peersData, setPeerData, k, v);

  /**
   * Directly connect the user to a peer with the peer id `id`
   */
  let directConnect = (id) => {
    let conn = peerMeee.connect(id);
    // Save connected peer
    setPeerConn(peerConns.add(conn));
    conn.on('open', () => {
      _onDirectConnect(id);
      recieveDirectMsg(conn);
    });
  }

  /*  Sends the msg, always make the response in this form
      {peerId: "", data: ""}
  */
  let _sendDirectMsg = (conn, myId, msg) => {
    conn.send({"peerId": myId, "data":msg});
  }

  /** 
   *  Sends the msg to all peers in the network
   **/
  let sendAllMsg = (msg) => {
    peerConns.forEach((conn) => {
      _sendDirectMsg(conn, peerMeee.id, msg);
    })
  }

  /**
   * TODO: inefficient
   */
  let sendPeerMsg = (peerId, msg) => {
    peerConns.forEach((conn) => {
      if (conn.peer === peerId) _sendDirectMsg(conn, peerMeee.id, msg);
    })
  }

  /**
   * Forwards data to all connected peers expect 
   * for the one who sent it and who forwarded it
   * NOTE: Assumption is there is no cycles in the peer network
   */
  let forwardDataAll = (data, forwardFrom) => {
    if (_forwardingOn === true) {
      peerConns.forEach((conn) => {
        if (conn.peer !== data["peerId"] && conn.peer !== forwardFrom) {
          conn.send(data);
        }
      })
    }
  }

  /**
   * Recieves data from the connection
   */
  let recieveDirectMsg = (conn) => {
    conn.on('data', (data) => {
      updatePeerData(data["peerId"], data["data"]);
      forwardDataAll(data, conn.peer);
      _onRecieveData(data["peerId"], data["data"]);
    });
  };

  /**
   * IMPORTANT: Setup connection here
   */
   let startConnection = () => {
    // Open and ready my connection
    peerMeee.on('open', (id) => {
      setMyPeerId(id);
      // Connect
      peerMeee.on('connection', (conn) => {
        // Handler for connection is recieved        
        conn.on('open', () => {
          // Save recieved connections
          setPeerConn(peerConns.add(conn));
          recieveDirectMsg(conn);
          _onRecieveNewConnection(conn.peer);
        });
        // Handler for when connected connection is closed
        conn.on('close', () => {
          // Cleanup when a connection is closed
          setPeerConn(peerConns => {peerConns.delete(conn); return peerConns;});
          updatePeerData(conn.peer, null);
          _onRecieveClosedConnection(conn.peer);
        });
      });
    });   
  };

  let closeConnection = () => {
    peerMeee.destroy();
  };

  return {
    "peerMeee": peerMeee,
    "sendPeerMsg": sendPeerMsg,
    "sendPeersData": sendAllMsg,
    "startConnection": startConnection,
    "directPeerConnect": directConnect,
    "closeConnection": closeConnection
  };
}

export default Peerify;

/*
      For rendering

  const otherPeerIdInput = useRef(null);    

  function ConnectionSetup() {
      return (
          <Collapse defaultActiveKey={['1']}>
          <Panel header="Connection Settings" key="1">
            <h3>My peerId {safeToString(ToggleRender)} </h3>
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

  let PeerListDisplay = () => {
    console.log("PeerListDisplay", projectPeerContext.current.peersAbout);
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


 */