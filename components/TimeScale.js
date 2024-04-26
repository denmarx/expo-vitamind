import { StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { Dimensions } from 'react-native';
import { useSunPositionCalculator } from '../functions/sunPositionCalculator';
import SunCalc from 'suncalc';

export default function TimeScale() {
  const { latitude, longitude } = useSunPositionCalculator();
  const times = SunCalc.getTimes(new Date(), latitude, longitude);
  const sunrise = times.sunrise.getHours();
  const sunset = times.sunset.getHours();

  const hours = Array.from({ length: sunset - sunrise + 1 }, (_, i) => sunrise + i);
  return <View style={styles.timeScaleLine}></View>;
}

const styles = StyleSheet.create({
  timeScaleLine: {
    position: 'absolute',
    width: '100%',
    top: Dimensions.get('window').height / 2 + Constants.statusBarHeight / 2,
    height: 2,
    backgroundColor: '#000',
  },
  tick: {
    position: 'absolute',
    left: 5,
    color: '#000',
  },
});
