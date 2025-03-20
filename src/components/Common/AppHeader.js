import React, { memo, useCallback } from 'react';
import './AppHeader.css';
import { useTheme } from '../../contexts/ThemeContext';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import { useTabs } from '../../contexts/TabContext';
import { Box, IconButton, Tooltip, useTheme as useMuiTheme, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloseAllIcon from '@mui/icons-material/ClearAll';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DomainIcon from '@mui/icons-material/DomainVerification';

// 탭 레이블 컴포넌트를 memo로 최적화
const TabLabel = memo(({ tabId, tabName, onClose, isActive }) => {
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
    <div className={`tab-label ${isActive ? 'active' : ''}`}>
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
  const { activeTab, closeAllTabs, closeTab, tabs, setActiveTab } = useTabs();
  const { theme, toggleTheme } = useTheme();
  const { domain, toggleDomain } = useDomain();
  const muiTheme = useMuiTheme();

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, [setActiveTab]);

  const handleCloseTab = useCallback((e, tabId) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지
    closeTab(tabId);
  }, [closeTab]);

  const handleCloseAllTabs = useCallback(() => {
    closeAllTabs();
  }, [closeAllTabs]);

  return (
    <div className="app-header">
      <Box sx={{ 
        width: '100%',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="tabs-container">
          {tabs && tabs.length > 0 && (
            <div className="tab-wrapper">
              <div className="custom-tabs">
                {tabs.map((tab) => (
                  <div 
                    key={tab.id} 
                    className={`custom-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    <TabLabel 
                      tabId={tab.id} 
                      tabName={tab.name} 
                      onClose={(e) => handleCloseTab(e, tab.id)}
                      isActive={activeTab === tab.id}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <Divider orientation="vertical" flexItem className="header-divider" />
        
        <div className="header-actions">
          {tabs && tabs.length > 1 && (
            <Tooltip title="모든 탭 닫기">
              <IconButton 
                onClick={handleCloseAllTabs} 
                size="small" 
                className="header-action-button"
              >
                <CloseAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title={`${theme === 'dark' ? '라이트' : '다크'} 모드로 전환`}>
            <IconButton 
              onClick={toggleTheme} 
              size="small"
              color="inherit"
              className="header-action-button"
            >
              {theme === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title={`${domain === DOMAINS.IMOS ? 'PEMS' : 'iMOS'} 도메인으로 전환`}>
            <IconButton 
              onClick={toggleDomain} 
              size="small"
              color="inherit"
              className="header-action-button"
            >
              <DomainIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </Box>
    </div>
  );
};

export default AppHeader;