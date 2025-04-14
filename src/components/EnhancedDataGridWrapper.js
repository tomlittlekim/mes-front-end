import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import MuiDataGridWrapper from './MuiDataGridWrapper';
import { useGridState, withGridState } from '../../contexts/GridStateContext';
import { Box, Button } from '@mui/material';

/**
 * MuiDataGridWrapper를 개선한 컴포넌트
 * - 그리드 상태 관리 기능 추가
 * - CSS isolation 적용
 * - 상단 버튼 영역 추가
 * 
 * @param {Object} props
 * @param {string} props.title - 그리드 제목
 * @param {Array} props.rows - 데이터 행 배열
 * @param {Array} props.columns - 컬럼 정의 배열
 * @param {Array} props.buttons - 그리드 상단 버튼 배열 [{label: '등록', onClick: handleAdd, color: 'primary', startIcon: <AddIcon />}]
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
    buttons = [],
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
    isMounted.current = true;
    
    const resizeTimer = setTimeout(() => {
      if (isMounted.current) {
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
        console.log(`EnhancedDataGrid for tab ${tabId} mounted, resize triggered`);
      }
    }, 200);
    
    const intervalId = setInterval(() => {
      if (isMounted.current && document.visibilityState === 'visible') {
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
      }
    }, 1000);
    
    return () => {
      isMounted.current = false;
      clearTimeout(resizeTimer);
      clearInterval(intervalId);
    };
  }, [tabId]);
  
  // 행 선택 핸들러
  const handleSelectionModelChange = useCallback((newSelectionModel) => {
    updateSelection(newSelectionModel);
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
    if (gridProps.onPaginationModelChange) {
      gridProps.onPaginationModelChange(newModel);
    }
  }, [gridProps, updateGridState]);
  
  // 정렬 모델 변경 핸들러
  const handleSortModelChange = useCallback((sortModel) => {
    updateGridState({ sortModel });
    if (gridProps.onSortModelChange) {
      gridProps.onSortModelChange(sortModel);
    }
  }, [gridProps, updateGridState]);
  
  // 필터 모델 변경 핸들러
  const handleFilterModelChange = useCallback((filterModel) => {
    updateGridState({ filterModel });
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
        isolation: 'isolate',
        position: 'relative',
        height: '100%',
        width: '100%',
        minHeight: props.height || '500px',
        display: 'flex',
        flexDirection: 'column'
      }}
      data-tab-id={tabId}
      ref={containerRef}
    >
      {/* 버튼 영역 */}
      {buttons.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
            mb: 2,
            '& .MuiButton-root': {
              minWidth: 'auto',
              px: 2
            }
          }}
        >
          {buttons.map((button, index) => (
            <Button
              key={`${button.label}-${index}`}
              variant="contained"
              color={button.color || 'primary'}
              onClick={button.onClick}
              startIcon={button.startIcon}
              size="small"
            >
              {button.label}
            </Button>
          ))}
        </Box>
      )}

      <MuiDataGridWrapper
        rows={memoizedRows}
        onRowClick={handleRowClick}
        gridProps={enhancedGridProps}
        height={buttons.length > 0 ? (props.height - 48) || 452 : props.height || 500} // 버튼 영역 높이 고려
        tabId={tabId}
        {...restProps}
      />
    </div>
  );
};

// GridStateProvider로 래핑하여 내보내기
export default withGridState(EnhancedDataGridWrapper); 