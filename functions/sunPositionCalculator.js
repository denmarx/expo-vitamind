import { useEffect, useState } from 'react';
import SunCalc from 'suncalc';
import * as Location from 'expo-location';
import { Dimensions } from 'react-native';

// function component that calculates the position of the sun based on the user's location
export const useSunPositionCalculator = () => {
  // state to store the position of the sun
  const [sunPosition, setSunPosition] = useState({ x: 0, y: 0 });
  // state to store any errors that occur during the calculation
  const [error, setError] = useState(null);

  // useEffect hook to get the user's location and calculate the sun's position
  useEffect(() => {
    const getUserLocation = async () => {
      // request permission to access the user's location
      try {
        // get the user's location
        let { status } = await Location.requestForegroundPermissionsAsync();
        // if permission is not granted, set an error message
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          return;
        }

        // get the user's current position
        const { coords } = await Location.getCurrentPositionAsync({});
        // get the latitude and longitude from the user's position
        const { latitude, longitude } = coords;
        // calculate the position of the sun based on the user's location
        const times = SunCalc.getPosition(new Date(), latitude, longitude);
        // convert the altitude to degrees
        const altitudeInDegrees = times.altitude * (180 / Math.PI);

        // set the position of the sun
        setSunPosition({
          x: calculateSunPositionX(times.azimuth),
          y: calculateSunPositionY(altitudeInDegrees),
          altitude: altitudeInDegrees,
        });
      } catch (error) {
        setError('Error getting location: ' + error.message);
      }
    };

    // call the getUserLocation function when the component mounts
    getUserLocation();
  }, []);

  // function to calculate the x position of the sun based on its azimuth in radians
  const calculateSunPositionX = (azimuth) => {
    const azimuthInRadians = azimuth < 0 ? azimuth + 2 * Math.PI : azimuth; // Convert negative azimuth to positive
    const adjustedAzimuth = ((azimuthInRadians - Math.PI / 2) / Math.PI) % 1;
    return Dimensions.get('window').width * adjustedAzimuth;
  };

  // function to calculate the y position of the sun based on its altitude in degrees
  const calculateSunPositionY = (altitudeInDegrees) => {
    // calculate the percentage of the maximum altitude (90 degrees)
    const percentageOfMaxAltitude = altitudeInDegrees / 90;
    // calculate the y position of the sun based on the percentage of the maximum altitude
    return (Dimensions.get('window').height / 2) * (1 - percentageOfMaxAltitude);
  };
  return { sunPosition, error };
};
