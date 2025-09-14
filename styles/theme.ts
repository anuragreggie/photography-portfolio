import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'dark',
  colors: {
    dark: [
      '#fafafa', // dark[0] - primary text color (off-white)
      '#e9e9e9', // dark[1] - lighter secondary text
      '#d4d4d4', // dark[2] - muted text
      '#a3a3a3', // dark[3] - disabled text
      '#737373', // dark[4] - borders/dividers
      '#525252', // dark[5] - hover states
      '#404040', // dark[6] - secondary backgrounds
      '#262626', // dark[7] - card backgrounds
      '#171717', // dark[8] - elevated surfaces
      '#000000', // dark[9] - primary background (black)
    ],
  },
  fontFamily: '"Lora", Georgia, serif',
  headings: {
    fontFamily: '"Lora", Georgia, serif',
    fontWeight: '300',
  },
  defaultRadius: 'sm',
});
