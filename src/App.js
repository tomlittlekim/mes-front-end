import React, { useState, useEffect } from 'react';
import './App.css';
import { TabProvider } from './contexts/TabContext';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { DomainProvider } from './contexts/DomainContext';
import { SidebarProvider } from './contexts/SidebarContext';
import AppLayout from './components/Layout/AppLayout';
import Login from './components/Auth/Login';
import MobileAppContainer from './components/Mobile/MobileAppContainer';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { useTheme } from './contexts/ThemeContext';
import { useDomain, DOMAINS } from './contexts/DomainContext';
import { 
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import {ApolloProvider} from "@apollo/client";
import { client } from './apollo/client';
import Profile from "./components/Auth/Profile";

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

// 모바일 기기 감지 컴포넌트
const DeviceDetector = ({ children }) => {
  // 테마 객체 생성 (미디어 쿼리 사용을 위함)
  const defaultTheme = createTheme();

  // 미디어 쿼리로 모바일/태블릿 감지
  const isMobile = useMediaQuery(defaultTheme.breakpoints.down('sm')); // 600px 이하
  const isTablet = useMediaQuery(defaultTheme.breakpoints.between('sm', 'md')); // 600px ~ 960px

  // 모바일 또는 태블릿이면 true
  const isMobileOrTablet = isMobile || isTablet;

  // URL에서 강제 뷰 모드 체크 (개발용)
  const [forceMode, setForceMode] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewMode = params.get('view');

    if (viewMode === 'mobile') {
      setForceMode('mobile');
    } else if (viewMode === 'desktop') {
      setForceMode('desktop');
    } else {
      setForceMode(null);
    }
  }, []);

  // 최종 디바이스 결정 (URL 파라미터 우선)
  const finalIsMobile = forceMode === 'mobile' || (forceMode !== 'desktop' && isMobileOrTablet);

  // 클래스로 바디에 모바일 여부 표시
  useEffect(() => {
    if (finalIsMobile) {
      document.body.classList.add('mobile-view');
    } else {
      document.body.classList.remove('mobile-view');
    }

    return () => {
      document.body.classList.remove('mobile-view');
    };
  }, [finalIsMobile]);

  // children에 isMobile 속성 추가하여 전달
  return React.cloneElement(children, { isMobile: finalIsMobile });
};

// 앱 레이아웃 선택 컴포넌트
const AppContainer = ({ isMobile }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            !isAuthenticated ? <Login /> : <Navigate to="/" />
          } />
          <Route path="/profile" element={
            isAuthenticated ? <Profile /> : <Navigate to="/login" />
          } />
          <Route path="/*" element={
            isAuthenticated
                ? (isMobile ? <MobileAppContainer /> : <AppLayout />)
                : <Navigate to="/login" />
          } />
        </Routes>
      </BrowserRouter>
  );
};

function App() {
  return (
      <ApolloProvider client={client}>
        <DomainProvider>
          <CustomThemeProvider>
            <ThemeConfigurator>
              <TabProvider>
                <SidebarProvider>
                  <DeviceDetector>
                    <AppContainer />
                  </DeviceDetector>
                </SidebarProvider>
              </TabProvider>
            </ThemeConfigurator>
          </CustomThemeProvider>
        </DomainProvider>
      </ApolloProvider>
  );
}

export default App;