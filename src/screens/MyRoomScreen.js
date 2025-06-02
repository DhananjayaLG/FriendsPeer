import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Image,
  TouchableOpacity,
  Alert,RefreshControl
} from 'react-native';
import { useChatStore } from '../store/useChatStore';
import Poster from '../components/Poster';
import UserProfile from '../components/UserProfile';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  listenForJoiners,
} from '../utils/webrtcHandlers';
import { ref, remove, set,db } from '../../firebase';
import DeviceInfo from 'react-native-device-info';
import AddFriendModal from '../components/AddFriendModal';
import CreatePostModal from '../components/CreatePostModal';
import NoFriends from '../assets/NoFriends.png'
import NoPosts from '../assets/NoPosts.png'
import CustomButton from '../components/CustomButton';
import {
  insertPost,
  getPosts,
  createFriendsTable,
  addFriend,
  deleteFriendById,
  getAllFriends,
  getMaxPostId
} from '../database/db.js';

const CHUNK_SIZE = 10000;

export default function MyRoomScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [createPostModalVisible,setCreatePostModalVisible]= useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {
    setJoinedRoom,
    setIsHost,
    friends,setFriends,
    addFriends,addMyPosts,roomId,setRoomId,removeFriend,myName,myPosts,setMyPosts
  } = useChatStore();
  
  const [myId,setMyId]=useState('')

  const peerConnections = useRef({});
  const dataChannels = useRef({});
  const isHostRef = useRef(false);
  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await DeviceInfo.getUniqueId(); 
      setRoomId(id);
      setMyId(id)
    };

    fetchDeviceId();
  }, []);
  useEffect(() => {
  if (roomId.trim()) {
    handleCreateRoom();
  }
}, [roomId]);
  

useEffect(() => {
  
  const createFriendTable=async()=>{
    await createFriendsTable()
  }
  const getFriends=async()=>{
    const friendsList = await getAllFriends();
    setFriends(friendsList)
  }
  const getAllPosts=async()=>{
    const postList = await getPosts();
    setMyPosts(postList)
  }
  createFriendTable()
  getFriends()
  getAllPosts()
},[] );

const handleCreateRoom = async () => {
    if (!roomId) return;
    await remove(ref(db, `signals/${roomId}`)).catch(() => {});
    setIsHost(true);
    isHostRef.current = true;
    setJoinedRoom(roomId);
    await set(ref(db, `signals/${roomId}`), { createdAt: Date.now() });
    listenForJoiners(
      myId,
      roomId,
      peerConnections,
      dataChannels,
      myPosts,
      addMyPosts,
      true,
    );
  };
  const sendInChunks = (data, dc) => {
    //const messageId=Date.now().toString()
    const payload = JSON.stringify(data);
    const totalLength = payload.length;
    for (let i = 0; i < totalLength; i += CHUNK_SIZE) {
      const chunk = payload.slice(i, i + CHUNK_SIZE);
      const isLast = i + CHUNK_SIZE >= totalLength;
      dc.send(JSON.stringify({
        type: 'chunk',
        chunk,
        isLast,
        messageId:payload.postId,
      }));
    }
  };


  const handleAddPost = async ({ text, image,createdAt,likedBy,comments }) => {
  //const messageId = Date.now().toString();
  const post = {text, image ,createdAt,likedBy,comments };
  await insertPost(post)
  const allPosts=await getPosts()
  setMyPosts(allPosts)
  const postId = await getMaxPostId();
  const message= {postId,text, image ,createdAt,likedBy,comments };
  const seen = new Set();
  Object.values(dataChannels.current).forEach((dc,peerId) => {
  if (dc.readyState === 'open' && !seen.has(peerId)) {
    sendInChunks(message, dc);
    seen.add(peerId);
  }
});

  // Object.values(dataChannels.current).forEach((dc) => {
  //   if (dc.readyState === 'open') {
  //     sendInChunks(message, dc);
  //   }
  // });
};
const handleAddFriend = async({name,id,profile}) => {
    await addFriend({id,name,profile})
    const friendsList = await getAllFriends();
    setFriends(friendsList)
  };
  useEffect(()=>{

  },[])
  const deleteFriend=async(id)=>{
    await deleteFriendById(id)
    const friendList=await getAllFriends()
    setFriends(friendList)
  }
  const handleDelete = (name,id) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteFriend(id)
        },
      ]
    );
  };

const handlePressAddFriend = () => {
    setModalVisible(true)
  };

