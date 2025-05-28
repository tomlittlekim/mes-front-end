import React, { useEffect } from 'react';
import SidebarContainer from '../../containers/SidebarContainer';
import AppHeader from '../Common/AppHeader';
import TabLayout from './TabLayout';
import { Element, scroller } from 'react-scroll';
import './AppLayout.css';
import { Outlet } from 'react-router-dom';
import { useSidebar } from '../../contexts/SidebarContext';

const AppLayout = (props) => {
  const { isCollapsed, setIsCollapsed } = useSidebar();

  // 모바일에서 오버레이 클릭 시 SideBar 닫기
  useEffect(() => {
    const handleOverlayClick = (e) => {
      // 모바일 환경에서만 작동
      if (window.innerWidth <= 768 && !isCollapsed) {
        // 클릭된 요소가 sidebar나 그 자식 요소가 아닌 경우
        if (!e.target.closest('.sidebar')) {
          setIsCollapsed(true);
        }
      }
    };

    // 모바일에서 SideBar가 열려있을 때만 이벤트 리스너 추가
    if (window.innerWidth <= 768 && !isCollapsed) {
      document.addEventListener('click', handleOverlayClick);
    }

    return () => {
      document.removeEventListener('click', handleOverlayClick);
    };
  }, [isCollapsed, setIsCollapsed]);

  // 키보드 단축키로 SideBar 토글 (Ctrl + B 또는 Cmd + B)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setIsCollapsed(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIsCollapsed]);

  return (
      <div className={`app-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <SidebarContainer />
        <main className="app-main">
          <AppHeader />
          <Element name="app-content" className="app-content">
            <TabLayout />
          </Element>
        </main>
      </div>
  );
};

export default AppLayout;