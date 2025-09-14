import { createTheme } from '@mantine/core';

export const theme = createTheme({
  defaultRadius: 'md',
  fontFamily:
    '"Source Sans Pro", "Roboto", "Helvetica Neue", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  headings: {
    fontFamily:
      '"Source Sans Pro", "Roboto", "Helvetica Neue", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    fontWeight: '300',
    sizes: {
      h1: { fontSize: '3.5rem', lineHeight: '1.1' },
      h2: { fontSize: '2.5rem', lineHeight: '1.2' },
      h3: { fontSize: '2rem', lineHeight: '1.3' },
    },
  },
  colors: {
    // Elegant monochrome palette for photography
    dark: [
      '#f8f9fa', // 0 - lightest
      '#f1f3f4', // 1 - light background
      '#e9ecef', // 2 - subtle borders
      '#dee2e6', // 3 - borders
      '#ced4da', // 4 - disabled
      '#adb5bd', // 5 - placeholder
      '#6c757d', // 6 - secondary text
      '#495057', // 7 - primary text
      '#343a40', // 8 - dark text
      '#212529', // 9 - darkest
    ],
    // Subtle accent for interactive elements
    accent: [
      '#fafafa',
      '#f5f5f5',
      '#eeeeee',
      '#e0e0e0',
      '#bdbdbd',
      '#9e9e9e',
      '#757575',
      '#616161',
      '#424242',
      '#212121',
    ],
  },
  primaryColor: 'dark',
  primaryShade: 8,
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  breakpoints: {
    xs: '30em',
    sm: '48em',
    md: '64em',
    lg: '80em',
    xl: '90em',
  },
  components: {
    Button: {
      styles: {
        root: {
          borderRadius: '2px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: 300,
        },
      },
    },
    Text: {
      styles: {
        root: {
          lineHeight: 1.6,
        },
      },
    },
  },
});
