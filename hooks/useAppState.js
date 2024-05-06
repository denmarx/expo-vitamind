import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

const useAppState = (setNextAppState) => {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      setNextAppState(nextAppState);
      setAppState(nextAppState);
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [setNextAppState]);

  return { appState };
};

export default useAppState;
