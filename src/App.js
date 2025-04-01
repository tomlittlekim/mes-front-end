import React from 'react';
import './App.css';
import { TabProvider } from './contexts/TabContext';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { DomainProvider } from './contexts/DomainContext';
import AppLayout from './components/Layout/AppLayout';
import Login from './components/Auth/Login';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useTheme } from './contexts/ThemeContext';
import { useDomain, DOMAINS } from './contexts/DomainContext';
import { 
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import ProfilePage from "./pages/ProfilePage";
import {ApolloProvider} from "@apollo/client";
import { client } from './apollo/client';

// MUI 테마 설정 컴포넌트
const ThemeConfigurator = ({ children }) => {
  const { theme } = useTheme();
  const { domain } = useDomain();
  
  // 도메인별 색상 설정
  const getPrimaryColor = () => {
    if (domain === DOMAINS.PEMS) {
      return theme === 'dark' ? '#e67e22' : '#d35400';
    }
    return '#1976d2'; // IMOS 기본 색상
  };
  
  const getBackgroundColor = () => {
    if (domain === DOMAINS.PEMS) {
      return theme === 'dark' ? '#1c1207' : '#fcf8f4';
    }
    return theme === 'dark' ? '#0c1929' : '#f5f5f5'; // IMOS 색상
  };
  
  const getCardColor = () => {
    if (domain === DOMAINS.PEMS) {
      return theme === 'dark' ? '#2d1e0f' : '#ffffff';
    }
    return theme === 'dark' ? '#102a43' : '#ffffff'; // IMOS 색상
  };
  
  const getTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return theme === 'dark' ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
    }
    return theme === 'dark' ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)'; // IMOS 색상
  };
  
  // MUI 테마 생성
  const muiTheme = createTheme({
    palette: {
      mode: theme === 'dark' ? 'dark' : 'light',
      primary: {
        main: getPrimaryColor(),
      },
      background: {
        default: getBackgroundColor(),
        paper: getCardColor(),
      },
      text: {
        primary: getTextColor(),
      },
      ...(domain === DOMAINS.PEMS && {
        success: {
          main: theme === 'dark' ? '#66bb6a' : '#388e3c',
        },
        error: {
          main: theme === 'dark' ? '#f44336' : '#d32f2f',
        },
        warning: {
          main: theme === 'dark' ? '#ffb74d' : '#f57c00',
        },
      }),
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: getBackgroundColor(),
            color: getTextColor(),
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            borderColor: domain === DOMAINS.PEMS 
              ? (theme === 'dark' ? '#3d2814' : '#f5e8d7')
              : (theme === 'dark' ? '#1e2430' : '#e2e8f0'),
          },
          columnHeader: {
            backgroundColor: domain === DOMAINS.PEMS
              ? (theme === 'dark' ? '#3d2814' : '#f5e8d7')
              : (theme === 'dark' ? '#1a365d' : '#f0f4f9'),
          },
          selectedRowCount: {
            zIndex: 100,
            position: 'static',
            fontWeight: 500,
            backgroundColor: 'inherit'
          },
          footerContainer: {
            zIndex: 90,
            position: 'relative',
            backgroundColor: 'inherit'
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: getCardColor(),
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

// function App() {
//   // localStorage에서 인증 상태 확인
//   const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
//
//   return (
//     <DomainProvider>
//       <CustomThemeProvider>
//         <ThemeConfigurator>
//           <TabProvider>
//             <BrowserRouter>
//               <Routes>
//                 <Route path="/login" element={
//                   !isAuthenticated ? <Login /> : <Navigate to="/" />
//                 } />
//                 <Route path="/profile" element={
//                   isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />
//                 } />
//                 <Route path="/*" element={
//                   isAuthenticated ? <AppLayout /> : <Navigate to="/login" />
//                 } />
//               </Routes>
//             </BrowserRouter>
//           </TabProvider>
//         </ThemeConfigurator>
//       </CustomThemeProvider>
//     </DomainProvider>
//   );
// }

function App() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return (
      <ApolloProvider client={client}>
        <DomainProvider>
          <CustomThemeProvider>
            <ThemeConfigurator>
              <TabProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={
                      !isAuthenticated ? <Login /> : <Navigate to="/" />
                    } />
                    <Route path="/profile" element={
                      isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />
                    } />
                    <Route path="/*" element={
                      isAuthenticated ? <AppLayout /> : <Navigate to="/login" />
                    } />
                  </Routes>
                </BrowserRouter>
              </TabProvider>
            </ThemeConfigurator>
          </CustomThemeProvider>
        </DomainProvider>
      </ApolloProvider>
  );
}
export default App;