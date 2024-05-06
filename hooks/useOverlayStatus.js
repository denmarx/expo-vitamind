import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

const useOverlayStatus = (setShowOverlay) => {
  useEffect(() => {
    async function checkOverlayStatus() {
      try {
        const overlayStatus = await AsyncStorage.getItem('overlayShown');
        if (overlayStatus === null) {
          // Info overlay has not been shown yet
          setShowOverlay(true);
          // Mark overlay as shown
          await AsyncStorage.setItem('overlayShown', 'true');
        }
      } catch (error) {
        console.error('Error retrieving overlay status:', error);
      }
    }

    checkOverlayStatus();
  }, []);
};

export default useOverlayStatus;
