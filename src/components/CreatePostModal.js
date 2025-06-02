import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Button,
  Image
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Alert } from 'react-native';
import { Image as RNCImage } from 'react-native-compressor';



const MAX_FILE_SIZE = 1024 * 1024;

const CreatePostModal = ({ visible, onClose, onSubmit }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const handleAdd = () => {
    if (!text.trim() && !image.trim()) return;
    onSubmit({ text:text, image: image ,createdAt: new Date().toISOString() , likedBy:[],comments:[]});
    setText('');
    setImage('');
    onClose();
  };
  const handleClose = () => {
    setText('');
    setImage('');
    onClose();
  };
  const handleAddImage = async () => {
      launchImageLibrary({ mediaType: 'photo', includeBase64: true }, async (res) => {
        const asset = res.assets?.[0];
        if (!asset) return;
        if (asset.fileSize > MAX_FILE_SIZE) {
            Alert.alert('File too large', 'Please select an image smaller than 1MB.');
            return;
        }
        try {
            const compressedUri = await RNCImage.compress(asset.uri, {
                maxWidth: 1000,
                quality: 0.7, // 0.0 - 1.0
            });

        const response = await fetch(compressedUri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result;
            setImage(base64data); // already includes base64 prefix
        };
        reader.readAsDataURL(blob);
        } catch (error) {
      Alert.alert('Error', 'Failed to compress image');
      console.error(error);
    }
      });
    };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Create a Post</Text>

        <TextInput
          style={styles.input}
          placeholder="Write something..."
          placeholderTextColor="#000"
          value={text}
          onChangeText={setText}
        />
        <View className='my-2'>
            <Button title="Add an Image" onPress={handleAddImage} />
        </View>
        {image &&
        <Image
            source={{uri:image}}
            alt='post'
            resizeMode='contain'
            className='max-w-80 h-72 mx-6'
        
        />}
        
        

        <View className='my-2 flex flex-row items-center justify-between mx-10'>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
  },
  modalContainer: {
    position: 'absolute',
    top: '20%',
    left: '5%',
    right: '5%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    marginRight: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#ccc',
    borderRadius: 6,
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelText: {
    color: '#333',
    fontWeight: 'bold',
  },
  addText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CreatePostModal;
