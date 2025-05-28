import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  // 모바일 환경에서는 기본적으로 숨김, 데스크톱에서는 표시
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // 로컬 스토리지에서 이전 상태 복원
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // 기본값: 모바일에서는 숨김, 데스크톱에서는 표시
    return window.innerWidth <= 768;
  });

  // 상태 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      // 모바일로 전환 시 자동으로 숨김
      if (window.innerWidth <= 768 && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  const value = {
    isCollapsed,
    setIsCollapsed,
    toggleSidebar
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}; 