import { createTheme } from '@mui/material/styles';
import { extendTheme } from '@mui/joy/styles';

// Primary color: #F14A52
const primaryColor = '#F14A52';

// Create color shades
const colorShades = {
  50: '#FFE5E8',   // Lightest shade, very transparent
  100: '#FFB3B9',  // Light shade
  200: '#FF8089',  // Slightly darker
  300: '#F14A52',  // Primary color
  400: '#D93C45',  // Darker shade
  500: '#C02E37',  // Even darker
  600: '#A7202A',  // Darkest shade
};

export const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          ...colorShades,
          mainChannel: primaryColor,
        },
      },
    },
    dark: {
      palette: {
        primary: {
          ...colorShades,
          mainChannel: primaryColor,
        },
      },
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: primaryColor,
          color: 'white',
          '&:hover': {
            backgroundColor: colorShades[400],
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderColor: primaryColor,
        },
      },
    },
  },
});

