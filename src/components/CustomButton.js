import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ title,onPress }) => {
    return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6ab0ae',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
     // aligns to top-right if inside a container
  },
  text: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,

  },
});

export default CustomButton;
