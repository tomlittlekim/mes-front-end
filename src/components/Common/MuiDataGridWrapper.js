import React, { memo, useRef, useEffect } from 'react';
import { 
  DataGrid, 
  GridToolbarContainer, 
  GridToolbarColumnsButton, 
  GridToolbarFilterButton, 
  GridToolbarQuickFilter 
} from '@mui/x-data-grid';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Stack, 
  useTheme,
  Toolbar
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

// 커스텀 툴바 컴포넌트 정의
const CustomToolbar = () => {
  const theme = useTheme();
  const domain = useDomain().domain;
  const isDarkMode = theme.palette.mode === 'dark';
  
  const getTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
    }
    return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
  };
  
  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <GridToolbarColumnsButton sx={{ color: getTextColor() }} />
      <GridToolbarFilterButton sx={{ color: getTextColor() }} />
      <GridToolbarQuickFilter 
        quickFilterParser={(searchInput) =>
          searchInput
            .split(',')
            .map((value) => value.trim())
        }
        sx={{
          ml: 2,
          "& .MuiInputBase-root": {
            borderRadius: 1,
            color: getTextColor(),
            fontSize: "0.875rem"
          },
        }}
        debounceMs={200}
      />
    </GridToolbarContainer>
  );
};

/**
 * MUI DataGrid 공통 래퍼 컴포넌트
 * 
 * @param {Object} props
 * @param {string} props.title - 그리드 제목
 * @param {Array} props.rows - 데이터 행 배열
 * @param {Array} props.columns - 컬럼 정의 배열
 * @param {Array} props.buttons - 그리드 상단 버튼 배열 [{label: '등록', onClick: handleAdd}]
 * @param {number} props.height - 그리드 높이(px)
 * @param {function} props.onRowClick - 행 클릭 이벤트 핸들러
 * @param {Object} props.gridProps - 추가 DataGrid 속성
 * @param {string} props.tabId - 탭 ID
 * @returns {JSX.Element}
 */
