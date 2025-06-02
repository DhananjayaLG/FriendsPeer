// peerService.js
import Peer from 'peerjs';

let peer;
let currentPeerId;
let currentDataChannel;

export const initPeerConnection = (callback) => {
  peer = new Peer(undefined, {
    host: 'peerjs.com', // You can use your own PeerJS server if you prefer.
    secure: true,
    port: 443,
  });

  peer.on('open', (id) => {
    currentPeerId = id;
    callback(id);
  });

  peer.on('connection', (conn) => {
    currentDataChannel = conn;
    conn.on('data', (data) => {
      console.log('Message received:', data);
    });
  });

  return peer;
};

export const connectToPeer = (peerId, callback) => {
  const conn = peer.connect(peerId);
  conn.on('open', () => {
    currentDataChannel = conn;
    callback();
  });

  conn.on('data', (data) => {
    console.log('Message received:', data);
  });
};

export const sendMessage = (message) => {
  if (currentDataChannel) {
    currentDataChannel.send(message);
  }
};
