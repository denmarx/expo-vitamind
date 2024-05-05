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

  const requestPermissions = async () => {
    let foreGroundPermission = await Location.requestForegroundPermissionsAsync();
    let backgroundPermission = await Location.requestBackgroundPermissionsAsync();

    if (foreGroundPermission.status !== 'granted' || backgroundPermission.status !== 'granted') {
      setError('Permission to access location was denied');
      return;
    }
    getUserLocation();
  };

  useEffect(() => {
    const checkPermissionStatus = async () => {
      let foreGroundPermission = await Location.getForegroundPermissionsAsync();
      let backgroundPermission = await Location.getBackgroundPermissionsAsync();

      if (foreGroundPermission.status === 'granted' && backgroundPermission.status === 'granted') {
        getUserLocation();
      } else {
        requestPermissions();
      }
    };

    checkPermissionStatus();
  }, [latitude, longitude, state]);

  const getUserLocation = async () => {
    try {
      const { coords } = await Location.getCurrentPositionAsync({});
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
    const sunriseTime = new Date(sunrise);
    const sunsetTime = new Date(sunset);
    // const currentTimeInHours = currentTime.getHours() + currentTime.getMinutes() / 60;
    // const currentTimeInHoursSinceSunrise = currentTimeInHours - sunrise.getHours() - sunrise.getMinutes() / 60;
    const percentageOfDay = (currentTime - sunriseTime) / (sunsetTime - sunriseTime);

    console.log(percentageOfDay, Dimensions.get('window').width * percentageOfDay);
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
