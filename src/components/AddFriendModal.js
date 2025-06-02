import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';

const AddFriendModal = ({ visible, onClose, onSubmit }) => {
  const [friendName, setFriendName] = useState('');
  const [friendId, setFriendId] = useState('');

  const handleAdd = () => {
    if (!friendName.trim() || !friendId.trim()) return;

    onSubmit({ name: friendName.trim(), id: friendId.trim(), profile:"" });
    setFriendName('');
    setFriendId('');
    onClose();
  };

  const handleClose = () => {
    setFriendName('');
    setFriendId('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Add Friend</Text>

        <TextInput
          style={styles.input}
          placeholder="Friend's Name"
          placeholderTextColor="#000"
          value={friendName}
          onChangeText={setFriendName}
        />

        <TextInput
          style={styles.input}
          placeholder="Friend's ID"
          placeholderTextColor="#000"
          value={friendId}
          onChangeText={setFriendId}
        />

        <View style={styles.buttonRow}>
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
    top: '30%',
    left: '10%',
    right: '10%',
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

export default AddFriendModal;
