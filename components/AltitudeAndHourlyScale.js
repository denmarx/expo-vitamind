import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Constants from 'expo-constants';

const HourlyScale = ({ sunrise, sunset }) => {
  const hours = sunset - sunrise + 1;

  return (
    <View style={styles.hourlyScale}>
      {Array.from({ length: hours }, (_, i) => {
        const hour = i + sunrise;
        const formattedHour = hour < 10 ? `0${hour}h` : `${hour}h`;

        if (i % 2 !== 0) {
          return <Text key={hour}>{formattedHour}</Text>;
        } else {
          return null;
        }
      })}
    </View>
  );
};

const AltitudeScale = () => {
  return (
    <View style={styles.altitudeScale}>
      {[...Array(10).keys()].map(
        (i) =>
          i !== 9 && (
            <Text key={i} style={{ ...styles.tick, top: `${i * 10}%` }}>
              {(9 - i) * 10}°
            </Text>
          )
      )}
    </View>
  );
};

const AltitudeAndHourlyScale = ({ sunrise, sunset }) => {
  return (
    <View style={styles.container}>
      <AltitudeScale />
      <HourlyScale sunrise={sunrise} sunset={sunset} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: '100%',
  },
  altitudeScale: {
    top: 0 + Constants.statusBarHeight,
    justifyContent: 'space-between',
  },
  tick: {
    position: 'absolute',
    left: 5,
    color: '#000',
  },
  hourlyScale: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingLeft: 5,
    paddingRight: 5,
    top: Dimensions.get('window').height / 2 -5,
  },
});

export default AltitudeAndHourlyScale;
