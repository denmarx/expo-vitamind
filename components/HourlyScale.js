import React from 'react';
import { View, Text, Dimensions } from 'react-native';

const HourlyScale = ({ sunrise, sunset }) => {
  const deviceWidth = Dimensions.get('window').width;
  const hours = sunset - sunrise + 1;

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: deviceWidth, height: 20 }}>
      {Array.from({ length: hours }, (_, i) => i + sunrise).map((hour) => (
        <Text key={hour}>{hour}</Text>
      ))}
    </View>
  );
};

export default HourlyScale;
