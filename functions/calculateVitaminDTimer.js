import SunCalc from 'suncalc';

export const calculateVitaminDTimer = (latitude, longitude) => {
  let date = new Date();

  let targetAltitute = 45;

  let times = SunCalc.getTimes(date, latitude, longitude);

  let sunrise = times.sunrise;
  let sunset = times.sunset;

  let interval = 60 * 1000; // 1 minute

  let currentTime = new Date(sunrise.getTime() + interval);

  let timeAtAltitude = null;

  while (currentTime < sunset) {
    let position = SunCalc.getPosition(currentTime, latitude, longitude);
    let altitude = position.altitude * (180 / Math.PI);

    if (altitude > targetAltitute) {
      timeAtAltitude = currentTime;
      break;
    }

    currentTime = new Date(currentTime.getTime() + interval);
  }

  return timeAtAltitude;
};
