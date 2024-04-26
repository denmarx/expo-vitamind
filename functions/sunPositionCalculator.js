import { useEffect, useState } from 'react';
import SunCalc from 'suncalc';
import * as Location from 'expo-location';
import { Dimensions } from 'react-native';
import { useLocation } from '../components/LocationProvider';

// function component that calculates the position of the sun based on the user's location
export const useSunPositionCalculator = () => {
  // state to store the position of the sun
  const [sunPosition, setSunPosition] = useState({ x: 0, y: 0 });
  // state to store any errors that occur during the calculation
  const [location, error] = useLocation();

  // useEffect hook to get the user's location and calculate the sun's position
  useEffect(() => {
    // calculate the position of the sun based on the user's location
    const position = SunCalc.getPosition(new Date(), location.latitude, location.longitude);
    const times = SunCalc.getTimes(new Date(), location.latitude, location.longitude);

    const sunrise = times.sunrise;
    const sunset = times.sunset;

    // convert the altitude to degrees
    const altitudeInDegrees = position.altitude * (180 / Math.PI);

    // set the position of the sun
    setSunPosition({
      x: calculateSunPositionX(sunrise, sunset),
      y: calculateSunPositionY(altitudeInDegrees),
      altitude: altitudeInDegrees,
    });
  }, [location.latitude, location.longitude]);

  const calculateSunPositionX = (sunrise, sunset) => {
    const timeDifferenceInHours = (sunset - sunrise) / 3600000;
    const currentTime = new Date();
    const currentTimeInHours = currentTime.getHours() + currentTime.getMinutes() / 60;
    const currentTimeInHoursSinceSunrise = currentTimeInHours - sunrise.getHours() - sunrise.getMinutes() / 60;
    const percentageOfDay = currentTimeInHoursSinceSunrise / timeDifferenceInHours;
    return (Dimensions.get('window').width - 70) * percentageOfDay;
  };

  // function to calculate the y position of the sun based on its altitude in degrees
  const calculateSunPositionY = (altitudeInDegrees) => {
    // calculate the percentage of the maximum altitude (90 degrees)
    const percentageOfMaxAltitude = altitudeInDegrees / 90;
    // calculate the y position of the sun based on the percentage of the maximum altitude
    return (Dimensions.get('window').height / 2) * (1 - percentageOfMaxAltitude);
  };
  return { sunPosition, location, error };
};
