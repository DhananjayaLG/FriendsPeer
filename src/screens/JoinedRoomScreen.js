import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView,RefreshControl, ActivityIndicator  } from 'react-native';
import { useChatStore } from '../store/useChatStore';
import { ref, push, db } from '../../firebase';
import {
  createPeerConnection,
  setupDataChannel,
  listenForHost
} from '../utils/webrtcHandlers';
import Poster from '../components/Poster';
import ProfileModalViewer from '../components/ProfileModalViewer';
import {
  updateFriendProfilePhoto,
} from '../database/db.js';

export default function JoinRoomScreen({route}) {
    const {friendId,friendName}=route.params;
    const [refreshing, setRefreshing] = useState(false);
  const {
      setJoinedRoom,
      setIsHost,
      friendPosts,
      addFriendPosts,
      resetFriendPosts,
      setFriendProfilePhoto,
      friendProfilePhoto,roomId,updateFriendProfile,
      seenPosts,addSeenPosts,resetSeenPosts
    } = useChatStore();
  const peerConnections = useRef({});
  const dataChannels = useRef({});
  const isHostRef = useRef(false);
  let dc=null;
  const [dataChannel, setDataChannel] = useState(null)
  const handleJoinRoom = async () => {
    //console.log("myId=",myId)
      //await remove(ref(db, `signals/${friendId}/${roomId}`)).catch(() => {});
      resetFriendPosts()
      resetSeenPosts()
      setIsHost(false);
      isHostRef.current = false;
      setJoinedRoom(friendId);
       setFriendProfilePhoto(null)
      listenForHost(roomId, friendId, peerConnections);
      
   
      const pc = createPeerConnection(
        'host',
        roomId,
        friendId,
        peerConnections,
        dataChannels,
        //(dc, peerId) => setupDataChannel(dc, peerId, friendPosts, addFriendPosts, false)
      );
      peerConnections.current['host'] = pc;
      dc = pc.createDataChannel('chat');
      dataChannels.current['host'] = dc;
      setupDataChannel(dc, 'host', friendPosts, addFriendPosts, false);
  
      
  
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      push(ref(db, `signals/${friendId}`), {
        type: 'offer',
        offer,
        peerId: roomId,
        sender: roomId,
      });
      setDataChannel(dataChannels.current['host']);
    };
  useEffect(()=>{
    handleJoinRoom()
  },[])
  useEffect(()=>{
    const updateProfile=async()=>{
      await updateFriendProfilePhoto(friendId,friendProfilePhoto)
    }
    updateProfile(friendId,friendProfilePhoto)
    updateFriendProfile(friendId,friendProfilePhoto)
  },[friendProfilePhoto])

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Simulate data fetching
    setTimeout(() => {
      handleJoinRoom()
      setRefreshing(false);
    }, 1500);
  }, []);
  
  
  return dataChannel ? (
    <ScrollView className='mt-10'
      refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }
    >
      <View className='flex items-center'>
        <ProfileModalViewer imageUri={friendProfilePhoto} size="large"/>
        <Text className='text-2xl font-bold mt-4'>{friendName}</Text>
        <View className='flex-row pt-2'>
      </View>
      
      </View>
      <Text className='ml-2 mt-2 text-xl font-semibold'>{friendName}'s Recent Posts...</Text>
         <ScrollView >
         {friendPosts.map((m, i) => (
            //m.myName &&
            <View key={i}>
              {console.log("m=",m)}
            <Poster poster={m} type="friend" name={friendName} dataChannel={dataChannels.current['host']} />
            </View>
        ))}
        {/* {friendPosts.map((m, i) => {
          if (seenPosts.includes(m.postId)) return null;

          seenPosts.push(m.postId);
          console.log("m =", seenPosts);

          return (
            <View key={i}>
              <Poster
                poster={m}
                type="friend"
                name={friendName}
                dataChannel={dataChannels.current['host']}
              />
            </View>
          );
        })} */}

        </ScrollView>
    </ScrollView>
  )
  :
  (
    <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading...</Text>
    </View>
  )

}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 40, flex: 1 },
  title: { fontSize: 18, marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#007bff',
  },
});




// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View, Text, TextInput, Button, ScrollView, StyleSheet, Image
// } from 'react-native';
// import { useChatStore } from '../store/useChatStore';
// import {
//   createPeerConnection,
//   setupDataChannel,
//   listenForHost,
// } from '../utils/webrtcHandlers';
// import Poster from '../components/Poster';

// const generateId = () => Math.random().toString(36).substring(2, 10);
// export default function JoinedRoomScreen({ route }) {
//   const {
//       joinedRoom,
//       isHost,
//       myPosts,
//       setJoinedRoom,
//       setIsHost,
//       setMyPosts,
//       addFriendPosts,
//       friendPosts,
//       friends,
//       setFriends,peerId,
//       addFriends,
//       addMyPosts
//     } = useChatStore();
//     const peerConnections = useRef({});
//     const dataChannels = useRef({});
//   const {friendId}=route.params;
//   const isHostRef = useRef(false);
//   const [chatMessages,setChatMessages] = useState([])

//   const myId = useRef(generateId()).current;
//     const [friend,setFriend]=useState('')

//   const handleJoinRoom = async () => {
//     console.log("handle join room func")
//       setIsHost(false);
//       isHostRef.current = false;
//       setJoinedRoom(roomId);
//       console.log(roomId)
//       listenForHost(myId, roomId, peerConnections);
      
  
//       const pc = createPeerConnection(
//         'host',
//         myId,
//         roomId,
//         peerConnections,
//         dataChannels,
//         (dc, peerId) => setupDataChannel(dc, peerId, chat, addFriendPosts, false)
//       );
//       peerConnections.current['host'] = pc;
  
//       const dc = pc.createDataChannel('chat');
//       dataChannels.current['host'] = dc;
//       setupDataChannel(dc, 'host', chat, addFriendPosts, false);
  
      
  
//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);
  
//       push(ref(db, `signals/${roomId}`), {
//         type: 'offer',
//         offer,
//         peerId: myId,
//         sender: myId,
//       });
//     };

// //   const sendToHost = () => {
// //     const dc = connections.current['host']?.dataChannels?.['host'];
// //     if (dc?.readyState === 'open') dc.send(message);
// //     addJoinedRoomMessage({ sender: 'Me', text: message });
// //     setMessage('');
// //   };
// //   useEffect(()=>{
// //     //resetJoinedRoom()
// //     //leaveRoomAsPeer(connections)
// //     join()
// //   },[])

//   return (
//     <View className='mt-10'>
//       <Text>My Peer ID: {peerId}</Text>
//       <Button title="Join" onPress={handleJoinRoom} />
//         <Text>Joined Room {roomId}</Text>
//         <ScrollView >
//         {friendPosts.map((m, i) => (
//             <View key={i}>
//             <Poster poster={m}/>
//             </View>
//         ))}
//         </ScrollView>
//     </View>
//   );
// }

