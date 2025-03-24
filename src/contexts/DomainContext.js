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

// 개발 환경 여부 확인 함수
const isDevelopmentEnvironment = () => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

// 도메인 제공자 컴포넌트
export const DomainProvider = ({ children }) => {
  // 기본값은 IMOS로 설정
  const [domain, setDomain] = useState(DOMAINS.IMOS);
  // 도메인 전환 가능 여부 (개발 환경에서만 true)
  const [canToggleDomain, setCanToggleDomain] = useState(false);

  // 페이지 타이틀 업데이트 함수
  const updatePageTitle = (domainType) => {
    const titleElement = document.getElementById('app-title');
    if (titleElement) {
      document.title = DOMAIN_CONFIG[domainType].title;
    }
  };

  // 개발/운영 환경 확인 및 초기 설정
  useEffect(() => {
    // 개발 환경 여부 확인
    const isDevEnv = isDevelopmentEnvironment();
    setCanToggleDomain(isDevEnv);

    // 초기 도메인 설정 - 개발 환경에서는 로컬스토리지에서, 운영 환경에서는 헤더에서 가져옴
    if (isDevEnv) {
      // 개발 환경에서는 로컬스토리지에 저장된 도메인 설정 사용
      const savedDomain = localStorage.getItem('devDomain');
      if (savedDomain === DOMAINS.PEMS) {
        setDomain(DOMAINS.PEMS);
      } else {
        setDomain(DOMAINS.IMOS);
      }
    } else {
      // 운영 환경에서는 헤더에서 도메인 정보 가져오기
      fetch(window.location.href, { method: 'HEAD' })
        .then(response => {
          const domainType = response.headers.get("X-Domain-Type");
          if (domainType === "PEMS") {
            setDomain(DOMAINS.PEMS);
          } else {
            setDomain(DOMAINS.IMOS);
          }
        })
        .catch(error => console.error("Failed to fetch domain type:", error));
    }
  }, []);

  // 도메인이 변경될 때마다 페이지 타이틀 업데이트
  useEffect(() => {
    updatePageTitle(domain);
    
    // 개발 환경에서만 도메인 설정 저장
    if (isDevelopmentEnvironment()) {
      localStorage.setItem('devDomain', domain);
    }
  }, [domain]);

  // 도메인 강제 변경 함수 (개발 환경에서만 동작)
  const toggleDomain = () => {
    if (canToggleDomain) {
      setDomain(prevDomain => 
        prevDomain === DOMAINS.IMOS ? DOMAINS.PEMS : DOMAINS.IMOS
      );
    }
  };

  // 현재 도메인 설정 가져오기
  const getDomainConfig = () => DOMAIN_CONFIG[domain];

  return (
    <DomainContext.Provider value={{ 
      domain, 
      toggleDomain,
      canToggleDomain,
      getDomainConfig,
      domainName: DOMAIN_CONFIG[domain].name 
    }}>
      {children}
    </DomainContext.Provider>
  );
};

// 도메인 컨텍스트 사용을 위한 훅
export const useDomain = () => useContext(DomainContext); 