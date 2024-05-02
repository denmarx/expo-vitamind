import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

// component that displays the position of the sun
const SunPosition = ({ sunPositionX, sunPositionY }) => {
  // render a view with the sun's position
  // return <View style={[styles.sun, { left: sunPositionX, top: sunPositionY }]}></View>;
  return (
    <LinearGradient
      style={[styles.sun, { left: sunPositionX, top: sunPositionY - 5 / 2 + Constants.statusBarHeight }]}
      colors={['#ffd700', '#ffda44', '#ffdf77']}
      stops={[0.1, 0.5, 1]}
      center={[25, 25]}
      radius={50}
    ></LinearGradient>
  );
};

// styles for the sun component
const styles = StyleSheet.create({
  sun: {
    position: 'absolute',
    width: 5,
    height: 5,
    backgroundColor: '#ffd700',
    borderRadius: 50,
  },
});

export default SunPosition;
