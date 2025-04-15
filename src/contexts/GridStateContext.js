import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// 그리드 상태를 관리하는 컨텍스트 생성
const GridStateContext = createContext();

/**
 * 각 탭의 그리드 상태를 독립적으로 관리하는 Provider 컴포넌트
 * @param {Object} props
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 * @param {string} props.tabId - 탭 ID
 */
export const GridStateProvider = ({ children, tabId }) => {
  // 그리드 선택 행 상태
  const [selectedRows, setSelectedRows] = useState([]);
  
  // 그리드 페이징, 정렬, 필터링 상태
  const [gridState, setGridState] = useState({
    page: 0,
    pageSize: 25,
    sortModel: [],
    filterModel: { items: [] },
    loading: false
  });
  
  // 그리드 데이터 상태
  const [gridData, setGridData] = useState({
    rows: [],
    totalRows: 0
  });
  
  // 그리드 상태 업데이트 함수들
  const updateSelection = useCallback((newSelection) => {
    setSelectedRows(newSelection);
  }, []);
  
  const updateGridState = useCallback((newState) => {
    setGridState(prev => ({ ...prev, ...newState }));
  }, []);
  
  const updateGridData = useCallback((newData) => {
    setGridData(prev => ({ ...prev, ...newData }));
  }, []);
  
  // 그리드 상태 리셋 함수
  const resetGridState = useCallback(() => {
    setSelectedRows([]);
    setGridState({
      page: 0,
      pageSize: 25,
      sortModel: [],
      filterModel: { items: [] },
      loading: false
    });
  }, []);
  
  // 컨텍스트 값 메모이제이션
  const value = useMemo(() => ({
    tabId,
    selectedRows,
    gridState,
    gridData,
    updateSelection,
    updateGridState,
    updateGridData,
    resetGridState
  }), [
    tabId, 
    selectedRows, 
    gridState, 
    gridData, 
    updateSelection, 
    updateGridState, 
    updateGridData, 
    resetGridState
  ]);
  
  return (
    <GridStateContext.Provider value={value}>
      {children}
    </GridStateContext.Provider>
  );
};

/**
 * 그리드 상태를 사용하기 위한 커스텀 훅
 * @returns {Object} 그리드 상태 및 상태 관리 함수
 */
export const useGridState = () => {
  const context = useContext(GridStateContext);
  if (!context) {
    throw new Error('useGridState must be used within a GridStateProvider');
  }
  return context;
};

/**
 * 그리드 상태 관리 기능이 추가된 MUI DataGrid 래퍼 HOC
 * @param {Function} WrappedComponent - 래핑할 컴포넌트
 * @returns {Function} 그리드 상태 관리 기능이 추가된 컴포넌트
 */
export const withGridState = (WrappedComponent) => {
  const WithGridState = (props) => {
    const { tabId } = props;
    
    return (
      <GridStateProvider tabId={tabId}>
        <WrappedComponent {...props} />
      </GridStateProvider>
    );
  };
  
  WithGridState.displayName = `WithGridState(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return WithGridState;
};

export default GridStateContext; 