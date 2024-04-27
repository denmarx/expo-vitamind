import { StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';

// AltitudeScale component that renders the altitude scale on the left side of the screen
export default function AltitudeScale() {
  return (
    <View style={styles.altitudeScale}>
      <View style={styles.altitudeScaleLine}></View>
      {/* Create an array of 10 elements and map over it to render the altitude scale ticks */}
      {[...Array(10).keys()].map(
        // Render a tick for each element in the array, except the last one
        (i) =>
          i !== 9 && (
            <Text key={i} style={{ ...styles.tick, top: `${i * 10}%` }}>
              {(9 - i) * 10}°
            </Text>
          )
      )}
      <View style={styles.dashedLine}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  altitudeScale: {
    position: 'absolute',
    left: 0,
    top: 0 + Constants.statusBarHeight,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  altitudeScaleLine: {
    position: 'absolute',
    width: 2,
    left: 0,
    height: '100%',
    backgroundColor: '#000',
  },
  tick: {
    position: 'absolute',
    left: 5,
    color: '#000',
  },
  dashedLine: {
    position: 'absolute',
    width: 50,
    height: 50,
    top: 100,
    left: 50,
  },
});
