
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
import {
  db,
  ref,
  push,
  onChildAdded,
  remove,
  set,
} from './firebase';
import { useChatStore } from './useChatStore';

const iceServers = {
  iceServers: [
        {
          urls: 'turn:bn-turn2.xirsys.com:80?transport=udp',
          username: 'RM_cBLRQ6Mh3KZ2HjUwMew5F3HGhQvE8j51hqvy0FruBfW1MUUx1iA3jxVM2HmnZAAAAAGgTMfVEaGFuYW5qYXlhUw==',
          credential: '061168ba-2667-11f0-9b3e-0242ac140004',
        },
        { urls: "stun:stun.l.google.com:19302" }
      ]
};

export const createPeerConnection = (
  peerId,
  myId,
  roomId,
  peerConnections,
  dataChannels,
  setupDataChannel
) => {
  const pc = new RTCPeerConnection(iceServers);

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      push(ref(db, `signals/${roomId}`), {
        type: 'ice',
        candidate: event.candidate,
        peerId,
        sender: myId,
      });
    }
  };

  pc.ondatachannel = (event) => {
    const dc = event.channel;
    dataChannels.current[peerId] = dc;
    setupDataChannel(dc, peerId);
  };

  return pc;
};

export const setupDataChannel = (dc, peerId, chat, addMessage, isHost) => {
  dc.onopen = () => {
    console.log("data channel open .. is host=",isHost)
    if (isHost) {
      chat.forEach((msg) => dc.send(JSON.stringify(msg)));
    }
  };

  dc.onmessage = (event) => {
    const data = JSON.parse(event.data);
    addMessage({ ...data, sender: peerId });
  };
};

export const listenForJoiners = (
  myId,
  roomId,
  peerConnections,
  dataChannels,
  chat,
  addMessage,
  isHost
) => {
  const signalRef = ref(db, `signals/${roomId}`);
  onChildAdded(signalRef, async (snapshot) => {
    console.log("on child added method")
    const data = snapshot.val();
    if (data.sender === myId) return;

    const remoteId = data.peerId;

    // if (data.type === 'leave') {
    //     const remoteId = peerId;

    //     console.log("🧹 [LEAVE] Remote ID to delete:", remoteId);
    //     console.log("🧹 [LEAVE] Connections BEFORE delete:", { ...peerConnections.current });

    //     const connection = peerConnections.current[remoteId];

    //     if (connection?.pc) {
    //         try {
    //             connection.pc.close();
    //             console.log(`✅ [LEAVE] Closed peer connection for ${remoteId}`);
    //         } catch (err) {
    //             console.warn(`⚠️ [LEAVE] Error closing peer connection for ${remoteId}:`, err);
    //         }
    //     }

    //     // Remove the connection safely using destructuring
    //     const { [remoteId]: _, ...rest } = connections.current;
    //     peerConnections.current = rest;

    //     console.log("🧹 [LEAVE] Connections AFTER delete:", { ...peerConnections.current });
    // }


    if (data.type === 'offer') {
        console.log("data.type=offer")
      const pc = createPeerConnection(remoteId, myId, roomId, peerConnections, dataChannels, (dc, peerId) =>
        setupDataChannel(dc, peerId, chat, addMessage, isHost)
      );
      peerConnections.current[remoteId] = pc;

      console.log("data.offer=",data.offer)
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      console.log("set remote description done")
      const answer = await pc.createAnswer();
      console.log("answer=",answer)
      await pc.setLocalDescription(answer);
      console.log("set local description done")


      push(ref(db, `signals/${roomId}`), {
        type: 'answer',
        answer,
        peerId: remoteId,
        sender: myId,
      });
      console.log("answer push done")
    } else if (data.type === 'ice') {
        console.log("data.type==ice")
      await peerConnections.current[remoteId]?.addIceCandidate(
        new RTCIceCandidate(data.candidate)
      );
    }
  });
};

export const listenForHost = (myId, roomId, peerConnections) => {
console.log("listen for host.. peer connections=",JSON.parse(JSON.stringify(peerConnections.current)))
  const signalRef = ref(db, `signals/${roomId}`);
  onChildAdded(signalRef, async (snapshot) => {
    console.log("listen for host - on child added method")
    const data = snapshot.val();
    if (data.sender === myId) return;

    if (data.type === 'answer') {
        console.log("data.type=answer in peer side")
      await peerConnections.current['host']?.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    } else if (data.type === 'ice') {
        console.log("data.type=ice in peer side and peer connections=",JSON.parse(JSON.stringify(peerConnections.current)))
      await peerConnections.current['host']?.addIceCandidate(
        new RTCIceCandidate(data.candidate)
      );
    }
  });
};




