import React from 'react';
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
  useTheme 
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

// 커스텀 툴바 (DENSITY 버튼 제거)
function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}

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
 * @returns {JSX.Element}
 */
const MuiDataGridWrapper = ({ 
  title, 
  rows = [], 
  columns = [], 
  buttons = [], 
  height = 500, 
  onRowClick,
  gridProps = {}
}) => {
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // 도메인별 색상 설정
  const getHeaderBg = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#fcf2e6';
    }
    return isDarkMode ? '#1a365d' : '#f0f7ff';
  };
  
  const getBorderColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#2d4764' : '#e0e0e0';
  };
  
  const getTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : theme.palette.text.primary;
    }
    return isDarkMode ? '#b3c5e6' : theme.palette.text.primary;
  };
  
  const getBgColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#2d1e0f' : '#ffffff';
    }
    return isDarkMode ? '#102a43' : '#ffffff';
  };
  
  const getColumnHeaderBg = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#2d1e0f' : '#fcf2e6';
    }
    return isDarkMode ? '#1e3a5f' : '#f9fafc';
  };
  
  const getRowHoverColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(231, 126, 34, 0.15)' : 'rgba(211, 84, 0, 0.08)';
    }
    return isDarkMode ? '#234876' : theme.palette.action.hover;
  };
  
  const getRowSelectedColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(231, 126, 34, 0.25)' : 'rgba(211, 84, 0, 0.15)';
    }
    return isDarkMode ? '#1e4976' : theme.palette.action.selected;
  };

  return (
    <Card 
      sx={{ 
        width: '100%', 
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: getBgColor()
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ViewListIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography 
              variant="h6" 
              sx={{ color: getTextColor() }}
            >
              {title}
            </Typography>
          </Box>
        }
        action={
          <Stack direction="row" spacing={1}>
            {buttons.map((button, index) => (
              <Button
                key={index}
                variant="contained"
                size="small"
                color={button.color || "primary"}
                onClick={button.onClick}
                disabled={button.disabled}
                startIcon={button.icon}
              >
                {button.label}
              </Button>
            ))}
          </Stack>
        }
        sx={{ 
          p: 1, 
          paddingRight: 2,
          borderBottom: `1px solid ${getBorderColor()}`,
          bgcolor: getHeaderBg()
        }}
      />
      <CardContent 
        sx={{ 
          flexGrow: 1, 
          p: 0, 
          '&:last-child': { 
            pb: 0 
          }
        }}
      >
        <div style={{ 
          display: 'flex', 
          height: `${height}px`, 
          width: '100%',
          minHeight: '300px',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50, 100]}
            checkboxSelection={gridProps.checkboxSelection}
            disableSelectionOnClick
            onRowClick={onRowClick}
            autoHeight={false}
            components={{
              Toolbar: CustomToolbar,
              ...gridProps.components
            }}
            initialState={{
              pagination: {
                pageSize: 10,
              },
            }}
            sx={{
              border: 'none',
              color: getTextColor(),
              height: '100%',
              flexGrow: 1,
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${getBorderColor()}`
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: getColumnHeaderBg(),
                borderBottom: `1px solid ${getBorderColor()}`
              },
              '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
                padding: '0 8px'
              },
              '& .MuiDataGrid-columnHeaderCheckbox, .MuiDataGrid-cellCheckbox': {
                width: '70px !important',
                minWidth: '70px !important',
                maxWidth: '70px !important',
                paddingLeft: '14px'
              },
              '& .MuiDataGrid-row.Mui-selected': {
                backgroundColor: `${getRowSelectedColor()} !important`
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: `${getRowHoverColor()} !important`
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: `1px solid ${getBorderColor()}`,
                backgroundColor: getColumnHeaderBg()
              },
              '& .MuiTablePagination-root': {
                color: getTextColor()
              },
              '& .MuiCheckbox-root': {
                color: getTextColor()
              }
            }}
            {...gridProps}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MuiDataGridWrapper; 