const handlePressAddPost = () => {
    setCreatePostModalVisible(true)
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Simulate data fetching
    setTimeout(() => {
      handleCreateRoom()
      setRefreshing(false);
    }, 1500);
  }, []);



  return (
    <SafeAreaProvider>
      <SafeAreaView className="mt-4">
        <ScrollView
          refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
        >
          <View className=''>
                  <View className='flex items-center mb-3'>
                    <Text className='font-bold text-2xl mt-2'>Welcome back {myName.split(" ")[0]} !!!</Text>
                  </View>
                  <View className='p-5 mx-2 rounded-xl shadow-sm shadow-inherit bg-primary ' style={{elevation: 8 }}>

                  
                    <View className='flex-row ml-2 justify-between'>
                      <Text className='font-bold text-xl ml-2 mt-2 mr-16 '>Your Friends</Text>
                      <CustomButton title="+ Add friend" onPress={handlePressAddFriend} /> 
                    </View>
                        <AddFriendModal
                          visible={modalVisible}
                          onClose={() => setModalVisible(false)}
                          onSubmit={handleAddFriend}
                        />
                      
                    
                        {friends.length > 0 ? 
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className=''>
                          {friends.map((user,index)=>(
                                  <TouchableOpacity key={index} className='m-2' onPress={() => navigation.navigate('JoinedRoomScreen',{friendId:user.id,friendName:user.name})}>
                                      <UserProfile key={index} user={user.name} id={user.id} onDelete={handleDelete} profile={user.profile} />
                                  </TouchableOpacity>
                              ))}
                        </ScrollView>
                          :
                          <View className='flex items-center justify-center m-2'>
                            <Image
                              source={NoFriends}
                              resizeMode='contain'
                              className='w-72 h-64 '
                            />
                          </View>
                          }
                    
                    </View>
                </View>
                <View className='mx-2 mt-4 bg-primary rounded-lg' >
                  <View className='flex-row mt-2 justify-between px-5'>
                    <Text className='mt-2 font-bold text-xl mr-9'>My Recent Posts</Text>
                      <CustomButton title="+ Create post" onPress={handlePressAddPost} /> 
                  </View>
                  <CreatePostModal
                            visible={createPostModalVisible}
                            onClose={() => setCreatePostModalVisible(false)}
                            onSubmit={handleAddPost}
                          />
                  
                  
                  {myPosts.length>0 ?

                    myPosts.map((poster,index)=>(
                      <View key={index}>
                        <Poster poster={poster} type="me" name={myName} dataChannel={null} />
                      </View>
                    ))
                  
                  :
                    <View className='flex items-center justify-center m-2'>
                      <Image
                          source={NoPosts}
                          resizeMode='contain'
                          className='w-72 h-64 '
                        />
            </View>}
          </View>
        </ScrollView>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderWidth: 1, marginVertical: 10, padding: 5 },
  chat: { height: 200, borderWidth: 1, marginVertical: 10 },
  image: { width: 200, height: 200, marginVertical: 5 },
});

{/* <Text>My Peer ID: {peerId}</Text>
      <TextInput
        placeholder="Room name"
        value={roomInput}
        onChangeText={setRoomInput}
        style={styles.input}
      />
      <Button title="Start Room" onPress={startRoom} />
      <Button title="Go to Joined Room" onPress={() => navigation.navigate('JoinedRoom')} />
        <View>
            <TextInput
                placeholder="Friend Id"
                value={friend}
                onChangeText={setFriend}
                style={styles.input}
            />
            <Button title="Add Friend" onPress={()=>{setFriends((pre)=>[...pre,friend])}} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className=''>
                {friends.map((user,index)=>(
                        <View key={index} className='m-2 border border-black'>
                            <UserProfile user={user}/>
                        </View>
                    ))}
            </ScrollView>
            
        </View>
      {myRoomId !== '' && (
        <View className='mx-2'>
          <Text>Room ID: {myRoomId}</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Write Something"
            style={styles.input}
          />
          <View style={{ flexDirection: 'row' }}>
            <Button title="Post Text" onPress={sendToAll} />
            <View style={{ width: 10 }} />
            <Button title="Post Image" onPress={sendImage} />
        </View>
          <ScrollView >
            {chatMyRoom.map((m, i) => (
              <View key={i}>
                <Poster poster={m}/>
              </View>
            ))}
            {/* {chatMyRoom.map((m, i) => (
              <View key={i}>
                <Text>{m.sender}:</Text>
                {m.text && <Text>{m.text}</Text>}
                {m.image && <Image source={{ uri: m.image.image }} style={styles.image} />}
              </View>
            ))} 
          </ScrollView>
          
        </View>
      )} */}