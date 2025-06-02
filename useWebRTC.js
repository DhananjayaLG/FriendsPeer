// // useWebRTC.js
// import { useEffect, useRef, useState } from 'react';
// import { RTCPeerConnection } from 'react-native-webrtc';
// import { db } from './firebaseConfig';
// import { ref, set, onValue, remove } from 'firebase/database';

// const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// export function useWebRTC(roomId, isCreator) {
//   const peerConnection = useRef(null);
//   const dataChannel = useRef(null);
//   const [messages, setMessages] = useState([]);
//   const [connected, setConnected] = useState(false);

//   useEffect(() => {
//     const connect = async () => {
//       peerConnection.current = new RTCPeerConnection(configuration);

//       if (isCreator) {
//         dataChannel.current = peerConnection.current.createDataChannel('chat');
//         dataChannel.current.onmessage = (e) => setMessages(m => [...m, { incoming: true, text: e.data }]);
//         setupCreatorSignaling();
//       } else {
//         peerConnection.current.ondatachannel = event => {
//           dataChannel.current = event.channel;
//           dataChannel.current.onmessage = (e) => setMessages(m => [...m, { incoming: true, text: e.data }]);
//         };
//         setupJoinerSignaling();
//       }

//       peerConnection.current.onicecandidate = event => {
//         if (event.candidate) {
//           set(ref(db, `rooms/${roomId}/candidates/${isCreator ? 'creator' : 'joiner'}`), event.candidate.toJSON());
//         }
//       };
//     };

//     connect();
//     return () => {
//       peerConnection.current?.close();
//       remove(ref(db, `rooms/${roomId}`));
//     };
//   }, [roomId, isCreator]);

//   const setupCreatorSignaling = async () => {
//     const offer = await peerConnection.current.createOffer();
//     await peerConnection.current.setLocalDescription(offer);
//     set(ref(db, `rooms/${roomId}/offer`), offer);

//     onValue(ref(db, `rooms/${roomId}/answer`), async snapshot => {
//       const answer = snapshot.val();
//       if (answer) {
//         await peerConnection.current.setRemoteDescription(answer);
//         setConnected(true);
//       }
//     });

//     onValue(ref(db, `rooms/${roomId}/candidates/joiner`), async snapshot => {
//       const candidate = snapshot.val();
//       if (candidate) {
//         await peerConnection.current.addIceCandidate(candidate);
//       }
//     });
//   };

//   const setupJoinerSignaling = async () => {
//     onValue(ref(db, `rooms/${roomId}/offer`), async snapshot => {
//       const offer = snapshot.val();
//       if (offer) {
//         await peerConnection.current.setRemoteDescription(offer);
//         const answer = await peerConnection.current.createAnswer();
//         await peerConnection.current.setLocalDescription(answer);
//         set(ref(db, `rooms/${roomId}/answer`), answer);
//         setConnected(true);
//       }
//     });

//     onValue(ref(db, `rooms/${roomId}/candidates/creator`), async snapshot => {
//       const candidate = snapshot.val();
//       if (candidate) {
//         await peerConnection.current.addIceCandidate(candidate);
//       }
//     });
//   };

//   const sendMessage = (text) => {
//     if (dataChannel.current && dataChannel.current.readyState === 'open') {
//       dataChannel.current.send(text);
//       setMessages(m => [...m, { incoming: false, text }]);
//     }
//   };

//   return { messages, sendMessage, connected };
// }
