import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Button,
  ActivityIndicator
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useChatStore } from '../store/useChatStore';
import { useNavigation } from '@react-navigation/native';
import {
  createTable,
  createUserTable,
  updateUserName,
  updateUserProfilePhoto,
  updateUserLoginState,
  getUserData
} from '../database/db.js';
import { Image as RNCImage } from 'react-native-compressor';

const MAX_FILE_SIZE = 1024 * 1024;

const LoginScreen = () => {
  const {profilePhoto, setProfilePhoto,roomId,myName,setMyName} = useChatStore();
  const [tempName, setTempName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const navigation = useNavigation()
  const [isLoading,setIsLoading]=useState(true)
  const [user,setUser]=useState({name: '', profile: '',isLoggedIn: false})

  const handleSetName = async (name) => {
    await updateUserName(name);
  };

  const handleSetProfilePhoto = async (base64) => {
    await updateUserProfilePhoto(base64);
  };

  const handleSetLoginState = async (state) => {
    await updateUserLoginState(state); 
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
          };
          reader.readAsDataURL(blob);
          } catch (error) {
        Alert.alert('Error', 'Failed to compress image');
        console.error(error);
      }
      });
    };

  const saveName = () => {
    if (!tempName.trim()) {
      Alert.alert('Please Enter your name');
      return;
    }
    setMyName(tempName.trim());
    setEditingName(false);
  };
  const handleLogin = () => {
    if (!myName.trim()) {
      Alert.alert('Username is required');
      return;
    }
    handleSetName(myName)
    if (profilePhoto){
      handleSetProfilePhoto(profilePhoto)
    }
    handleSetLoginState(true)
    setIsLoading(false)
    navigation.replace('Tabs'); // assuming your TabNavigator is under "Main"
  };
  const loadUserData = async () => {
    const user = await getUserData();
    if(user){
      setUser(user)
      setMyName(user.name)
      setProfilePhoto(user.profile)
      setIsLoading(false)
    }
    setIsLoading(false)
  };
  

useEffect(()=>{
  createTable()
  createUserTable()
  loadUserData()
},[])

useEffect(() => {
  if (user.isLoggedIn && !isLoading) {
    navigation.replace('Tabs');
  }
}, [user.isLoggedIn, isLoading]);



  
  return isLoading ? (<View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007bff" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>)
  :
  (
    
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
            <Text style={styles.nameText}>{`${myName.trim()?myName:"Enter Your Name"}`}</Text>
          </TouchableOpacity>
        )}
      </View>
        <View>
            <Button title='Go to Home' onPress={handleLogin}/>
        </View>
      
    </View>
  )
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

export default LoginScreen;