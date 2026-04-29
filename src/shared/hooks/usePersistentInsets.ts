import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@tower_explorer/android_insets_v1';
const DEFAULT_ANDROID = { top: 20, bottom: 20 };

type Insets = { top: number; bottom: number };

export const usePersistentAndroidInsets = (): Insets => {
  const [insets, setInsets] = useState<Insets>(
    Platform.OS === 'android' ? DEFAULT_ANDROID : { top: 0, bottom: 0 },
  );

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Insets;
          if (
            typeof parsed?.top === 'number' &&
            typeof parsed?.bottom === 'number'
          ) {
            setInsets(parsed);
            return;
          }
        }
        await AsyncStorage.setItem(KEY, JSON.stringify(DEFAULT_ANDROID));
        setInsets(DEFAULT_ANDROID);
      } catch {
        setInsets(DEFAULT_ANDROID);
      }
    };
    load();
  }, []);

  return insets;
};
