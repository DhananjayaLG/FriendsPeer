import { Alert, Text, TouchableOpacity, View } from 'react-native'
import { useChatStore } from '../store/useChatStore';
import ImageModalViewer from './ImageModalViewer';
import ProfileModalViewer from './ProfileModalViewer';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useEffect, useState } from 'react';
import CommentsModal from './CommentsModal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getPosts,
  addLikedByToPost,
  removeLikedByFromPost,
  deletePostById,
} from '../database/db.js';
dayjs.extend(relativeTime);

const Poster = ({poster,type,name,dataChannel}) => {
    console.log("Poster=",poster);
    const isPostLikedByMe = (likedBy, myId) => {
        if(likedBy){
            return likedBy.includes(myId);
        }
        else{
            return false
        }
        
    };
    
    const {profilePhoto,myName,friendProfilePhoto,setMyPosts,roomId} = useChatStore();
    const [liked,setLiked]=useState(false)
    //console.log("friendprofile",friendProfilePhoto)
    const [localLikeCount,setLocalLikeCount]=useState(0)
    useEffect(()=>{
        setLiked(isPostLikedByMe(poster.likedBy, roomId))
        setLocalLikeCount(`${poster.likedBy? poster.likedBy.length:0}`)
    },[])
    const addLike=async()=>{
        await addLikedByToPost(poster.postId,roomId)
        const postsNew=await getPosts()
        setMyPosts(postsNew)
    }
    const removeLike=async()=>{
        await removeLikedByFromPost(poster.postId,roomId)
        const postsNew=await getPosts()
        setMyPosts(postsNew)
    }
    const handleLike=()=>{
        setLiked(pre=>{
            const newLiked=!pre
            if(newLiked){
                if(type=="me"){
                    addLike()
                }
                else{
                dataChannel.send(JSON.stringify({
                    type: 'like',
                    postId:poster.postId,
                    message:{user:roomId,state:"liked"},
                    })); 
                setLocalLikeCount((pre)=>pre+1)
            }
            }
            else{
                if(type=="me"){
                    removeLike()
                }
                else{
                dataChannel.send(JSON.stringify({
                    type: 'like',
                    postId:poster.postId,
                    message:{user:roomId,state:"disliked"},
                }));
                setLocalLikeCount((pre)=>pre-1)
            }
            }
            return newLiked
            })
        
        
    }
    const [commentsModalVisible,setCommentsModalVisible]=useState(false)


const deletePost=async()=>{
    await deletePostById(poster.postId)
    const newPosts=await getPosts()
    setMyPosts(newPosts)
  }
  const handleDelete = async() => {
    Alert.alert(
      'Delete Post',
      `Are you sure you want to delete this post?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePost()
        },
      ]
    );
  };
  return (
    <View className=' flex border border-slate-300 shadow-black shadow-xl m-2 my-4 rounded-lg' >
        <View className='flex flex-row max-h-36 justify-between bg-slate-300 shadow-2xl shadow-black rounded-t-lg'>
            <View className='flex-row items-center'>
                <View className='max-w-16 p-2'>
                    {/* <Image
                        source={{ uri: `${type==="me"?profilePhoto:friendProfilePhoto}` }}
                        alt='user'
                        resizeMode='contain'
                        className='w-16 h-16 border rounded-full'
                    /> */}
                    <ProfileModalViewer imageUri={`${type==="me"?profilePhoto:friendProfilePhoto}`}/>
                </View>
                <View className='ml-6 '>
                    <Text className='text-s text-black'>
                        {name}
                    </Text>
                    <Text className='text-xs font-bold text-black'>
                        {dayjs(poster.createdAt).fromNow()}
                    </Text>
                </View>
            </View>
            
            
                {type==="me" &&
                <View className='flex-row pr-2 items-center'>
                    <TouchableOpacity onPress={handleDelete}>
                        <MaterialCommunityIcons name="delete" color="#000" size={24} />
                    </TouchableOpacity> 
                </View>
                }
            
        </View>
        {poster.text && 
                <View className='p-2 items-start bg-slate-200'>
                    <Text>
                    {poster.text}
                    </Text>
                </View>
            }
        <View className={`p-1 items-center bg-slate-200 ${poster.image?"h-96":""}`} >
            
            {poster.image && (
                <View className='w-[95%] max-h-[50%]'>

                        {/* <Image
                            source={{ uri: poster.image }}
                            style={{ width: "auto", height: 300 }}
                            resizeMode="contain"
                        /> */}
                        <ImageModalViewer imageUri={poster.image} />
                        
                </View>)}
        </View >
            
        <View className='flex-row bg-slate-300 justify-between px-4 py-2 rounded-b-lg'>
            <View className='flex-row items-center'>
                <TouchableOpacity onPress={handleLike} activeOpacity={1}>
                    <Icon name="thumbs-up" color={`${liked? "blue":"#000"}`} size={24} />
                </TouchableOpacity>
                <Text className='ml-2'>{`${type==="me"? poster.likedBy.length:localLikeCount}`}</Text>
            </View>
            
            <TouchableOpacity onPress={()=>setCommentsModalVisible((pre)=>!pre)}>
                <Icon name="comments" color={"#000"} size={24} />
            </TouchableOpacity>
            
        </View>
        <CommentsModal
            visible={commentsModalVisible}
            onClose={() => setCommentsModalVisible(false)}
            comments={poster.comments}
            type={type}
            id={poster.postId}
            dataChannel={dataChannel}
            />
        
    </View>
  )
}

export default Poster