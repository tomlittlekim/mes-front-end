import React, { useState } from 'react';
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
import './MobileLayout.css';

const MobileLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const { domain, domainName } = useDomain();
  const { theme: themeMode, toggleTheme } = useCustomTheme();
  const { openTab } = useTabs();
  const isDarkMode = theme.palette.mode === 'dark';

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
    // '생산실적등록' 메뉴 클릭 시
    else if (id === 'production-result') {
      openTab({ id: 'mm-result-in', name: '생산실적등록', group: 'pm' });
    }

    setDrawerOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
  };

  return (
    <Box className="mobile-layout">
      <AppBar position="static" className="mobile-app-bar" sx={{ 
        backgroundColor: getAccentColor(),
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {domainName}
          </Typography>
          <IconButton color="inherit" onClick={toggleTheme}>
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleMenuClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
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
            <IconButton onClick={handleMenuClose}>
              <ArrowBackIcon />
            </IconButton>
          </Box>

          <List component="nav" sx={{ flex: 1 }}>
            <ListItem button onClick={() => handleMenuItemClick('home')}>
              <ListItemIcon>
                <HomeIcon sx={{ color: getAccentColor() }} />
              </ListItemIcon>
              <ListItemText primary="홈" />
            </ListItem>
            
            <Divider sx={{ my: 1 }} />
            
            <ListItem button onClick={() => handleMenuItemClick('product-management')}>
              <ListItemIcon>
                <InventoryIcon sx={{ color: getAccentColor() }} />
              </ListItemIcon>
              <ListItemText primary="제품 관리" />
            </ListItem>
            
            <ListItem button onClick={() => handleMenuItemClick('production-result')}>
              <ListItemIcon>
                <ListAltIcon sx={{ color: getAccentColor() }} />
              </ListItemIcon>
              <ListItemText primary="생산실적등록" />
            </ListItem>
          </List>

          <Divider />
          
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="로그아웃" />
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