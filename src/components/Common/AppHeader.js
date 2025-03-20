import React, { memo, useCallback } from 'react';
import './AppHeader.css';
import { useTheme } from '../../contexts/ThemeContext';
import { useTabs } from '../../contexts/TabContext';
import { Tabs, Tab, Box, IconButton, Tooltip, useTheme as useMuiTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloseAllIcon from '@mui/icons-material/ClearAll';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// 탭 레이블 컴포넌트를 memo로 최적화
const TabLabel = memo(({ tabId, tabName, onClose }) => {
  // 탭 아이콘 정보 가져오기 함수
  const getTabIcon = (id) => {
    // 메인 탭인 경우
    if (id === 'main') return '🏠';
    
    // ID로 메뉴 그룹 식별하기
    const idParts = id.split('-');
    if (idParts.length > 0) {
      const groupId = idParts[0];
      
      switch(groupId) {
        case 'ci': return 'ℹ️'; // 기준정보관리
        case 'pi': return '📋'; // 품목정보관리
        case 'sm': return '💼'; // 영업관리
        case 'mi': return '📦'; // 자재/재고관리
        case 'pm': return '🏭'; // 생산관리
        case 'mo': return '📊'; // 모니터링
        case 'rp': return '📝'; // 리포트
        case 'sy': return '⚙️'; // 시스템
        default: return '📄'; // 기본 아이콘
      }
    }
    
    return '📄'; // 기본 아이콘
  };

  return (
    <div className="tab-label">
      <span className="tab-icon">{getTabIcon(tabId)}</span>
      <span>{tabName}</span>
      {tabId !== 'main' && (
        <CloseIcon 
          className="tab-close-btn"
          fontSize="small"
          onClick={onClose}
        />
      )}
    </div>
  );
});

const AppHeader = () => {
  const { theme, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const { tabs, activeTab, closeTab, setActiveTab, closeAllTabs } = useTabs();
  
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, [setActiveTab]);
  
  const handleTabClose = useCallback((e, tabId) => {
    e.stopPropagation();
    closeTab(tabId);
  }, [closeTab]);

  return (
    <div className="app-header" style={{ 
      backgroundColor: muiTheme.palette.background.paper,
      color: muiTheme.palette.text.primary,
      borderBottom: `1px solid ${muiTheme.palette.divider}`
    }}>
      <div className="header-tabs">
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            className="tab-header"
            aria-label="application tabs"
            sx={{ flexGrow: 1 }}
          >
            {tabs.map(tab => (
              <Tab 
                key={tab.id} 
                value={tab.id} 
                label={
                  <TabLabel 
                    tabId={tab.id} 
                    tabName={tab.name} 
                    onClose={(e) => handleTabClose(e, tab.id)}
                  />
                } 
              />
            ))}
          </Tabs>
          <Tooltip title="모든 탭 닫기">
            <IconButton 
              onClick={closeAllTabs} 
              className="close-all-tabs-btn"
              size="small"
              aria-label="모든 탭 닫기"
            >
              <CloseAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </div>
      <div className="header-actions">
        <Tooltip title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}>
          <IconButton
            className="theme-toggle"
            onClick={toggleTheme}
            size="small"
            color="inherit"
            aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
            sx={{ 
              ml: 1, 
              border: `1px solid ${muiTheme.palette.divider}`,
              borderRadius: '50%',
              padding: '5px',
              transition: 'all 0.3s ease'
            }}
          >
            {theme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
        </Tooltip>
        <div className="user-profile">
          <div className="avatar" style={{ 
            backgroundColor: theme === 'dark' ? '#2d4764' : '#e0e0e0',
            color: theme === 'dark' ? '#ffffff' : '#000000'
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default memo(AppHeader);