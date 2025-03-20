import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { scroller } from 'react-scroll';

const TabContext = createContext();

export const TabProvider = ({ children }) => {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState('main');
  const [tabContents, setTabContents] = useState({
    main: { id: 'main', name: '메인', isLoaded: false }
  });

  // 초기 로딩 시 메인 탭 생성
  useEffect(() => {
    if (tabs.length === 0) {
      const mainTab = {
        id: 'main',
        name: '메인'
      };
      setTabs([mainTab]);
      setActiveTab('main');
    }
  }, [tabs.length]);

  const openTab = useCallback((tabInfo) => {
    console.log('Opening tab:', tabInfo);
    
    // 필수 정보 확인
    if (!tabInfo || !tabInfo.id) {
      console.error('Invalid tab info provided');
      return;
    }
    
    const tabId = tabInfo.id;
    const tabName = tabInfo.name || '탭';
    
    // 이미 열려있는 탭이면 활성화만 변경
    if (tabContents[tabId]) {
      setActiveTab(tabId);
      // 탭 변경 시 스크롤 애니메이션 추가
      scrollToTab(tabId);
      return;
    }
    
    // 새 탭 추가
    setTabs(prevTabs => {
      const existingTab = prevTabs.find(tab => tab.id === tabInfo.id);
      
      if (existingTab) {
        // 기존 탭이 있으면 탭 목록은 변경하지 않음
        return prevTabs;
      } else {
        // 새 탭 추가
        return [...prevTabs, tabInfo];
      }
    });
    
    // 새 탭으로 활성화 변경
    setActiveTab(tabId);
    
    // 탭 변경 시 스크롤 애니메이션 추가 - 약간 지연시켜 실행
    setTimeout(() => {
      scrollToTab(tabId);
    }, 100);
    
    // 이미 콘텐츠가 있는지 확인
    setTabContents(prev => {
      // tabId에 해당하는 내용이 없으면 새로 만듬
      if (!prev[tabId]) {
        return {
          ...prev,
          [tabId]: {
            id: tabId,
            name: tabName,
            group: tabInfo.group || null,
            isLoaded: false
          }
        };
      }
      return prev;
    });
  }, [tabContents]);

  const closeTab = useCallback((tabId) => {
    if (tabId === 'main') {
      // 메인 탭은 닫을 수 없음
      return;
    }
    
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      // 닫은 탭이 활성 탭이었으면 다른 탭으로 이동
      if (activeTab === tabId && newTabs.length > 0) {
        setActiveTab(newTabs[newTabs.length - 1].id);
      } else if (newTabs.length === 0) {
        // 모든 탭이 닫혔다면 메인 탭 다시 열기
        const mainTab = {
          id: 'main',
          name: '메인'
        };
        setActiveTab('main');
        return [mainTab];
      }
      
      return newTabs;
    });
    
    // 닫은 탭의 컨텐츠도 제거
    setTabContents(prev => {
      const newContents = { ...prev };
      delete newContents[tabId];
      return newContents;
    });
    
    // 닫은 탭이 활성화된 상태였다면, 메인 탭 또는 첫 번째 탭으로 활성화 변경
    if (activeTab === tabId) {
      // 남은 탭들 중 첫 번째 탭을 활성화
      const remainingTabs = Object.keys(tabContents).filter(id => id !== tabId);
      if (remainingTabs.length > 0) {
        setActiveTab(remainingTabs[0]);
        // 탭 변경 시 스크롤 애니메이션 추가
        scrollToTab(remainingTabs[0]);
      } else {
        setActiveTab('main');
        // 메인 탭으로 스크롤 애니메이션 추가
        scrollToTab('main');
      }
    }
  }, [activeTab, tabContents]);

  // 모든 탭 닫기 (메인 탭 제외)
  const closeAllTabs = useCallback(() => {
    // 메인 탭 찾기
    setTabs(prevTabs => {
      const mainTab = prevTabs.find(tab => tab.id === 'main');
      if (mainTab) {
        // 메인 탭만 유지
        setActiveTab('main');
        return [mainTab];
      } else {
        // 메인 탭이 없다면 메인 탭 생성
        const newMainTab = {
          id: 'main',
          name: '메인'
        };
        setActiveTab('main');
        return [newMainTab];
      }
    });
    
    // 메인 탭을 제외한 모든 컨텐츠 제거
    setTabContents(prev => {
      const newContents = {};
      // 메인 탭만 유지
      if (prev['main']) newContents['main'] = prev['main'];
      return newContents;
    });
  }, []);

  // 활성 탭 설정 함수를 최적화
  const setActiveTabCallback = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  // 탭 컨텐츠 저장 함수
  const saveTabContent = useCallback((tabId, isLoaded) => {
    if (tabContents[tabId]) {
      setTabContents(prev => ({
        ...prev,
        [tabId]: {
          ...prev[tabId],
          isLoaded
        }
      }));
    }
  }, [tabContents]);

  // 탭 컨텐츠 가져오기 함수
  const getTabContent = useCallback((tabId) => {
    return tabContents[tabId] || null;
  }, [tabContents]);

  // 탭으로 스크롤 이동 함수 추가
  const scrollToTab = useCallback((tabId) => {
    setTimeout(() => {
      scroller.scrollTo(`tab-content-${tabId}`, {
        duration: 300,
        smooth: true,
        containerId: 'tab-content',
        offset: 0,
      });
    }, 100);
  }, []);

  // 콘텍스트 값을 메모이제이션하여 불필요한 리렌더링 방지
  const contextValue = useMemo(() => ({
    tabs, 
    activeTab, 
    openTab, 
    closeTab, 
    closeAllTabs,
    setActiveTab: setActiveTabCallback, 
    saveTabContent, 
    getTabContent,
    tabContents,
    scrollToTab
  }), [
    tabs, 
    activeTab, 
    openTab, 
    closeTab, 
    closeAllTabs, 
    setActiveTabCallback, 
    saveTabContent, 
    getTabContent, 
    tabContents,
    scrollToTab
  ]);

  return (
    <TabContext.Provider value={contextValue}>
      {children}
    </TabContext.Provider>
  );
};

export const useTabs = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabProvider');
  }
  return context;
}; 