import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import MuiDataGridWrapper from './MuiDataGridWrapper';
import { useGridState, withGridState } from '../../contexts/GridStateContext';

/**
 * MuiDataGridWrapper를 개선한 컴포넌트
 * - 그리드 상태 관리 기능 추가
 * - CSS isolation 적용
 * 
 * @param {Object} props
 * @param {string} props.title - 그리드 제목
 * @param {Array} props.rows - 데이터 행 배열
 * @param {Array} props.columns - 컬럼 정의 배열
 * @param {Array} props.buttons - 그리드 상단 버튼 배열 [{label: '등록', onClick: handleAdd}]
 * @param {number} props.height - 그리드 높이(px)
 * @param {function} props.onRowClick - 행 클릭 이벤트 핸들러
 * @param {Object} props.gridProps - 추가 DataGrid 속성
 * @param {string} props.tabId - 탭 ID (자동으로 GridStateProvider에서 주입됨)
 */
const EnhancedDataGridWrapper = (props) => {
  const {
    rows = [],
    onRowClick,
    gridProps = {},
    tabId,
    ...restProps
  } = props;
  
  // 그리드 상태 사용
  const { 
    selectedRows, 
    updateSelection,
    gridState,
    updateGridState
  } = useGridState();
  
  // 컴포넌트 마운트 참조
  const isMounted = useRef(false);
  const containerRef = useRef(null);
  
  // 그리드 데이터 메모이제이션
  const memoizedRows = useMemo(() => rows, [JSON.stringify(rows)]);
  
  // 컴포넌트 마운트 및 소멸 시 그리드 크기 조정 이벤트 처리
  useEffect(() => {
    // 컴포넌트 마운트 처리
    isMounted.current = true;
    
    // DOM이 완전히 렌더링 된 후 리사이즈 이벤트 발생
    const resizeTimer = setTimeout(() => {
      if (isMounted.current) {
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
        console.log(`EnhancedDataGrid for tab ${tabId} mounted, resize triggered`);
      }
    }, 200);
    
    // 주기적 리사이즈 이벤트 - 확실한 그리드 초기화를 위해
    const intervalId = setInterval(() => {
      if (isMounted.current && document.visibilityState === 'visible') {
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
      }
    }, 1000);
    
    // 컴포넌트 소멸 시 정리
    return () => {
      isMounted.current = false;
      clearTimeout(resizeTimer);
      clearInterval(intervalId);
    };
  }, [tabId]);
  
  // 행 선택 핸들러
  const handleSelectionModelChange = useCallback((newSelectionModel) => {
    updateSelection(newSelectionModel);
    
    // 원래 onSelectionModelChange 핸들러가 있다면 호출
    if (gridProps.onSelectionModelChange) {
      gridProps.onSelectionModelChange(newSelectionModel);
    }
  }, [gridProps, updateSelection]);
  
  // 페이지 변경 핸들러
  const handlePaginationModelChange = useCallback((newModel) => {
    updateGridState({ 
      page: newModel.page,
      pageSize: newModel.pageSize
    });
    
    // 원래 onPaginationModelChange 핸들러가 있다면 호출
    if (gridProps.onPaginationModelChange) {
      gridProps.onPaginationModelChange(newModel);
    }
  }, [gridProps, updateGridState]);
  
  // 정렬 모델 변경 핸들러
  const handleSortModelChange = useCallback((sortModel) => {
    updateGridState({ sortModel });
    
    // 원래 onSortModelChange 핸들러가 있다면 호출
    if (gridProps.onSortModelChange) {
      gridProps.onSortModelChange(sortModel);
    }
  }, [gridProps, updateGridState]);
  
  // 필터 모델 변경 핸들러
  const handleFilterModelChange = useCallback((filterModel) => {
    updateGridState({ filterModel });
    
    // 원래 onFilterModelChange 핸들러가 있다면 호출
    if (gridProps.onFilterModelChange) {
      gridProps.onFilterModelChange(filterModel);
    }
  }, [gridProps, updateGridState]);
  
  // 행 클릭 핸들러
  const handleRowClick = useCallback((params, event) => {
    if (onRowClick) {
      onRowClick(params, event);
    }
  }, [onRowClick]);
  
  // 그리드 속성 병합
  const enhancedGridProps = {
    ...gridProps,
    pagination: true,
    onRowSelectionModelChange: handleSelectionModelChange,
    rowSelectionModel: selectedRows,
    onPaginationModelChange: handlePaginationModelChange,
    paginationModel: {
      page: gridState.page,
      pageSize: gridState.pageSize
    },
    onSortModelChange: handleSortModelChange,
    onFilterModelChange: handleFilterModelChange,
    sortModel: gridState.sortModel,
    filterModel: gridState.filterModel
  };
  
  return (
    <div 
      className="isolated-grid-container"
      style={{ 
        isolation: 'isolate', // CSS isolation 적용
        position: 'relative',
        height: '100%',
        width: '100%',
        minHeight: props.height || '500px', // 최소 높이 설정
        display: 'flex',
        flexDirection: 'column'
      }}
      data-tab-id={tabId} // 식별용 데이터 속성 추가
      ref={containerRef} // 컨테이너 참조 추가
    >
      <MuiDataGridWrapper
        rows={memoizedRows}
        onRowClick={handleRowClick}
        gridProps={enhancedGridProps}
        height={props.height || 500} // 명시적 높이 전달
        tabId={tabId} // tabId 명시적 전달
        {...restProps}
      />
    </div>
  );
};

// GridStateProvider로 래핑하여 내보내기
export default withGridState(EnhancedDataGridWrapper); 