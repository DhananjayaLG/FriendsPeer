import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Clipboard from '@react-native-clipboard/clipboard';
import { useChatStore } from '../store/useChatStore';
import {
  updateUserName,
  updateUserProfilePhoto,
} from '../database/db.js';
import { Image as RNCImage } from 'react-native-compressor';

const MAX_FILE_SIZE = 1024 * 1024;

const MyProfileScreen = () => {
  const {profilePhoto, setProfilePhoto,roomId,myName,setMyName} = useChatStore();
  const [tempName, setTempName] = useState(myName);
  const [editingName, setEditingName] = useState(false);
  
  const handleSetName = async (name) => {
      await updateUserName(name);
    };
  
    const handleSetProfilePhoto = async (base64) => {
      await updateUserProfilePhoto(base64);
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


  const pickImage = async() => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, async(res) => {
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
        reader.onloadend = async() => {
            const base64data = reader.result;
            await setProfilePhoto(base64data); 
            await handleSetProfilePhoto(base64data);
        };
        reader.readAsDataURL(blob);
        } catch (error) {
      Alert.alert('Error', 'Failed to compress image');
      console.error(error);
    }
    });
  };

  const copyToClipboard = () => {
    Clipboard.setString(roomId);
    Alert.alert('Copied', 'Your ID has been copied to clipboard.');
  };

  const saveName = async() => {
    setMyName(tempName.trim() || myName);
    handleSetName(tempName.trim() || myName)
    setEditingName(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        {profilePhoto ? (
          <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
        ) : (
          <View style={[styles.profileImage, styles.placeholder]}>
            <Text style={{ color: '#999' }}>Tap to add photo</Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.nameContainer}>
        {editingName ? (
          <>
            <TextInput
              value={tempName}
              onChangeText={setTempName}
              style={styles.nameInput}
              autoFocus
            />
            <TouchableOpacity onPress={saveName} style={styles.saveButton}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={() => setEditingName(true)}>
            <Text style={styles.nameText}>{myName}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.idRow}>
        <Text style={styles.idLabel}>My ID:</Text>
        <Text selectable style={styles.idValue}>{roomId}</Text>
        <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
          <Text style={styles.copyText}>Copy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    backgroundColor: '#f8f9fa',
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ddd',
    marginBottom: 20,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  nameInput: {
    fontSize: 20,
    borderBottomWidth: 1,
    borderColor: '#007bff',
    padding: 5,
    minWidth: 200,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  idLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  idValue: {
    fontSize: 16,
    color: '#333',
  },
  copyButton: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  copyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MyProfileScreen;