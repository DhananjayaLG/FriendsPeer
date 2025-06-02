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
} from '../../firebase';
import { useChatStore } from '../store/useChatStore';
import {
  addLikedByToPost,
  removeLikedByFromPost,
  updateComments,
  getPosts
} from '../database/db.js';

const iceServers = {
  iceServers: [
        // {
        //   urls: 'turn:bn-turn2.xirsys.com:80?transport=udp',
        //   username: 'RM_cBLRQ6Mh3KZ2HjUwMew5F3HGhQvE8j51hqvy0FruBfW1MUUx1iA3jxVM2HmnZAAAAAGgTMfVEaGFuYW5qYXlhUw==',
        //   credential: '061168ba-2667-11f0-9b3e-0242ac140004',
        // },
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

export const updatePosts = async () => {
  const { setMyPosts } = useChatStore.getState();
  
  try {
    const updatedPosts = await getPosts();
    setMyPosts(updatedPosts);
  } catch (error) {
    console.error("Failed to update posts:", error);
  }
};


export const setupDataChannel = (dc, peerId, chat, addMessage, isHost) => {
  
  const sendInChunks = (data, dc,type) => {
  const CHUNK_SIZE = 10000;
    const payload = JSON.stringify(data);
    const totalLength = payload.length;
    for (let i = 0; i < totalLength; i += CHUNK_SIZE) {
      const chunk = payload.slice(i, i + CHUNK_SIZE);
      const isLast = i + CHUNK_SIZE >= totalLength;
      if(type==="posts"){
        dc.send(JSON.stringify({
        type: 'chunk',
        chunk,
        isLast,
        messageId: payload.postId,
      }));
      }
      else{
        dc.send(JSON.stringify({
          type: 'chunk',
          chunk,
          isLast,
          messageId: "0",
        }));
      }
      
    }
};
  
  const { myPosts,profilePhoto,myName,setFriendProfilePhoto} = useChatStore.getState();
  const buffer = {};
  
  
  dc.onopen = () => {   
    if (isHost) {
      sendInChunks({myName,profilePhoto,type:"profilePhoto"}, dc,"profile")
      //console.log("my profile",profilePhoto)
      myPosts.slice().reverse().forEach((msg) =>
        sendInChunks(msg, dc,"posts") // re-use chunk sender for history
      );
    }
    useChatStore.getState().setMyDataChannel(dc);
    // else{
    //   console.log("send start")
    //   dc.send(JSON.stringify({
    //     type: 'comment',
    //     postId:1,
    //     message:{user:'123558',comment:'jnsjnj'},
    //   }));
    //   console.log("send done")
    // }
  };

  dc.onmessage = async (event) => {
    
    const data = JSON.parse(event.data);
    //console.log('message Ids=',data.messageId)
    
    if (data.type === 'chunk') {
      const { messageId, chunk, isLast } = data;
      buffer[messageId] = (buffer[messageId] || '') + chunk;
      if (isLast) {
          try {
            const fullData = JSON.parse(buffer[messageId]);
            delete buffer[messageId];
            console.log("full data=",fullData)
            if (fullData.type==="profilePhoto") {
              if(fullData.profilePhoto){
                setFriendProfilePhoto(fullData.profilePhoto);
              }
              
            } else {
              addMessage({ ...fullData, sender: peerId });
            }
          } catch (err) {
            console.error("Failed to parse buffered message:", buffer[messageId], err);
            delete buffer[messageId]; // Clean up corrupted buffer
          }
        }

            
            } 
    else if(data.type==='comment'){
      //console.log("data type=comment")
      await updateComments(data.postId,data.message)
      const post = myPosts.find(p => p.postId === data.postId);
      //console.log("post=",post)
      if (post) {
        post.comments.push(data.message);
        //console.log("new post=",data.message)
      }
    }
    else if(data.type==='like'){
      if(data.message.state==='liked'){
        await addLikedByToPost(data.postId,data.message.user)
      }
      else{
        await removeLikedByFromPost(data.postId,data.message.user)
      }
      await updatePosts()
    }
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
    //console.log("on child added method")
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
      const pc = createPeerConnection(remoteId, myId, roomId, peerConnections, dataChannels, (dc, peerId) =>
        setupDataChannel(dc, peerId, chat, addMessage, isHost)
      );
      peerConnections.current[remoteId] = pc;

      //console.log("data.offer=",data.offer)
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      //console.log("set remote description done")
      const answer = await pc.createAnswer();
      //console.log("answer=",answer)
      await pc.setLocalDescription(answer);
      //console.log("set local description done")


      push(ref(db, `signals/${roomId}`), {
        type: 'answer',
        answer,
        peerId: remoteId,
        sender: myId,
      });
    } else if (data.type === 'ice') {
      await peerConnections.current[remoteId]?.addIceCandidate(
        new RTCIceCandidate(data.candidate)
      );
    }
  });
};

export const listenForHost = (myId, roomId, peerConnections) => {
//console.log("listen for host.. peer connections=",JSON.parse(JSON.stringify(peerConnections.current)))
  const signalRef = ref(db, `signals/${roomId}`);
  onChildAdded(signalRef, async (snapshot) => {
    //console.log("listen for host - on child added method")
    const data = snapshot.val();
    if (data.sender === myId) return;

    if (data.type === 'answer') {
        //console.log("data.type=answer in peer side")
      await peerConnections.current['host']?.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    } else if (data.type === 'ice') {
        //console.log("data.type=ice in peer side and peer connections=",JSON.parse(JSON.stringify(peerConnections.current)))
      await peerConnections.current['host']?.addIceCandidate(
        new RTCIceCandidate(data.candidate)
      );
    }
  });
};