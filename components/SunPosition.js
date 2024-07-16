import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

// component that displays the position of the sun
const SunPosition = ({ sunPositionX, sunPositionY }) => {
  // render a view with the sun's position
  // return <View style={[styles.sun, { left: sunPositionX, top: sunPositionY }]}></View>;
  return (
    <LinearGradient
      style={[styles.sun, { left: sunPositionX, top: sunPositionY + -15 + Constants.statusBarHeight }]}
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
    width: 30,
    height: 30,
    backgroundColor: '#ffd700',
    borderRadius: 50,
  },
});

export default SunPosition;