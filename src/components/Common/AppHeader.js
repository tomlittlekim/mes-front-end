import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import './AppHeader.css';
import { useTheme } from '../../contexts/ThemeContext';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import { useTabs } from '../../contexts/TabContext';
import {
  Box,
  IconButton,
  Tooltip,
  useTheme as useMuiTheme,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloseAllIcon from '@mui/icons-material/ClearAll';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DomainIcon from '@mui/icons-material/DomainVerification';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import Swal from 'sweetalert2';
import SyncIcon from '@mui/icons-material/Sync';
import {useNavigate} from "react-router-dom";
import useLocalStorageVO from "./UseLocalStorageVO";

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

const AppHeader = (props) => {
  const navigate = useNavigate();
  const { activeTab, closeAllTabs, closeTab, tabs, setActiveTab } = useTabs();
  const { theme, toggleTheme } = useTheme();
  const { domain, toggleDomain, nginxEnv, domainName } = useDomain();
  const muiTheme = useMuiTheme();
  const { logout } = useLocalStorageVO();
  
  // 사용자 메뉴 상태
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const userMenuOpen = Boolean(userMenuAnchor);

  // 현재 로그인한 사용자 정보
  const username = localStorage.getItem('username') || '사용자';

  // 탭 컨테이너 ref
  const tabsContainerRef = useRef(null);
  // 스크롤 버튼 표시 여부
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  // 사용자 메뉴 열기
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  // 사용자 메뉴 닫기
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  //내 프로필로 이동 핸들러
  const handleProfileClick = () => {
    handleUserMenuClose();
    navigate('/profile');
  };

  // 로그아웃 핸들러
  const handleLogout = useCallback(() => {
    handleUserMenuClose(); // 메뉴 닫기

    Swal.fire({
      title: '로그아웃',
      text: '정말 로그아웃 하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: muiTheme.palette.primary.main,
      cancelButtonColor: muiTheme.palette.grey[500],
      confirmButtonText: '로그아웃',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        logout()
      }
    });
  }, [muiTheme.palette.primary.main, muiTheme.palette.grey]);

  // 도메인 전환 핸들러
  const handleDomainToggle = () => {
    handleUserMenuClose(); // 메뉴 닫기
    toggleDomain();
  };

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
      
      // 왼쪽 스크롤 가능 여부 (0보다 크면 스크롤 가능)
      const hasLeftScroll = container.scrollLeft > 5;
      
      // 오른쪽 스크롤 가능 여부 (전체 너비에서 현재 스크롤 위치와 표시 영역을 뺀 값이 있으면 스크롤 가능)
      const hasRightScroll = 
        container.scrollWidth > container.clientWidth && 
        container.scrollLeft < container.scrollWidth - container.clientWidth - 5;
      
      // 현재 상태와 다를 때만 상태 업데이트
      setShowLeftScroll(hasLeftScroll);
      setShowRightScroll(hasRightScroll);
    }
  }, []);
  
  // 스크롤 버튼 클릭 핸들러
  const handleScrollLeft = useCallback(() => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      
      // 스크롤 후 버튼 상태 업데이트를 위한 타이머 설정
      setTimeout(() => {
        checkScroll();
      }, 300);
    }
  }, [checkScroll]);
  
  const handleScrollRight = useCallback(() => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      
      // 스크롤 후 버튼 상태 업데이트를 위한 타이머 설정
      setTimeout(() => {
        checkScroll();
      }, 300);
    }
  }, [checkScroll]);
  
  // 활성 탭으로 스크롤 이동
  const scrollToActiveTab = useCallback(() => {
    if (tabsContainerRef.current && activeTab) {
      const container = tabsContainerRef.current;
      const activeTabElement = container.querySelector(`.custom-tab.active`);
      
      if (activeTabElement) {
        // 활성 탭의 위치 계산
        const containerWidth = container.clientWidth;
        const tabWidth = activeTabElement.offsetWidth;
        const tabLeft = activeTabElement.offsetLeft;
        const scrollLeft = container.scrollLeft;
        
        // 탭이 보이는 영역의 범위
        const visibleLeft = scrollLeft;
        const visibleRight = scrollLeft + containerWidth;
        
        // 탭의 시작과 끝 위치
        const tabStart = tabLeft;
        const tabEnd = tabLeft + tabWidth;
        
        // 탭이 보이는 영역을 벗어났을 때만 스크롤 조정
        if (tabStart < visibleLeft || tabEnd > visibleRight) {
          // 활성 탭이 중앙에 오도록 스크롤 위치 계산
          const scrollTo = tabLeft - (containerWidth / 2) + (tabWidth / 2);
          container.scrollTo({ left: Math.max(0, scrollTo), behavior: 'smooth' });
          
          // 스크롤 후 화살표 버튼 상태 업데이트
          setTimeout(() => {
            checkScroll();
          }, 300);
        }
      }
    }
  }, [activeTab, checkScroll]);
  
  // 탭 변경 감지 및 스크롤 체크
  useEffect(() => {
    // 활성 탭으로 스크롤
    if (activeTab) {
      // 약간의 딜레이 후 스크롤 실행 (DOM 업데이트 후)
      const timer = setTimeout(() => {
        scrollToActiveTab();
        checkScroll();
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, tabs, scrollToActiveTab, checkScroll]);
  
  // 스크롤 이벤트 리스너
  useEffect(() => {
    const container = tabsContainerRef.current;
    if (container) {
      const handleScrollEvent = () => {
        checkScroll();
      };
      
      // 스크롤 이벤트 리스너 등록
      container.addEventListener('scroll', handleScrollEvent, { passive: true });
      window.addEventListener('resize', handleScrollEvent);
      
      // 초기 스크롤 체크
      checkScroll();
      
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
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
          
          <Tooltip title={`${username} 계정`}>
            <IconButton
              onClick={handleUserMenuOpen}
              size="small"
              color="inherit"
              className="header-action-button user-icon"
              aria-controls={userMenuOpen ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={userMenuOpen ? 'true' : undefined}
            >
              <AccountCircleIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* 사용자 메뉴 */}
          <Menu
            id="user-menu"
            anchorEl={userMenuAnchor}
            open={userMenuOpen}
            onClose={handleUserMenuClose}
            MenuListProps={{
              'aria-labelledby': 'user-button',
            }}
            PaperProps={{
              elevation: 3,
              sx: {
                minWidth: 220,
                mt: 1,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1">{username}</Typography>
              <Typography variant="body2" color="text.secondary">
                {domain === DOMAINS.PEMS ? 'PEMS 도메인' : 'iMOS 도메인'}
              </Typography>
            </Box>

            <Divider />

            <MenuItem onClick={handleProfileClick}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>내 프로필</ListItemText>
            </MenuItem>

            {/* 개발 환경에서만 도메인 전환 메뉴 표시 */}
            {(!nginxEnv || nginxEnv === '') && (
              <MenuItem onClick={handleDomainToggle}>
                <ListItemIcon>
                  <DomainIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{`${domain === DOMAINS.IMOS ? 'PEMS' : 'iMOS'} 도메인으로 전환`}</ListItemText>
              </MenuItem>
            )}

            <MenuItem onClick={handleUserMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>설정</ListItemText>
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>로그아웃</ListItemText>
            </MenuItem>
          </Menu>
        </div>
      </Box>
    </div>
  );
};

export default memo(AppHeader);