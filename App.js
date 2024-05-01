import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SunPosition from './components/SunPosition';
import { useSunPositionCalculator } from './functions/sunPositionCalculator';
import AltitudeScale from './components/AltitudeScale';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { calculateVitaminDTimer } from './functions/calculateVitaminDTimer';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Proxima: require('./assets/proxima-nova/Proxima-Nova-Regular.otf'),
  });

  const { sunPosition, error, latitude, longitude } = useSunPositionCalculator();
  const [vitaminDProductionOccurred, setVitaminDProductionOccurred] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // Check if the sun is above 45 degrees altitude and set the state accordingly
  useEffect(() => {
    if (sunPosition.altitude > 45 && !vitaminDProductionOccurred) {
      setVitaminDProductionOccurred(true);
    }
  }, [sunPosition]);

  // Calculate time left until sun reaches 45 degrees altitude
  useEffect(() => {
    const timeWhenSunReaches45Degrees = calculateVitaminDTimer(latitude, longitude);
    const intervalId = setInterval(() => {
      const currentTime = new Date();
      const timeDifferenceMilliseconds = timeWhenSunReaches45Degrees - currentTime;

      // Calculate time left until sun reaches 45 degrees altitude
      if (timeDifferenceMilliseconds >= 0) {
        const totalMinutes = Math.floor(timeDifferenceMilliseconds / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        // Display time left in hours and minutes if above 60 minutes, else display just minutes
        if (totalMinutes >= 60) {
          setTimeLeft(`${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`);
        } else {
          setTimeLeft(`${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`);
        }
      } else {
        // If time left is negative, it means the sun has already passed 45 degrees altitude again
        setTimeLeft('0 minutes');
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [latitude, longitude]);

  // Hide the splash screen when the root view has been laid out
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // If fonts are not loaded yet, return null
  if (!fontsLoaded && !fontError) {
    return null;
  }
  // If there is an error, display the error message
  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
        <StatusBar style='auto' />
      </View>
    );
  }

  const vitaminDMessage = sunPosition.altitude > 45 ? 'You are getting Vitamin D!' : 'You are not getting Vitamin D!';

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#87ceeb', '#57b6de']} style={styles.upperHalf}>
        <AltitudeScale />
        <SunPosition sunPositionX={sunPosition.x} sunPositionY={sunPosition.y} />
      </LinearGradient>
      <View style={styles.lowerHalf} onLayout={onLayoutRootView}>
        <Ionicons
          name='sunny'
          size={50}
          color={vitaminDProductionOccurred ? 'gold' : 'gray'}
          style={{ marginBottom: 20 }}
        />
        <Text style={{ fontFamily: 'Proxima', fontSize: 25 }}>{vitaminDMessage} </Text>
        <Text style={{ fontFamily: 'Proxima', fontSize: 15 }}>Time until sun reaches 45 degrees: {timeLeft}</Text>
      </View>
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

    backgroundColor: '#FFEBCD',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
