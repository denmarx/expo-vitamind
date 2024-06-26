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
  const BACKGROUND_TASK_NAME = 'updateSunPositionTask';

  TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
    const { sunPosition, error } = useSunPositionCalculator();

    if (error) {
      console.log('Error fetching sun position: ', error);
      return TaskManager.TaskResult.Failure;
    }
    console.log('sunPosition: ', sunPosition);

    return TaskManager.TaskResult.Success;
  });

  // Register the background task
  useEffect(() => {
    registerBackgroundTask();
  }, []);

  // Function to register the background task
  const registerBackgroundTask = async () => {
    if (!(await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME))) {
      TaskManager.unregisterTaskAsync(BACKGROUND_TASK_NAME, {
        frequency: 600 * 1000, // 10 minutes
      });
    }
  };

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

  // Schedule a notification
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Check if the sun's altitude has reached 45 degrees
  useEffect(() => {
    if (sunPosition.altitude >= 45 && !notificationSent) {
      setNotificationSent(true);
      sendNotification();
    }
  }, [sunPosition, notificationSent]);

  const sendNotification = async () => {
    await schedulePushNotification();
  };

  async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Sun is high enough for Vitamin D production! 🌞',
        body: 'Time to enjoy the sunlight.',
        data: { data: 'goes here' },
      },
      trigger: null,
    });
  }

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync({ projectId: 'your-project-id' })).data;
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
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

  i18n.locale = 'en';
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#87ceeb', '#57b6de']} style={styles.upperHalf}>
        <View style={styles.overlayContainer}>
          <Button title='?' onPress={handleShowOverlayAgain} color='#253941' />
        </View>
        <AltitudeAndHourlyScale sunrise={sunrise.getHours()} sunset={Math.floor(sunset.getHours())} />
        <SunPosition sunPositionX={sunPosition.x} sunPositionY={sunPosition.y} />
      </LinearGradient>

      <View style={styles.lowerHalf} onLayout={onLayoutRootView}>
        {/* <Text>Your expo push token: {expoPushToken}</Text> */}
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text>Title: {notification && notification.request.content.title} </Text>
          {/* <Text>Body: {notification && notification.request.content.body}</Text> */}
          {/* <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text> */}
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
      {/* <Button
        title='Press to schedule a notification'
        onPress={async () => {
          await schedulePushNotification();
        }}
      /> */}
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
