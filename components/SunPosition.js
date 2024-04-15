import React from 'react';
import { View, StyleSheet } from 'react-native';

// component that displays the position of the sun
const SunPosition = ({ sunPositionX, sunPositionY }) => {
  // render a view with the sun's position
  return <View style={[styles.sun, { left: sunPositionX, top: sunPositionY }]}></View>;
};

// styles for the sun component
const styles = StyleSheet.create({
  sun: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: '#ffd700',
    borderRadius: 50,
  },
});

export default SunPosition;
