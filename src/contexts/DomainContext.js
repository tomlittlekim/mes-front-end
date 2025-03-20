import React, { createContext, useState, useContext, useEffect } from 'react';

// 도메인 컨텍스트 생성
const DomainContext = createContext();

// 도메인 타입 정의
export const DOMAINS = {
  IMOS: 'imos',
  PEMS: 'pems'
};

// 도메인별 설정
const DOMAIN_CONFIG = {
  [DOMAINS.IMOS]: {
    title: 'iMOS | 스마트 제조 관리 시스템',
    name: 'iMOS'
  },
  [DOMAINS.PEMS]: {
    title: 'PEMS | 생산설비 관리 시스템',
    name: 'PEMS'
  }
};

// 도메인 제공자 컴포넌트
export const DomainProvider = ({ children }) => {
  // 기본값은 IMOS로 설정
  const [domain, setDomain] = useState(DOMAINS.IMOS);

  // 페이지 타이틀 업데이트 함수
  const updatePageTitle = (domainType) => {
    const titleElement = document.getElementById('app-title');
    if (titleElement) {
      document.title = DOMAIN_CONFIG[domainType].title;
    }
  };

  // 초기 도메인 설정 - 실제로는 nginx의 설정값을 가져와야 함
  useEffect(() => {
    // 이 부분은 실제 구현 시 서버에서 값을 가져오는 로직으로 대체해야 함
    // 예: API 호출 또는 window 객체에 설정된 값 사용
    
    // 테스트를 위한 임시 로직
    const hostname = window.location.hostname;
    if (hostname.includes('pems')) {
      setDomain(DOMAINS.PEMS);
    } else {
      setDomain(DOMAINS.IMOS);
    }
    
    // TODO: nginx 설정값을 가져오는 로직 구현
  }, []);

  // 도메인이 변경될 때마다 페이지 타이틀 업데이트
  useEffect(() => {
    updatePageTitle(domain);
  }, [domain]);

  // 도메인 강제 변경 함수 (테스트용)
  const toggleDomain = () => {
    setDomain(prevDomain => 
      prevDomain === DOMAINS.IMOS ? DOMAINS.PEMS : DOMAINS.IMOS
    );
  };

  // 현재 도메인 설정 가져오기
  const getDomainConfig = () => DOMAIN_CONFIG[domain];

  return (
    <DomainContext.Provider value={{ 
      domain, 
      toggleDomain,
      getDomainConfig,
      domainName: DOMAIN_CONFIG[domain].name 
    }}>
      {children}
    </DomainContext.Provider>
  );
};

// 도메인 컨텍스트 사용을 위한 훅
export const useDomain = () => useContext(DomainContext); 