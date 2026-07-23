import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'dark',
  colors: {
    dark: [
      '#000000', // dark[0] - primary text color (black)
      '#171717', // dark[1] - lighter secondary text
      '#262626', // dark[2] - muted text
      '#525252', // dark[3] - disabled text
      '#737373', // dark[4] - borders/dividers
      '#a3a3a3', // dark[5] - hover states
      '#d4d4d4', // dark[6] - secondary backgrounds
      '#e9e9e9', // dark[7] - card backgrounds
      '#f5f5f5', // dark[8] - elevated surfaces
      '#ffffff', // dark[9] - primary background
    ],
  },
  fontFamily: '"Lora", Georgia, serif',
  headings: {
    fontFamily: '"Lora", Georgia, serif',
    fontWeight: '300',
  },
  defaultRadius: 'sm',
});