// import {
//   RTCPeerConnection,
//   RTCSessionDescription,
//   RTCIceCandidate,
// } from 'react-native-webrtc';
// import {
//   db,
//   ref,
//   push,
//   onChildAdded,
//   remove,
//   set,
// } from './firebase';
// import { useChatStore } from './useChatStore';

// const iceServers = {
//   iceServers: [
//         {
//           urls: 'turn:bn-turn2.xirsys.com:80?transport=udp',
//           username: 'RM_cBLRQ6Mh3KZ2HjUwMew5F3HGhQvE8j51hqvy0FruBfW1MUUx1iA3jxVM2HmnZAAAAAGgTMfVEaGFuYW5qYXlhUw==',
//           credential: '061168ba-2667-11f0-9b3e-0242ac140004',
//         },
//         { urls: "stun:stun.l.google.com:19302" }
//       ]
// };

// export const createPeerConnection = (
//   peerId,
//   myId,
//   roomId,
//   peerConnections,
//   dataChannels,
//   setupDataChannel
// ) => {
//   const pc = new RTCPeerConnection(iceServers);

//   pc.onicecandidate = (event) => {
//     if (event.candidate) {
//       push(ref(db, `signals/${roomId}`), {
//         type: 'ice',
//         candidate: event.candidate,
//         peerId,
//         sender: myId,
//       });
//     }
//   };

//   pc.ondatachannel = (event) => {
//     const dc = event.channel;
//     dataChannels.current[peerId] = dc;
//     setupDataChannel(dc, peerId);
//   };

//   return pc;
// };

// export const setupDataChannel = (dc, peerId, chat, addMessage, isHost) => {
//   dc.onopen = () => {
//     console.log("data channel open .. is host=",isHost)
//     if (isHost) {
//       chat.forEach((msg) => dc.send(JSON.stringify(msg)));
//     }
//   };

//   dc.onmessage = (event) => {
//     const data = JSON.parse(event.data);
//     addMessage({ ...data, sender: peerId });
//   };
// };

// export const listenForJoiners = (
//   myId,
//   roomId,
//   peerConnections,
//   dataChannels,
//   chat,
//   addMessage,
//   isHost
// ) => {
//   const signalRef = ref(db, `signals/${roomId}`);
//   onChildAdded(signalRef, async (snapshot) => {
//     const data = snapshot.val();
//     if (data.sender === myId) return;

//     const remoteId = data.peerId;

//     // if (data.type === 'leave') {
//     //     const remoteId = peerId;

//     //     console.log("🧹 [LEAVE] Remote ID to delete:", remoteId);
//     //     console.log("🧹 [LEAVE] Connections BEFORE delete:", { ...peerConnections.current });

//     //     const connection = peerConnections.current[remoteId];

//     //     if (connection?.pc) {
//     //         try {
//     //             connection.pc.close();
//     //             console.log(`✅ [LEAVE] Closed peer connection for ${remoteId}`);
//     //         } catch (err) {
//     //             console.warn(`⚠️ [LEAVE] Error closing peer connection for ${remoteId}:`, err);
//     //         }
//     //     }

//     //     // Remove the connection safely using destructuring
//     //     const { [remoteId]: _, ...rest } = connections.current;
//     //     peerConnections.current = rest;

//     //     console.log("🧹 [LEAVE] Connections AFTER delete:", { ...peerConnections.current });
//     // }


//     if (data.type === 'offer') {

//       const pc = createPeerConnection(remoteId, myId, roomId, peerConnections, dataChannels, (dc, peerId) =>
//         setupDataChannel(dc, peerId, chat, addMessage, isHost)
//       );
//       peerConnections.current[remoteId] = pc;

//       await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);

//       push(ref(db, `signals/${roomId}`), {
//         type: 'answer',
//         answer,
//         peerId: remoteId,
//         sender: myId,
//       });
//     } else if (data.type === 'ice') {
//       await peerConnections.current[remoteId]?.addIceCandidate(
//         new RTCIceCandidate(data.candidate)
//       );
//     }
//   });
// };

// export const listenForHost = (myId, roomId, peerConnections) => {
//   const signalRef = ref(db, `signals/${roomId}`);
//   onChildAdded(signalRef, async (snapshot) => {
//     const data = snapshot.val();
//     if (data.sender === myId) return;

//     if (data.type === 'answer') {
//       await peerConnections.current['host']?.setRemoteDescription(
//         new RTCSessionDescription(data.answer)
//       );
//     } else if (data.type === 'ice') {
//       await peerConnections.current['host']?.addIceCandidate(
//         new RTCIceCandidate(data.candidate)
//       );
//     }
//   });
// };
