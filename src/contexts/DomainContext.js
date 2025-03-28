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
  const [nginxEnv, setNginxEnv] = useState('')

  // 페이지 타이틀 업데이트 함수
  const updatePageTitle = (domainType) => {
    const titleElement = document.getElementById('app-title');
    if (titleElement) {
      document.title = DOMAIN_CONFIG[domainType].title;
    }
  };

  // 초기 도메인 설정 - 실제로는 nginx의 설정값을 가져와야 함
  useEffect(() => {
      fetch(window.location.href, { method: 'HEAD' })
          .then(response => {
              const domainType = response.headers.get("X-Domain-Type") || ''
              setNginxEnv(domainType);
              console.log(nginxEnv);

              // localStorage에서 저장된 도메인 상태 확인
              const savedDomain = localStorage.getItem('currentDomain');
              if (savedDomain) {
                  setDomain(savedDomain);
              } else if (domainType === "PEMS") {
                  setDomain(DOMAINS.PEMS);
              } else {
                  setDomain(DOMAINS.IMOS);
              }
          })
          .catch(error => console.error("Failed to fetch domain type:", error));
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
      domainName: DOMAIN_CONFIG[domain].name,
      nginxEnv,
      canToggleDomain: process.env.NODE_ENV === 'development'
    }}>
      {children}
    </DomainContext.Provider>
  );
};

// 도메인 컨텍스트 사용을 위한 훅
export const useDomain = () => useContext(DomainContext); 