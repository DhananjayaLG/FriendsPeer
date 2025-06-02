import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabNavigator from './TabNavigtor';
import JoinedRoomScreen from '../screens/JoinedRoomScreen'; // Dynamic route
import LoginScreen from '../screens/LoginScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="JoinedRoomScreen" component={JoinedRoomScreen} options={{ headerShown: false }}/>
          
      </Stack.Navigator>
    </NavigationContainer>
  );
}

