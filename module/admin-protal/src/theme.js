import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#e67e22',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            // backgroundColor: 'blue',
            color: 'white'
          },
        },
        text: {
          '&:hover': {
            color: 'white',
            boxShadow: 'none',
            borderBottom: '2px solid #fff',
            borderRadius: 0
          },
        },
        containedSecondary: {
          color: 'white', // Set text color for text secondary button
        },
      },
    },
  },
});

export default theme;
