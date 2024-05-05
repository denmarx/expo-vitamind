import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, AppState, Button, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SunPosition from './components/SunPosition';
import { useSunPositionCalculator } from './functions/sunPositionCalculator';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { calculateVitaminDTimer } from './functions/calculateVitaminDTimer';
import AltitudeAndHourlyScale from './components/AltitudeAndHourlyScale';

SplashScreen.preventAutoHideAsync();

const InfoOverlay = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
      }}
      onPress={onClose}
    >
      <View style={{ backgroundColor: '#FFEBCD', padding: 20 }}>
        <Text>
          <Text style={{ fontWeight: 'bold', fontSize: 25 }}>Welcome to Solar Dose!{'\n'}</Text>
          {'\n'}
          While we're still refining the app, we're thrilled to share its current capabilities with you.{'\n'}
          <Text style={{ fontWeight: 'bold' }}>Solar Dose</Text> informs you about the sun's altitude based on your
          location.{'\n'}
          {'\n'}
          <Text style={{ fontWeight: 'bold' }}>Understanding Sun Altitude:{'\n'}</Text>
          When the sun reaches approximately 45 degrees, your skin begins producing
          <Text style={{ fontWeight: 'bold' }}> Vitamin D</Text>.This essential vitamin is crucial for{' '}
          <Text style={{ fontWeight: 'bold' }}>bone health</Text> and{' '}
          <Text style={{ fontWeight: 'bold' }}>immune system support</Text>, primarily obtained through sunlight.{'\n'}
          {'\n'}
          <Text style={{ fontWeight: 'bold' }}>Optimal Sun Exposure:</Text>
          {'\n'}Regular sun exposure can produce around 1000 International Units (IU) of Vitamin D per day. However,
          excessive exposure doesn't increase Vitamin D production and may harm the skin.{'\n'}
          {'\n'}
          <Text style={{ fontWeight: 'bold' }}>Cloud Cover and Vitamin D Synthesis:</Text> {'\n'}
          Cloudy days reduce sunlight reaching your skin, impacting Vitamin D production.{'\n'}
          {'\n'}
          <Text style={{ fontWeight: 'bold' }}>Sunscreen and Vitamin D:</Text>
          {'\n'}
          While sunscreen protects from UV rays, it can also inhibit Vitamin D synthesis. Balancing sun protection with
          Vitamin D needs is essential.
          {'\n'}
          {'\n'}
          <Text style={{ fontWeight: 'bold' }}>Future Enhancements:</Text>
          {'\n'}
          We're continuously improving Solar Dose to offer comprehensive recommendations. Updates will consider factors
          like cloud cover and UV-index {'\n'}
          {'\n'}
          Thank you for choosing Solar Dose. Stay tuned for updates and new features!{' '}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function App() {
  const appState = AppState.currentState;
  const [nextAppState, setNextAppState] = useState(appState);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    async function checkOverlayStatus() {
      try {
        const overlayStatus = await AsyncStorage.getItem('overlayShown');
        console.log('Overlay status:', overlayStatus);
        if (overlayStatus === null) {
          // Info overlay has not been shown yet
          setShowOverlay(true);
          // Mark overlay as shown
          await AsyncStorage.setItem('overlayShown', 'true');
        }
      } catch (error) {
        console.error('Error retrieving overlay status:', error);
      }
    }

    checkOverlayStatus();
  }, []);

  const handleOverlayClose = () => {
    setShowOverlay(false);
  };

  const handleShowOverlayAgain = () => {
    setShowOverlay(true);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setNextAppState(nextAppState);
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

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#87ceeb', '#57b6de']} style={styles.upperHalf}>
        <View style={styles.overlayContainer}>
          <Button title='?' onPress={handleShowOverlayAgain} color='#253941' />
        </View>
        <AltitudeAndHourlyScale sunrise={sunrise.getHours()} sunset={Math.floor(sunset.getHours())} />
        <SunPosition sunPositionX={sunPosition.x} sunPositionY={sunPosition.y} />
      </LinearGradient>
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
      <InfoOverlay visible={showOverlay} onClose={handleOverlayClose} />
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
    position: 'relative',
  },
  lowerHalf: {
    flex: 0.5,
    width: '100%',
    backgroundColor: '#FFEBCD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContainer: {
    position: 'absolute',
    top: 10,
    right: 0,
    padding: 20,
    borderRadius: 25,
  },
});
