import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';

const TabContext = createContext();

export const TabProvider = ({ children }) => {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [tabContents, setTabContents] = useState({});

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
    // 이미 존재하는 탭인지 확인
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
    
    // 탭 활성화 (새 탭이든 기존 탭이든)
    setActiveTab(tabInfo.id);
    
    // 이미 콘텐츠가 있는지 확인
    setTabContents(prev => {
      // tabId에 해당하는 내용이 없으면 새로 만듬
      if (!prev[tabInfo.id]) {
        return {
          ...prev,
          [tabInfo.id]: true // 탭 콘텐츠 존재 표시
        };
      }
      return prev;
    });
  }, []);

  const closeTab = useCallback((tabId) => {
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
  }, [activeTab]);

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
  const saveTabContent = useCallback((tabId, content) => {
    setTabContents(prev => ({
      ...prev,
      [tabId]: content
    }));
  }, []);

  // 탭 컨텐츠 가져오기 함수
  const getTabContent = useCallback((tabId) => {
    return tabContents[tabId] || null;
  }, [tabContents]);

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
    tabContents
  }), [
    tabs, 
    activeTab, 
    openTab, 
    closeTab, 
    closeAllTabs, 
    setActiveTabCallback, 
    saveTabContent, 
    getTabContent, 
    tabContents
  ]);

  return (
    <TabContext.Provider value={contextValue}>
      {children}
    </TabContext.Provider>
  );
};

export const useTabs = () => useContext(TabContext); 