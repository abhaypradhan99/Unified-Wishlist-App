

import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { useEffect, useRef } from 'react';
import Dashboard from './src/screens/Dashboard';
import AddItem from './src/screens/AddItem';
import { initDb } from './src/utils/db';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['centscape://', Linking.makeUrl('/')],
  config: {
    screens: {
      Dashboard: '',
      AddItem: 'add'
    }
  }
};

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    initDb();
  }, []);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const { queryParams } = Linking.parse(url);
      if (queryParams?.url && navigationRef.current) {
        navigationRef.current.navigate('AddItem', { url: queryParams.url });
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      <Stack.Navigator>
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddItem"
          component={AddItem}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}