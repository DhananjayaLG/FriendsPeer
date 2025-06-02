import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Comment from './Comment';
import { useChatStore } from '../store/useChatStore';
import {
  getPosts,
  updateComments,
} from '../database/db.js';

const CommentsModal = ({ visible, onClose, comments ,type,id,dataChannel}) => {
  const [newComment, setNewComment] = useState('');
  const {myPosts,roomId,friendPosts} = useChatStore();
  const handleSend = () => {
    if (newComment.trim()) {
      if(type=="me"){
        addCommentToPost(newComment,"me")
      }
      else{
        dataChannel.send(JSON.stringify({
          type: 'comment',
          postId:id,
          message:{user:roomId,comment:newComment},
        }));
      //console.log("comments in peer side",comments)
      addCommentToPost(newComment,"friend")
      }
      setNewComment('')
    }
  };
  const addCommentToPost = async ( newComment,type) => {
    let post=null;
    if (type==="me"){
      post = myPosts.find(p => p.postId === id);
      await updateComments(id,{user:roomId,comment:newComment})
      const dd=await getPosts()
      //console.log("posts after update comments=",dd)
    }
    else{
      post = friendPosts.find(p => p.postId === id);
    } 
    //console.log("post=",post)
    if (post) {
      const newPost={user:roomId,comment:newComment}
      post.comments.push(newPost);
      //console.log("new post=",newPost)
    }
    
  };
  
  

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Comments</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={comments}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.comment}>
              <Comment comment={item} type={type}
              />
            </View>
          )}
          contentContainerStyle={styles.commentList}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={80}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor="#000"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default CommentsModal;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  closeText: { color: '#007BFF', fontSize: 16 },
  commentList: { padding: 2, paddingBottom: 80 },
  comment: {
    marginBottom: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  commentText: { fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#007BFF',
    borderRadius: 6,
  },
  sendText: {
    color: '#fff',
    fontSize: 16,
  },
});
