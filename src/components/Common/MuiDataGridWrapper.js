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
  const isDarkMode = theme.palette.mode === 'dark';
  
  // 다크모드 색상 설정
  const darkHeaderBg = '#1a365d';
  const darkBorderColor = '#2d4764';
  const darkTextColor = '#b3c5e6';

  return (
    <Card 
      sx={{ 
        width: '100%', 
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDarkMode ? '#102a43' : '#ffffff'
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ViewListIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography 
              variant="h6" 
              sx={{ color: isDarkMode ? darkTextColor : 'inherit' }}
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
          borderBottom: `1px solid ${isDarkMode ? darkBorderColor : '#e0e0e0'}`,
          bgcolor: isDarkMode ? darkHeaderBg : '#f0f7ff' 
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
          flexDirection: 'column'
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
              color: isDarkMode ? darkTextColor : 'inherit',
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${isDarkMode ? darkBorderColor : '#f0f0f0'}`
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: isDarkMode ? '#1e3a5f' : '#f9fafc',
                borderBottom: `1px solid ${isDarkMode ? darkBorderColor : '#e0e0e0'}`
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
                backgroundColor: isDarkMode ? '#1e4976 !important' : theme.palette.action.selected
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: isDarkMode ? '#234876 !important' : theme.palette.action.hover
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: `1px solid ${isDarkMode ? darkBorderColor : '#e0e0e0'}`,
                backgroundColor: isDarkMode ? '#1e3a5f' : '#f9fafc'
              },
              '& .MuiTablePagination-root': {
                color: isDarkMode ? darkTextColor : 'inherit'
              },
              '& .MuiCheckbox-root': {
                color: isDarkMode ? darkTextColor : 'inherit'
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