import { useEffect, useRef, useState, useCallback } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

// Configure how notifications appear when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) setExpoPushToken(token);
    });

    // Listen for notifications received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {
        // Notification received in foreground — handled by the handler above
      });

    // Listen for user tapping a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(() => {
        // Could navigate to relevant screen here
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const scheduleWorkoutReminder = useCallback(
    async (hour: number, minute: number) => {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to train!",
          body: "Don't break your streak — hit a workout or run today.",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    },
    [],
  );

  const scheduleRunComplete = useCallback(
    async (distance: string, duration: string) => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Run Complete!",
          body: `Great run — ${distance} mi in ${duration}`,
          sound: true,
        },
        trigger: null, // immediate
      });
    },
    [],
  );

  const scheduleWorkoutComplete = useCallback(
    async (name: string, durationMin: number) => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Workout Complete!",
          body: `Crushed ${name} in ${durationMin} min`,
          sound: true,
        },
        trigger: null, // immediate
      });
    },
    [],
  );

  const cancelAll = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  return {
    expoPushToken,
    scheduleWorkoutReminder,
    scheduleRunComplete,
    scheduleWorkoutComplete,
    cancelAll,
  };
}

async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}
