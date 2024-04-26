import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SunPosition from './components/SunPosition';
import { useSunPositionCalculator } from './functions/sunPositionCalculator';
import { Dimensions } from 'react-native';
import Constants from 'expo-constants';
import AltitudeScale from './components/AltitudeScale';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Proxima: require('./assets/proxima-nova/Proxima-Nova-Regular.otf'),
  });

  const { sunPosition, error } = useSunPositionCalculator();
  const [vitaminDProductionOccurred, setVitaminDProductionOccurred] = useState(false);

  useEffect(() => {
    if (sunPosition.altitude > 45 && !vitaminDProductionOccurred) {
      setVitaminDProductionOccurred(true);
    }
  }, [sunPosition]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }
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
        <StatusBar style='auto' />
      </LinearGradient>
      <View style={styles.lowerHalf} onLayout={onLayoutRootView}>
        <Ionicons
          name='sunny'
          size={50}
          color={vitaminDProductionOccurred ? 'gold' : 'gray'}
          style={{ marginBottom: 20 }}
        />
        <Text style={{ fontFamily: 'Proxima', fontSize: 25 }}>{vitaminDMessage} </Text>
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

    backgroundColor: '#FFEBCD',
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
