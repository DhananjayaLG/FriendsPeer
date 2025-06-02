import { create } from 'zustand';

export const useChatStore = create((set) => ({
      peerId: '',
      roomId: '',
      joinedRoom: null,
      isHost: false,
      myPosts: [],
      friends: [],
      friendPosts: [],
      peerConnections: {},
      dataChannels: {},
      profilePhoto: null,
      friendProfilePhoto: null,
      myName: '',
      isLoggedIn:false,
      dataChannel:{},
      setMyDataChannel: (dataChannel) => {
        console.log('Setting dataChannel:', dataChannel);
        set({ dataChannel });
      },
      setRoomId: (roomId) => set({ roomId }),
      setMyPosts: (myPosts) => set({ myPosts }),
      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      setJoinedRoom: (joinedRoom) => set({ joinedRoom }),
      setIsHost: (isHost) => set({ isHost }),
      addFriends: (msg) => set((state) => ({ friends: [msg, ...state.friends] })),
      addMyPosts: (msg) => set((state) => ({ myPosts: [msg, ...state.myPosts] })),
      addFriendPosts: (newPost) => {
  set((state) => {
    const alreadyExists = state.friendPosts.some(
      (post) => post.postId === newPost.postId
    );
    if (alreadyExists) {
      console.log("Post already exists:", newPost.postId);
      return {};
    }

    console.log("Adding new post:", newPost.postId);
    return {
      friendPosts: [newPost, ...state.friendPosts],
    };
  });
},

      //addFriendPosts: (msg) => set((state) => ({ friendPosts: [msg, ...state.friendPosts] })),
      setPeerConnection: (peerId, pc) =>
        set((state) => ({
          peerConnections: { ...state.peerConnections, [peerId]: pc },
        })),
      setDataChannel: (peerId, dc) =>
        set((state) => ({
          dataChannels: { ...state.dataChannels, [peerId]: dc },
        })),
      resetFriendPosts: () => set({ friendPosts: [] }),
      setProfilePhoto: (uri) => set({ profilePhoto: uri }),
      setFriendProfilePhoto: (uri) => set({ friendProfilePhoto: uri }),
      setMyName: (myName) => set({ myName }),
      setFriends: (friends) => set({ friends }),
      removeFriend: (friendId) =>
        set((state) => ({
          friends: state.friends.filter((f) => f.id !== friendId),
        })),
      updateFriendProfile: (friendId, newProfile) =>
        set((state) => ({
          friends: state.friends.map((friend) =>
            friend.id === friendId ? { ...friend, profile: newProfile } : friend
          ),
        })),
    }),
  )




// import { create } from 'zustand';

// export const useChatStore = create((set) => ({
//     peerId: Math.random().toString(36).substring(2, 10),
//   roomId: '',
//   joinedRoom: null,
//   isHost: false,
//   myPosts: [],
//   friends:[],
//   friendPosts:[],
//   peerConnections: {},
//   dataChannels: {},
//   profilePhoto: null,
//   friendProfilePhoto:null,
//   myName:'',
//   setRoomId: (roomId) => set({ roomId }),
//   setJoinedRoom: (joinedRoom) => set({ joinedRoom }),
//   setIsHost: (isHost) => set({ isHost }),
//   setMyPosts: (myPosts) => set({ myPosts }),
//   addFriends: (msg) =>
//      set((state) => ({ friends: [msg,...state.friends] })),
//   addMyPosts: (msg) =>
//      set((state) => ({ myPosts: [msg,...state.myPosts] })),
//   addFriendPosts: (msg) =>
//      set((state) => ({ friendPosts: [msg,...state.friendPosts] })),
//   setPeerConnection: (peerId, pc) =>
//   set((state) => ({
//     peerConnections: { ...state.peerConnections, [peerId]: pc },
//   })),
// setDataChannel: (peerId, dc) =>
//   set((state) => ({
//     dataChannels: { ...state.dataChannels, [peerId]: dc },
//   })),
//   resetFriendPosts: () => set({ friendPosts: [] }),
//   setProfilePhoto: (uri) => set({ profilePhoto: uri }),
//   setFriendProfilePhoto: (uri) => set({ friendProfilePhoto: uri }),
//   setMyName: (myName) => set({ myName }),
//   setFriends: (friends) => set({ friends }),
//   removeFriend: (friendId) =>
//   set((state) => ({
//     friends: state.friends.filter((f) => f.id !== friendId),
//   })),
//   updateFriendProfile: (friendId, newProfile) =>
//   set((state) => ({
//     friends: state.friends.map((friend) =>
//       friend.id === friendId ? { ...friend, profile: newProfile } : friend
//     ),
//   })),

// }));

















// import { create } from 'zustand';

// export const useChatStore = create((set) => ({
//   peerId: Math.random().toString(36).substring(2, 10),
//   myRoomId: '',
//   isHost: false,
//   chatMyRoom: [],
//   setMyRoomId: (id) => set({ myRoomId: id, isHost: true }),
//   addMyRoomMessage: (msg) =>
//     set((state) => ({ chatMyRoom: [msg,...state.chatMyRoom] })),
// }));
