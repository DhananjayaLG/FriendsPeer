import { View, Text, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import userImg from '../assets/user.png'
import { useChatStore } from '../store/useChatStore';
const Comment = ({comment,type}) => {
  const {friends,roomId,myName,profilePhoto} = useChatStore();
  const [friend,setFriend]=useState(null)
  const getFriendById = (id) => {
    const friend = friends.find(f => f.id === id);
    return friend ? friend : null;
  };
  //console.log("comment in comment component=",comment)
  useEffect(()=>{
    if(comment.user===roomId){
      setFriend({ name: "You", id: roomId, profile:profilePhoto })
    }
    else{
      setFriend(getFriendById(comment.user))
    }
  },[])

  return (
    <View className='flex-row max-w-[86%] ml-2 mt-1'>
      <Image
        source={friend ? friend.profile? { uri: friend.profile } :userImg : userImg }
        resizeMode='cover'
        style={{width:50, height:50}}
        className='rounded-full'
      />
      <View className='pl-2 flex justify-center'>
        <Text className='text-lg font-semibold'>{`${friend?friend.name:"Unknown"}`}</Text>
        <Text>{comment.comment}</Text>
      </View>
      
    </View>
  )
}

export default Comment