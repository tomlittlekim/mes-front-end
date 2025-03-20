import React from 'react';
import './App.css';
import { TabProvider } from './contexts/TabContext';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { DomainProvider } from './contexts/DomainContext';
import AppLayout from './components/Layout/AppLayout';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useTheme } from './contexts/ThemeContext';

// MUI 테마 설정 컴포넌트
const ThemeConfigurator = ({ children }) => {
  const { theme } = useTheme();
  
  // MUI 테마 생성
  const muiTheme = createTheme({
    palette: {
      mode: theme === 'dark' ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      background: {
        default: theme === 'dark' ? '#0c1929' : '#f5f5f5',
        paper: theme === 'dark' ? '#102a43' : '#ffffff',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: theme === 'dark' ? '#0c1929' : '#f5f5f5',
            color: theme === 'dark' ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)',
          },
        },
      },
    },
  });

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <DomainProvider>
      <CustomThemeProvider>
        <ThemeConfigurator>
          <TabProvider>
            <div className="App">
              <AppLayout />
            </div>
          </TabProvider>
        </ThemeConfigurator>
      </CustomThemeProvider>
    </DomainProvider>
  );
}

export default App;