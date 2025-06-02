import React from 'react';
import AppNavigator from './navigation/AppNavigator';
import '../global.css'
import { View,StyleSheet } from 'react-native';
export default function App() {
  return (
    <View style={styles.container}>
      <AppNavigator />
    </View>
  )
  
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});