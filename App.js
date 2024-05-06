// Basics
import { StyleSheet, Text, View, AppState, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import { useState } from 'react';
import * as Localization from 'expo-localization';
import { i18n } from './locales/translation';
// Components
import SunPosition from './components/SunPosition';
import AltitudeAndHourlyScale from './components/AltitudeAndHourlyScale';
import InfoOverlay from './components/InfoOverlay';
// Hooks
import { useSunPositionCalculator } from './hooks/sunPositionCalculator';
import useOverlayStatus from './hooks/useOverlayStatus';
import useAppState from './hooks/useAppState';
import useFontLoader from './hooks/useFontLoader';
import useSunPositionEffect from './hooks/useSunPositionEffect';
import useTimeLeftEffect from './hooks/useTimeLeftEffect';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [nextAppState, setNextAppState] = useState(AppState.currentState);

  const { appState } = useAppState(setNextAppState);
  const { fontsLoaded, fontError } = useFontLoader();
  const { sunPosition, error, latitude, longitude, sunrise, sunset } = useSunPositionCalculator(nextAppState);
  const [vitaminDProductionOccurred, setVitaminDProductionOccurred] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [vitaminDMessage, setVitaminDMessage] = useState('');
  const [vitaminDColor, setVitaminDColor] = useState('gray');
  // Set the locale to the device's locale
  i18n.locale = Localization.getLocales()[0].languageCode;

  // Check if the user wants to see the overlay
  useOverlayStatus(setShowOverlay);
  // Check if the user is getting Vitamin D
  useSunPositionEffect(
    sunPosition,
    appState,
    vitaminDProductionOccurred,
    setVitaminDProductionOccurred,
    setVitaminDMessage,
    setVitaminDColor,
    i18n
  );
  // Calculate the time left until the sun reaches 45 degrees
  useTimeLeftEffect(latitude, longitude, setTimeLeft);

  // Hide the splash screen when the root view has been laid out
  const handleOverlayClose = () => {
    setShowOverlay(false);
  };
  // Show the overlay again
  const handleShowOverlayAgain = () => {
    setShowOverlay(true);
  };
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

  // i18n.locale = 'en';
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
      <InfoOverlay visible={showOverlay} onClose={handleOverlayClose} i18n={i18n} />
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
