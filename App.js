import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SunPosition from './components/SunPosition';
import { useSunPositionCalculator } from './functions/sunPositionCalculator';
import { Dimensions } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to receive notifications was denied');
        return;
      }

      const expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo Push Token: ', expoPushToken);
    } catch (error) {
      console.error('Error getting push token: ', error.message);
    }
  };

  const { sunPosition, error } = useSunPositionCalculator();

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
        <StatusBar style='auto' />
      </View>
    );
  }

  const vitaminDMessage = sunPosition.altitude > 40 ? 'You are getting Vitamin D!' : 'You are not getting Vitamin D!';

  return (
    <View style={styles.container}>
      <View style={styles.upperHalf}>
        <SunPosition sunPositionX={sunPosition.x} sunPositionY={sunPosition.y} />
        <StatusBar style='auto' />
      </View>
      <View style={styles.lowerHalf}>
        <Text>{vitaminDMessage}</Text>
      </View>
      <View style={styles.horizon}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87ceeb',
  },
  upperHalf: {
    flex: 0.5,
    width: '100%',
  },
  lowerHalf: {
    flex: 0.5,
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizon: {
    position: 'absolute',
    top: Dimensions.get('window').height / 2 + Constants.statusBarHeight / 2,
    height: 2,
    width: '100%',
    backgroundColor: '#000',
  },
});
