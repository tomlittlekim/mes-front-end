import React, { createContext, useState, useEffect } from 'react';
import { useProductionResultManagement } from '../hooks/useProductionResultManagement';

// 생산실적 관리를 위한 컨텍스트 생성
export const ProductionResultContext = createContext();

/**
 * 생산실적 관련 상태와 로직을 제공하는 컨텍스트 프로바이더
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 * @param {string} props.tabId - 탭 ID
 * @returns {JSX.Element}
 */
export const ProductionResultProvider = ({ children, tabId }) => {
  // 생산실적 관리 커스텀 훅 사용
  const productionResultManagement = useProductionResultManagement(tabId);

  // 컨텍스트 값 제공
  const contextValue = {
    ...productionResultManagement
  };

  return (
      <ProductionResultContext.Provider value={contextValue}>
        {children}
      </ProductionResultContext.Provider>
  );
};

export default ProductionResultProvider;