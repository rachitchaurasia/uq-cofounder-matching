import { create } from "tailwind-rn";
import styles from "./tailwind.json";
import { Dimensions } from 'react-native';

const utilities = Object.entries(styles.styles).reduce((acc, [key, value]) => {
  acc[key] = { style: value };
  return acc;
}, {} as Record<string, { style: any }>);

const { width, height } = Dimensions.get('window');
const environment = {
  orientation: (width > height ? 'landscape' : 'portrait') as 'landscape' | 'portrait',
  colorScheme: 'light' as const,
  reduceMotion: false,
  width,
  height
};

const tailwind = create(utilities, environment);
export { tailwind };
