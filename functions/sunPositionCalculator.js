import { useEffect, useState } from 'react';
import SunCalc from 'suncalc';
import * as Location from 'expo-location';
import { Dimensions } from 'react-native';

// function component that calculates the position of the sun based on the user's location
export const useSunPositionCalculator = (appState) => {
  // state to store the position of the sun
  const [sunPosition, setSunPosition] = useState({ x: 0, y: 0 });
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [sunrise, setSunrise] = useState(new Date());
  const [sunset, setSunset] = useState(new Date());
  const [error, setError] = useState(null);
  const state = appState;
  console.log(state);
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

        setLatitude(latitude);
        setLongitude(longitude);

        updateSunPosition(latitude, longitude);

        const intervalId = setInterval(() => {
          updateSunPosition(latitude, longitude);
        }, 60000);

        return () => clearInterval(intervalId);
      } catch (error) {
        setError('Error getting location: ' + error.message);
      }
    };

    // const times = SunCalc.getTimes(new Date(), latitude, longitude);

    // setSunrise(times.sunrise);
    // setSunset(times.sunset);

    // call the getUserLocation function when the component mounts
    getUserLocation();
  }, [latitude, longitude, state]);

  const updateSunPosition = (latitude, longitude) => {
    const times = SunCalc.getTimes(new Date(), latitude, longitude);
    const sunrise = times.sunrise;
    const sunset = times.sunset;
    setSunrise(sunrise);
    setSunset(sunset);

    const position = SunCalc.getPosition(new Date(), latitude, longitude);
    const altitudeInDegrees = position.altitude * (180 / Math.PI);

    setSunPosition({
      x: calculateSunPositionX(sunrise, sunset),
      y: calculateSunPositionY(altitudeInDegrees),
      altitude: altitudeInDegrees,
    });
  };

  const calculateSunPositionX = (sunrise, sunset) => {
    const timeDifferenceInHours = (sunset - sunrise) / 3600000;
    const currentTime = new Date();
    const currentTimeInHours = currentTime.getHours() + currentTime.getMinutes() / 60;
    const currentTimeInHoursSinceSunrise = currentTimeInHours - sunrise.getHours() - sunrise.getMinutes() / 60;
    const percentageOfDay = currentTimeInHoursSinceSunrise / timeDifferenceInHours;
    return Dimensions.get('window').width * percentageOfDay;
  };

  // function to calculate the y position of the sun based on its altitude in degrees
  const calculateSunPositionY = (altitudeInDegrees) => {
    // calculate the percentage of the maximum altitude (90 degrees)
    const percentageOfMaxAltitude = altitudeInDegrees / 90;
    // calculate the y position of the sun based on the percentage of the maximum altitude
    return (Dimensions.get('window').height / 2) * (1 - percentageOfMaxAltitude);
  };

  return { sunPosition, error, latitude, longitude, sunrise, sunset };
};
