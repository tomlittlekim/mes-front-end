import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
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
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

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
        case 'mm': return '🏭'; // 생산관리
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
  
  // 탭 컨테이너 ref
  const tabsContainerRef = useRef(null);
  // 스크롤 버튼 표시 여부
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

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
  
  // 스크롤 체크 함수
  const checkScroll = useCallback(() => {
    if (tabsContainerRef.current) {
      const container = tabsContainerRef.current;
      const hasLeftScroll = container.scrollLeft > 0;
      const hasRightScroll = container.scrollWidth > container.clientWidth && 
                             container.scrollLeft < container.scrollWidth - container.clientWidth;
      
      setShowLeftScroll(hasLeftScroll);
      setShowRightScroll(hasRightScroll);
    }
  }, []);
  
  // 스크롤 버튼 클릭 핸들러
  const handleScrollLeft = useCallback(() => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }, []);
  
  const handleScrollRight = useCallback(() => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);
  
  // 활성 탭으로 스크롤 이동
  const scrollToActiveTab = useCallback(() => {
    if (tabsContainerRef.current && activeTab) {
      const container = tabsContainerRef.current;
      const activeTabElement = container.querySelector(`.custom-tab.active`);
      
      if (activeTabElement) {
        // 활성 탭의 중앙으로 스크롤
        const containerWidth = container.clientWidth;
        const tabWidth = activeTabElement.offsetWidth;
        const tabLeft = activeTabElement.offsetLeft;
        
        const scrollTo = tabLeft - (containerWidth / 2) + (tabWidth / 2);
        container.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    }
  }, [activeTab]);
  
  // 탭 변경 감지 및 스크롤 체크
  useEffect(() => {
    // 활성 탭으로 스크롤
    scrollToActiveTab();
    
    // 약간의 딜레이 후 스크롤 버튼 가시성 업데이트
    const timer = setTimeout(() => {
      checkScroll();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [activeTab, tabs, scrollToActiveTab, checkScroll]);
  
  // 스크롤 이벤트 리스너
  useEffect(() => {
    const container = tabsContainerRef.current;
    if (container) {
      const handleScrollEvent = () => {
        checkScroll();
      };
      
      container.addEventListener('scroll', handleScrollEvent);
      window.addEventListener('resize', handleScrollEvent);
      
      // 초기 스크롤 체크
      checkScroll();
      
      return () => {
        container.removeEventListener('scroll', handleScrollEvent);
        window.removeEventListener('resize', handleScrollEvent);
      };
    }
  }, [checkScroll]);

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
              {/* 왼쪽 스크롤 버튼 */}
              <div 
                className={`tab-scroll-buttons left ${showLeftScroll ? 'visible' : ''}`}
                onClick={handleScrollLeft}
              >
                <KeyboardArrowLeftIcon fontSize="small" />
              </div>
              
              <div 
                className="custom-tabs"
                ref={tabsContainerRef}
              >
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
              
              {/* 오른쪽 스크롤 버튼 */}
              <div 
                className={`tab-scroll-buttons right ${showRightScroll ? 'visible' : ''}`}
                onClick={handleScrollRight}
              >
                <KeyboardArrowRightIcon fontSize="small" />
              </div>
            </div>
          )}
        </div>
        
        <Divider orientation="vertical" flexItem className="header-divider" />
        
        <div className="header-actions">
          <Tooltip title="모든 탭 닫기">
            <IconButton 
              onClick={handleCloseAllTabs} 
              size="small" 
              className="header-action-button"
              disabled={tabs.length <= 1}
            >
              <CloseAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
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