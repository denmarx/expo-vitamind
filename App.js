import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, AppState } from 'react-native';
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
import HourlyScale from './components/HourlyScale';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const appState = AppState.currentState;
  const [nextAppState, setNextAppState] = useState(appState);
  // console.log('AppState', nextAppState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setNextAppState(nextAppState);
      // console.log('nextAppState', nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    Proxima: require('./assets/proxima-nova/Proxima-Nova-Regular.otf'),
  });

  const { sunPosition, error, latitude, longitude, sunrise, sunset } = useSunPositionCalculator(nextAppState);
  const [vitaminDProductionOccurred, setVitaminDProductionOccurred] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [vitaminDMessage, setVitaminDMessage] = useState('');
  const [vitaminDColor, setVitaminDColor] = useState('gray');

  // Check if the sun is above 45 degrees altitude and set the state accordingly
  useEffect(() => {
    if (sunPosition.altitude > 45 && !vitaminDProductionOccurred) {
      setVitaminDProductionOccurred(true);
    } else if (sunPosition.altitude <= 45 && vitaminDProductionOccurred) {
      setVitaminDProductionOccurred(false);
    }
  }, [sunPosition, appState, vitaminDProductionOccurred]);

  useEffect(() => {
    const vitaminDMessage = sunPosition.altitude > 45 ? 'You are getting Vitamin D!' : 'You are not getting Vitamin D!';
    const vitaminDColor = vitaminDProductionOccurred ? 'gold' : 'gray';

    setVitaminDMessage(vitaminDMessage);
    setVitaminDColor(vitaminDColor);
  }, [sunPosition, vitaminDProductionOccurred, appState]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const timeWhenSunReaches45Degrees = calculateVitaminDTimer(latitude, longitude);
      const currentTime = new Date();
      const timeDifferenceMilliseconds = timeWhenSunReaches45Degrees - currentTime;

      if (timeDifferenceMilliseconds >= 0) {
        const totalSeconds = Math.floor(timeDifferenceMilliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        // Return formatted time left
        if (totalSeconds >= 3600) {
          return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${
            minutes !== 1 ? 's' : ''
          } ${seconds} second${seconds !== 1 ? 's' : ''}`;
        } else if (totalSeconds >= 60) {
          return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
        } else {
          return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        }
      } else {
        return '0 seconds';
      }
    };
    const intervalId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
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

  // const vitaminDMessage = sunPosition.altitude > 45 ? 'You are getting Vitamin D!' : 'You are not getting Vitamin D!';
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#87ceeb', '#57b6de']} style={styles.upperHalf}>
        <AltitudeScale />
        <SunPosition sunPositionX={sunPosition.x} sunPositionY={sunPosition.y} />
      </LinearGradient>
      {/* <HourlyScale sunrise={sunrise.getHours()} sunset={Math.floor(sunset.getHours())} /> */}
      <View style={styles.lowerHalf} onLayout={onLayoutRootView}>
        <Ionicons
          name='sunny'
          size={50}
          color={vitaminDProductionOccurred ? vitaminDColor : 'gray'}
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
