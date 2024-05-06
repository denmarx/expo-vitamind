import { useEffect } from 'react';
import { calculateVitaminDTimer } from './calculateVitaminDTimer';

const useTimeLeftEffect = (latitude, longitude, setTimeLeft) => {
  useEffect(() => {
    const calculateTimeLeft = () => {
      const timeWhenSunReaches45Degrees = calculateVitaminDTimer(latitude, longitude);
      const currentTime = new Date();
      const timeDifferenceMilliseconds = timeWhenSunReaches45Degrees - currentTime;

      if (timeDifferenceMilliseconds >= 0) {
        const totalSeconds = Math.floor(timeDifferenceMilliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        // Return formatted time left
        if (totalSeconds >= 3600) {
          return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${
            minutes !== 1 ? 's' : ''
          } ${seconds} second${seconds !== 1 ? 's' : ''}`;
        } else if (totalSeconds >= 60) {
          return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
        } else {
          return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        }
      } else {
        return '0 seconds';
      }
    };
    const intervalId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [latitude, longitude, setTimeLeft]);
};

export default useTimeLeftEffect;
