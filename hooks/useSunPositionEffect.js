import { useEffect } from 'react';

const useSunPositionEffect = (
  sunPosition,
  appState,
  vitaminDProductionOccurred,
  setVitaminDProductionOccurred,
  setVitaminDMessage,
  setVitaminDColor,
  i18n
) => {
  useEffect(() => {
    if (sunPosition.altitude > 45 && !vitaminDProductionOccurred) {
      setVitaminDProductionOccurred(true);
    } else if (sunPosition.altitude <= 45 && vitaminDProductionOccurred) {
      setVitaminDProductionOccurred(false);
    }

    const messageKey = sunPosition.altitude > 45 ? 'vitaminDMessageYes' : 'vitaminDMessageNo';
    const message = i18n.t(messageKey);
    const color = vitaminDProductionOccurred ? 'gold' : 'gray';
    setVitaminDMessage(message);
    setVitaminDColor(color);
  }, [sunPosition, appState, vitaminDProductionOccurred, setVitaminDMessage, setVitaminDColor]);
};

export default useSunPositionEffect;