const MuiDataGridWrapper = ({ 
  title = '데이터', 
  rows = [], 
  columns = [], 
  buttons = [], 
  height = 500,
  onRowClick,
  loading = false,
  gridProps = {},
  tabId
}) => {
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // 그리드 컨테이너 참조 추가
  const gridContainerRef = useRef(null);
  const gridRef = useRef(null);
  
  // 컴포넌트 마운트 시 그리드 크기 계산
  useEffect(() => {
    const triggerResize = () => {
      // 윈도우 리사이즈 이벤트를 발생시켜 그리드 크기 재계산
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
    };
    
    // 초기 마운트 시 타이머 설정
    const initialTimer = setTimeout(() => {
      triggerResize();
    }, 0);
    
    // 약간 지연 후 다시 한번 크기 재계산
    const secondTimer = setTimeout(() => {
      triggerResize();
    }, 300);
    
    // 클린업 함수
    return () => {
      clearTimeout(initialTimer);
      clearTimeout(secondTimer);
    };
  }, [tabId, rows.length]); // 탭 ID나 행 데이터가 변경될 때 재실행
  
  // 테마와 도메인에 따른 스타일 함수
  const getTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
    }
    return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
  };
  
  const getBgColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#211405' : '#fff';
    }
    return isDarkMode ? '#0A1929' : '#fff';
  };
  
  const getHeaderBg = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#2a1907' : '#f5e8d7';
    }
    return isDarkMode ? '#132f4c' : '#e6f0f9';
  };

  const getColumnHeaderBg = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#2a1907' : '#f5e8d7';
    }
    return isDarkMode ? '#132f4c' : '#e6f0f9';
  };
  
  const getBorderStyle = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '1px solid #3d2814' : '1px solid #f5e8d7';
    }
    return isDarkMode ? '1px solid #1e4976' : '1px solid #e6f0f9';
  };
  
  const getRowHoverColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#1e4976' : '#e6f0f9';
  };
  
  const getRowSelectedColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : theme.palette.action.selected;
    }
    return isDarkMode ? '#1e4976' : theme.palette.action.selected;
  };

  // 그리드 컬럼 정의 기본값
  const defaultColumns = [
    { field: 'id', headerName: 'ID', width: 100 }
  ];

  // 가상화 성능 최적화 옵션
  const virtualizationOptions = {
    disableVirtualization: false,     // 가상화 활성화
    rowBufferPx: 60                   // 더 많은 행 버퍼링
  };

  // 그리드 컴포넌트 렌더링
  return (
    <Card 
      sx={{ 
        width: '100%', 
        height: height ? `${height}px` : '600px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 2,
        position: 'relative'
      }}
    >
      {/* 그리드 헤더 영역 */}
      <CardHeader
        title={
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: getTextColor()
            }}
          >
            <ViewListIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="h6" color={getTextColor()}>{title}</Typography>
          </Box>
        }
        action={
          <Toolbar 
            sx={{ 
              mt: 0, 
              pt: 0, 
              minHeight: '40px !important',
              pr: 1,
              '@media (min-width: 600px)': {
                paddingLeft: '24px',
                paddingRight: '12px'
              }
            }}
            component="div"
          >
            {buttons?.map((btn, idx) => (
              <Button 
                key={idx}
                startIcon={btn.icon}
                size="small"
                onClick={btn.onClick}
                variant="contained"
                color={btn.color || "primary"}
                sx={{ mx: 0.5 }}
              >
                {btn.label}
              </Button>
            ))}
          </Toolbar>
        }
        sx={{
          bgcolor: getHeaderBg(),
          borderBottom: `1px solid ${getBorderStyle()}`,
          p: 1
        }}
      />

      {/* 그리드 본문 영역 */}
      <CardContent 
        sx={{ 
          flex: 1, 
          p: 0, 
          overflow: 'hidden',
          bgcolor: getBgColor(),
          '&:last-child': { pb: 0 },
          minHeight: '400px',
          height: `calc(${height}px - 56px)`,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div 
          style={{ 
            width: '100%', 
            height: '100%', 
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
          ref={gridContainerRef}
          data-tab-id={tabId}
        >
          <DataGrid
            columns={columns || defaultColumns}
            rows={rows || []}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            pagination={true}
            paginationModel={{
              pageSize: 10,
              page: 0
            }}
            density="compact"
            disableColumnMenu={false}
            checkboxSelection={gridProps?.checkboxSelection}
            autoHeight={false}
            getRowId={(row) => row.id || row.ID || row.code || row._id}
            components={{
              ...gridProps?.components,
              Toolbar: CustomToolbar
            }}
            loading={loading}
            ref={gridRef}
            sx={{
              height: '100%',
              width: '100%',
              border: 'none',
              fontSize: '0.8rem',
              flex: 1,
              '.MuiDataGrid-main': {
                flexGrow: 1,
                height: '100% !important'
              },
              '.MuiDataGrid-columnHeaders': {
                bgcolor: getColumnHeaderBg(),
                borderBottom: getBorderStyle(),
                color: getTextColor()
              },
              '.MuiDataGrid-row': {
                borderBottom: getBorderStyle(),
                color: getTextColor()
              },
              '.MuiDataGrid-cell': {
                borderBottom: 'none',
                color: getTextColor(),
                display: 'flex',         // 추가: flexbox 사용
                alignItems: 'center',    // 추가: 수직 중앙 정렬
                justifyContent: 'center' // 추가: 수평 중앙 정렬 (align 속성과 함께 동작)
              },
              '.MuiTablePagination-root': {
                color: getTextColor()
              },
              '.MuiSvgIcon-root': {
                color: getTextColor()
              },
              '.MuiDataGrid-virtualScroller': {
                bgcolor: getBgColor()
              },
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                outline: 'none'
              },
              '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
                outline: 'none'
              }
            }}
            initialState={{
              ...gridProps?.initialState
            }}
            experimentalFeatures={{
              ...virtualizationOptions,
              columnGrouping: true
            }}
            processRowUpdate={gridProps.onProcessUpdate}
            onProcessRowUpdateError={(error) => {
              console.error('Error updating row:', error);
              // 필요 시 사용자에게 알림을 표시하거나, 원래 값으로 되돌리는 로직을 추가합니다.
            }}
            // onCellEditStop={gridProps.onCellEditStop}
            {...gridProps}
            onRowClick={onRowClick}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(MuiDataGridWrapper); 