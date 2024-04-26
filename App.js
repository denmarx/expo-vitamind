import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SunPosition from './components/SunPosition';
import { useSunPositionCalculator } from './functions/sunPositionCalculator';
import { Dimensions } from 'react-native';
import Constants from 'expo-constants';
import AltitudeScale from './components/AltitudeScale';
import { LinearGradient } from 'expo-linear-gradient';
import TimeScale from './components/TimeScale';
import { LocationProvider } from './components/LocationProvider';

export default function App() {
  const { sunPosition, error } = useSunPositionCalculator();
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
    <LocationProvider>
      <View style={styles.container}>
        <LinearGradient colors={['#87ceeb', '#87a5eb']} style={styles.upperHalf}>
          <AltitudeScale />
          <SunPosition sunPositionX={sunPosition.x} sunPositionY={sunPosition.y} />
          <StatusBar style='auto' />
        </LinearGradient>
        <View style={styles.lowerHalf}>
          <Text>{vitaminDMessage}</Text>
        </View>
        <TimeScale />
      </View>
    </LocationProvider>
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
