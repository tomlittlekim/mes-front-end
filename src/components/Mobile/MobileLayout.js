import React, { useState, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Container,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Inventory as InventoryIcon,
  ListAlt as ListAltIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { useTabs } from '../../contexts/TabContext';
import useLocalStorageVO from "../../components/Common/UseLocalStorageVO";
import Swal from 'sweetalert2';
import './MobileLayout.css';

const MobileLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const { domain, domainName } = useDomain();
  const { theme: themeMode, toggleTheme } = useCustomTheme();
  const { openTab } = useTabs();
  const isDarkMode = theme.palette.mode === 'dark';
  const { logout } = useLocalStorageVO();

  // 도메인별 색상 설정
  const getAccentColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#e67e22' : '#d35400';
    }
    return isDarkMode ? '#1976d2' : '#0a2351';
  };

  const handleMenuOpen = () => {
    setDrawerOpen(true);
  };

  const handleMenuClose = () => {
    setDrawerOpen(false);
  };

  const handleMenuItemClick = (id) => {
    // 'home' 메뉴 클릭 시
    if (id === 'home') {
      openTab({ id: 'main', name: '메인' });
    }
    // '제품 관리' 메뉴 클릭 시
    else if (id === 'product-management') {
      openTab({ id: 'pi-product', name: '제품관리', group: 'pi' });
    }
    // '생산실적' 메뉴 클릭 시
    else if (id === 'production-result') {
      // 개발 중 알림
      Swal.fire({
        title: '알림',
        text: '개발 중인 메뉴입니다.',
        icon: 'info',
        confirmButtonColor: getAccentColor(),
        confirmButtonText: '확인'
      });
    }

    setDrawerOpen(false);
  };

  // 로그아웃 핸들러
  const handleLogout = useCallback(() => {
    setDrawerOpen(false); // 메뉴 닫기

    Swal.fire({
      title: '로그아웃',
      text: '정말 로그아웃 하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: theme.palette.primary.main,
      cancelButtonColor: theme.palette.grey[500],
      confirmButtonText: '로그아웃',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  }, [theme.palette.primary.main, theme.palette.grey, logout]);

  return (
      <Box className="mobile-layout">
        <AppBar position="static" className="mobile-app-bar" sx={{
          backgroundColor: getAccentColor(),
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          height: '64px'
        }}>
          <Toolbar sx={{ height: '100%' }}>
            <IconButton
                size="medium"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 1.5 }}
                onClick={handleMenuOpen}
            >
              <MenuIcon sx={{ fontSize: '1.6rem' }} />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {domainName}
            </Typography>
            <IconButton color="inherit" onClick={toggleTheme} size="medium">
              {isDarkMode ?
                  <Brightness7Icon sx={{ fontSize: '1.6rem' }} /> :
                  <Brightness4Icon sx={{ fontSize: '1.6rem' }} />
              }
            </IconButton>
          </Toolbar>
        </AppBar>

        <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={handleMenuClose}
            sx={{
              '& .MuiDrawer-paper': {
                width: 260,
                backgroundColor: theme.palette.background.default,
              },
            }}
        >
          <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
          >
            <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
            >
              <Typography variant="h6" color={getAccentColor()} fontWeight="bold">
                {domainName}
              </Typography>
              <IconButton onClick={handleMenuClose} size="medium">
                <ArrowBackIcon sx={{ fontSize: '1.6rem' }} />
              </IconButton>
            </Box>

            <List component="nav" sx={{ flex: 1 }}>
              <ListItem button onClick={() => handleMenuItemClick('home')} sx={{ py: 2 }}>
                <ListItemIcon>
                  <HomeIcon sx={{ color: getAccentColor(), fontSize: '1.6rem' }} />
                </ListItemIcon>
                <ListItemText
                    primary="홈"
                    primaryTypographyProps={{
                      fontSize: '1.1rem',
                      fontWeight: 500
                    }}
                />
              </ListItem>

              <Divider sx={{ my: 1 }} />

              <ListItem button onClick={() => handleMenuItemClick('product-management')} sx={{ py: 2 }}>
                <ListItemIcon>
                  <InventoryIcon sx={{ color: getAccentColor(), fontSize: '1.6rem' }} />
                </ListItemIcon>
                <ListItemText
                    primary="제품 관리"
                    primaryTypographyProps={{
                      fontSize: '1.1rem',
                      fontWeight: 500
                    }}
                />
              </ListItem>

              <ListItem button onClick={() => handleMenuItemClick('production-result')} sx={{ py: 2 }}>
                <ListItemIcon>
                  <ListAltIcon sx={{ color: getAccentColor(), fontSize: '1.6rem' }} />
                </ListItemIcon>
                <ListItemText
                    primary="생산실적"
                    primaryTypographyProps={{
                      fontSize: '1.1rem',
                      fontWeight: 500
                    }}
                />
              </ListItem>
            </List>

            <Divider />

            <List>
              <ListItem button onClick={handleLogout} sx={{ py: 2 }}>
                <ListItemIcon>
                  <ExitToAppIcon sx={{ fontSize: '1.6rem', color: theme.palette.error.main }} />
                </ListItemIcon>
                <ListItemText
                    primary="로그아웃"
                    primaryTypographyProps={{
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      color: theme.palette.error.main
                    }}
                />
              </ListItem>
            </List>
          </Box>
        </Drawer>

        <Container sx={{
          py: 2,
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {children}
        </Container>
      </Box>
  );
};

export default MobileLayout;