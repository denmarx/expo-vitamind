import { useFonts } from 'expo-font';

const useFontLoader = () => {
  const [fontsLoaded, fontError] = useFonts({
    Proxima: require('../assets/proxima-nova/Proxima-Nova-Regular.otf'),
  });
  return { fontsLoaded, fontError };
};

export default useFontLoader;
