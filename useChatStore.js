import { create } from 'zustand';

export const useChatStore = create((set) => ({
  roomId: '',
  joinedRoom: null,
  isHost: false,
  chat: [],
  message: '',
  setRoomId: (roomId) => set({ roomId }),
  setJoinedRoom: (joinedRoom) => set({ joinedRoom }),
  setIsHost: (isHost) => set({ isHost }),
  setChat: (chat) => set({ chat }),
  addMessage: (msg) => set((state) => ({ chat: [...state.chat, msg] })),
  setMessage: (message) => set({ message }),
}));

//app.js
// import React, { useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   ScrollView,
//   Image,
//   StyleSheet,
// } from 'react-native';
// import { launchImageLibrary } from 'react-native-image-picker';
// import {
//   createPeerConnection,
//   setupDataChannel,
//   listenForJoiners,
//   listenForHost,
// } from './webrtcHandlers';
// import { useChatStore } from './useChatStore';
// import { ref, push, remove, set,db } from './firebase';

// const generateId = () => Math.random().toString(36).substring(2, 10);

// export default function App() {
//   const {
//     roomId,
//     joinedRoom,
//     isHost,
//     chat,
//     message,
//     setRoomId,
//     setJoinedRoom,
//     setIsHost,
//     setChat,
//     addMessage,
//     setMessage,
//   } = useChatStore();

//   const myId = useRef(generateId()).current;
//   const peerConnections = useRef({});
//   const dataChannels = useRef({});
//   const isHostRef = useRef(false);

//   const handleCreateRoom = async () => {
//     console.log("create room")
//     await remove(ref(db, `signals/${roomId}`)).catch(() => {});
//     console.log("room removed")
//     setIsHost(true);
//     isHostRef.current = true;
//     setJoinedRoom(roomId);
//     console.log("try to create room")
//     await set(ref(db, `signals/${roomId}`), { createdAt: Date.now() });
//     console.log("room created")
//     listenForJoiners(
//       myId,
//       roomId,
//       peerConnections,
//       dataChannels,
//       chat,
//       addMessage,
//       true
//     );
//   };

//   const handleJoinRoom = async () => {
//     setIsHost(false);
//     isHostRef.current = false;
//     setJoinedRoom(roomId);

//     listenForHost(myId, roomId, peerConnections);

//     const pc = createPeerConnection(
//       'host',
//       myId,
//       roomId,
//       peerConnections,
//       dataChannels,
//       (dc, peerId) => setupDataChannel(dc, peerId, chat, addMessage, false)
//     );
//     peerConnections.current['host'] = pc;

//     const dc = pc.createDataChannel('chat');
//     dataChannels.current['host'] = dc;
//     setupDataChannel(dc, 'host', chat, addMessage, false);

//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);

//     push(ref(db, `signals/${roomId}`), {
//       type: 'offer',
//       offer,
//       peerId: myId,
//       sender: myId,
//     });
//   };

//   const handleSendMessage = () => {
//     if (!message.trim()) return;
//     const msg = { text: message.trim(), from: 'Me' };
//     addMessage(msg);
//     const payload = JSON.stringify(msg);
//     Object.values(dataChannels.current).forEach((dc) => {
//       if (dc.readyState === 'open') dc.send(payload);
//     });
//     setMessage('');
//   };

//   const handleSendImage = () => {
//     launchImageLibrary({ mediaType: 'photo', includeBase64: true }, (res) => {
//       const asset = res.assets?.[0];
//       if (!asset) return;
//       const img = {
//         image: `data:${asset.type};base64,${asset.base64}`,
//         from: 'Me',
//       };
//       addMessage(img);
//       const payload = JSON.stringify(img);
//       Object.values(dataChannels.current).forEach((dc) => {
//         if (dc.readyState === 'open') dc.send(payload);
//       });
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Room ID</Text>
//       <TextInput
//         value={roomId}
//         onChangeText={setRoomId}
//         placeholder="Enter Room ID"
//         style={styles.input}
//       />
//       <Button title="Create Room" onPress={handleCreateRoom} />
//       <View style={{ height: 10 }} />
//       <Button title="Join Room" onPress={handleJoinRoom} />

      
//           <Text style={{ marginVertical: 10 }}>Room: {joinedRoom}</Text>
//           <ScrollView style={styles.chatContainer}>
//             {chat.map((msg, idx) => (
//               <View key={idx} style={styles.message}>
//                 <Text style={styles.sender}>{msg.from || msg.sender}:</Text>
//                 {msg.text && <Text>{msg.text}</Text>}
//                 {msg.image && (
//                   <Image source={{ uri: msg.image }} style={styles.image} />
//                 )}
//               </View>
//             ))}
//           </ScrollView>
//           <TextInput
//             value={message}
//             onChangeText={setMessage}
//             placeholder="Enter message"
//             style={styles.input}
//           />
//           <View style={{ flexDirection: 'row' }}>
//             <Button title="Send Message" onPress={handleSendMessage} />
//             <View style={{ width: 10 }} />
//             <Button title="Send Image" onPress={handleSendImage} />
//           </View>
        
      
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, marginTop: 40, flex: 1 },
//   title: { fontSize: 18, marginBottom: 10 },
//   input: { borderWidth: 1, padding: 10, marginBottom: 10 },
//   chatContainer: {
//     height: 300,
//     marginVertical: 20,
//     borderWidth: 1,
//     padding: 10,
//   },
//   message: { marginBottom: 10 },
//   sender: { fontWeight: 'bold' },
//   image: { width: 200, height: 200, marginTop: 5 },
// });
