// Basics
import { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, AppState, Button, Platform } from 'react-native';
import { i18n } from './locales/translation';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Localization from 'expo-localization';
import * as SplashScreen from 'expo-splash-screen';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
// Components
import SunPosition from './components/SunPosition';
import AltitudeAndHourlyScale from './components/AltitudeAndHourlyScale';
import InfoOverlay from './components/InfoOverlay';
// Hooks
import { useSunPositionCalculator } from './hooks/sunPositionCalculator';
import useOverlayStatus from './hooks/useOverlayStatus';
import useAppState from './hooks/useAppState';
import useFontLoader from './hooks/useFontLoader';
import useSunPositionEffect from './hooks/useSunPositionEffect';
import useTimeLeftEffect from './hooks/useTimeLeftEffect';

SplashScreen.preventAutoHideAsync();

// Set the notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [nextAppState, setNextAppState] = useState(AppState.currentState);

  const { appState } = useAppState(setNextAppState);
  const { fontsLoaded, fontError } = useFontLoader();
  const { sunPosition, error, latitude, longitude, sunrise, sunset } = useSunPositionCalculator(nextAppState);
  const [vitaminDProductionOccurred, setVitaminDProductionOccurred] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [vitaminDMessage, setVitaminDMessage] = useState('');
  const [vitaminDColor, setVitaminDColor] = useState('gray');
  // Set the locale to the device's locale
  i18n.locale = Localization.getLocales()[0].languageCode;
  // Notification functions
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  // const BACKGROUND_TASK_NAME = 'updateSunPositionTask';

  // defines the background tasks to fetch current sun position, logs it or errors and returns success or failure
  // TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  //   const { sunPosition, error } = useSunPositionCalculator();
  //   if (error) {
  //     console.log('Error fetching sun position: ', error);
  //     return TaskManager.TaskResult.Failure;
  //   }
  //   console.log('sunPosition: ', sunPosition);
  //   return TaskManager.TaskResult.Success;
  // });

  // Register the background task
  // useEffect(() => {
  //   registerBackgroundTask();
  // }, []);

  // Function to register the background task every 10 min to updated sun position
  // const registerBackgroundTask = async () => {
  //   if (!(await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME))) {
  //     await TaskManager.registerTaskAsync(BACKGROUND_TASK_NAME, {
  //       minimumInterval: 600, // 10 minutes
  //       stopOnTerminate: false,
  //       startOnBott: true,
  //     });
  //   }
  // };

  // Check if the user wants to see the overlay
  useOverlayStatus(setShowOverlay);

  // Check if the user is getting Vitamin D
  useSunPositionEffect(
    sunPosition,
    appState,
    vitaminDProductionOccurred,
    setVitaminDProductionOccurred,
    setVitaminDMessage,
    setVitaminDColor,
    i18n
  );

  // Notification Listener: calls the register method to register device and get the push token data
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token));

    // listen for notifications received while app is in foreground and stores in state
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // listens for user interaction with notification (like tapping) and logs response
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    // Cleanup when components unmounts to prevent memory leaks
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Check if the sun's altitude has reached 45 degrees and sends notification when it's not been sent
  useEffect(() => {
    if (sunPosition.altitude >= 45 && !notificationSent) {
      setNotificationSent(true);
      sendNotification();
    }
  }, [sunPosition, notificationSent]);

  // schedules a local notification 
  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Sun is high enough for Vitamin D production! 🌞',
        body: 'Time to enjoy the sunlight.',
      },
      // shows notification immediately
      trigger: null,
    });
  };

  // Registers Device to receive push notifications
  async function registerForPushNotificationsAsync() {
    let token;

    // Check if device is physical
    if (!Device.isDevice) {
      alert('Must use physical device for Push Notifications');
      return;
    }

    // Get the existing permission status for notifications
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If the permission is not granted, request it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    // If the final status is granted, retrieve the expo push token and store it in state
    token = (await Notifications.getExpoPushTokenAsync()).data;
    setExpoPushToken(token);
    console.log(token);

    // For android, set up notifications with specific settings
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  // Calculate the time left until the sun reaches 45 degrees
  useTimeLeftEffect(latitude, longitude, setTimeLeft);

  // Hide the splash screen when the root view has been laid out
  const handleOverlayClose = () => {
    setShowOverlay(false);
  };
  // Show the overlay again
  const handleShowOverlayAgain = () => {
    setShowOverlay(true);
  };

  // Hide the splash screen when the root view has been laid out
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // If fonts are not loaded yet, return null
  if (!fontsLoaded && !fontError) {
    return null;
  }
  // If there is an error, display the error message
  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
        <StatusBar style='auto' />
      </View>
    );
  }

  // Uncomment to trigger localization change on devices which use english as default
  // i18n.locale = 'en';
  return (
    <View style={styles.container}>
      <StatusBar style="auto"/>
      <LinearGradient colors={['#87ceeb', '#57b6de']} style={styles.upperHalf}>
        <View style={styles.overlayContainer}>
          <Button title='?' onPress={handleShowOverlayAgain} color='#253941' />
        </View>
        <AltitudeAndHourlyScale sunrise={sunrise.getHours()} sunset={Math.floor(sunset.getHours())} />
        <SunPosition sunPositionX={sunPosition.x} sunPositionY={sunPosition.y} />
      </LinearGradient>

      <View style={styles.lowerHalf} onLayout={onLayoutRootView}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        </View>
        <Ionicons
          name='sunny'
          size={50}
          color={vitaminDProductionOccurred ? vitaminDColor : 'gray'}
          style={{ marginBottom: 20 }}
        />
        <Text style={{ fontFamily: 'Proxima', fontSize: 25 }}>{vitaminDMessage} </Text>
        <Text style={{ fontFamily: 'Proxima', fontSize: 15 }}>Time until sun reaches 45 degrees: {timeLeft}</Text>
      </View>

      <InfoOverlay visible={showOverlay} onClose={handleOverlayClose} i18n={i18n} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87ceeb',
  },
  upperHalf: {
    flex: 0.5,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  lowerHalf: {
    flex: 0.5,
    width: '100%',
    backgroundColor: '#FFEBCD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContainer: {
    position: 'absolute',
    top: 10,
    right: 0,
    padding: 20,
    borderRadius: 25,
  },
});
