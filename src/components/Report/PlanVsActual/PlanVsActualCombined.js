import React, { useCallback, useState, useEffect } from 'react';
import { Box, IconButton, Stack, Typography, useTheme, alpha, Grid, Button, Chip, FormControl, InputLabel, MenuItem, Select, List, ListItem, ListItemIcon, Checkbox, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../../Common/HelpModal';
import { SearchCondition, EnhancedDataGridWrapper } from '../../Common';
import { useGraphQL } from '../../../apollo/useGraphQL';
import Message from "../../../utils/message/Message";
import { usePlanVsActual } from './hooks/usePlanVsActual';
import SearchForm from './SearchForm';
import PlanVsActualChart from './PlanVsActualChart';

/**
 * 계획대비 실적조회 통합 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.tabId - 탭 ID
 * @returns {JSX.Element}
 */
const PlanVsActualCombined = (props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const { executeQuery } = useGraphQL();
  
  // 강조 표시를 위한 상태 추가
  const [highlightedProduct, setHighlightedProduct] = useState(null);
  
  // 제품 선택 관련 상태
  const [productSelectModal, setProductSelectModal] = useState({
    open: false,
    searchText: '',
    selectedProducts: []
  });
  
  // 계획대비 실적조회 커스텀 훅 사용
  const {
    control,
    handleSubmit,
    reset,
    handleDateRangeChange,
    handleReset: originalHandleReset,
    handleSearch: originalHandleSearch,
    isLoading,
    reportData,
    chartData,
    refreshKey,
    productList
  } = usePlanVsActual(props.tabId);
  
  // 선택된 제품 목록 (검색 조건에 사용)
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // 스타일 관련 함수
  const getTextColor = useCallback(() => isDarkMode ? '#fff' : 'rgba(0, 0, 0, 0.87)', [isDarkMode]);
  const getBgColor = useCallback(() => isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f5f5f5', [isDarkMode]);
  const getBorderColor = useCallback(() => isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e0e0e0', [isDarkMode]);
  
  // 제품 선택 모달 열기
  const handleOpenProductSelect = () => {
    setProductSelectModal(prev => ({
      ...prev,
      open: true,
      selectedProducts: [...selectedProducts]
    }));
  };
  
  // 제품 선택 모달 닫기
  const handleCloseProductSelect = () => {
    setProductSelectModal(prev => ({
      ...prev,
      open: false,
      searchText: ''
    }));
  };
  
  // 제품 검색 텍스트 변경 핸들러
  const handleSearchTextChange = (e) => {
    setProductSelectModal(prev => ({
      ...prev,
      searchText: e.target.value
    }));
  };
  
  // 제품 체크박스 토글
  const handleToggleProduct = (product) => {
    setProductSelectModal(prev => {
      const currentIndex = prev.selectedProducts.findIndex(p => p.productId === product.productId);
      const newSelected = [...prev.selectedProducts];
      
      if (currentIndex === -1) {
        newSelected.push(product);
      } else {
        newSelected.splice(currentIndex, 1);
      }
      
      return {
        ...prev,
        selectedProducts: newSelected
      };
    });
  };
  
  // 선택 완료
  const handleComplete = () => {
    if (productSelectModal.selectedProducts.length === 0) {
      Message.showWarning('최소한 하나의 제품을 선택해주세요.');
      return;
    }
    
    setSelectedProducts(productSelectModal.selectedProducts);
    handleCloseProductSelect();
  };
  
  // 검색 조건에서 제품 제거
  const handleRemoveProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
  };
  
  // 검색 핸들러 (선택된 제품 포함)
  const handleSearch = (data) => {
    const searchParams = {
      ...data,
      selectedProducts: selectedProducts
    };
    
    originalHandleSearch(searchParams);
  };
  
  // 리셋 핸들러
  const handleReset = () => {
    originalHandleReset();
    setSelectedProducts([]);
  };
  
  // 필터링된 제품 목록
  const filteredProducts = productList.filter(product => {
    if (!productSelectModal.searchText) return true;
    
    const searchText = productSelectModal.searchText.toLowerCase();
    return (
      product.productName.toLowerCase().includes(searchText) ||
      product.productId.toLowerCase().includes(searchText)
    );
  });
  
  // 검색 폼 아이템
  const searchFormItems = SearchForm({ control, handleDateRangeChange });
  
  // 그리드 컬럼 정의
  const planVsActualColumns = [
    { 
      field: 'productName', 
      headerName: '제품명', 
      width: 180, 
      headerAlign: 'center', 
      align: 'left',
      editable: false,
      flex: 1,
    },
    { 
      field: 'planDate', 
      headerName: '계획일자', 
      width: 110, 
      headerAlign: 'center', 
      align: 'center', 
      editable: false,
    },
    { 
      field: 'planQty', 
      headerName: '계획수량', 
      width: 90, 
      headerAlign: 'center', 
      align: 'right', 
      editable: false,
      valueFormatter: ({ value }) => value?.toLocaleString() || '0',
      type: 'number',
    },
    { 
      field: 'orderQty', 
      headerName: '지시수량', 
      width: 90, 
      headerAlign: 'center', 
      align: 'right', 
      editable: false,
      valueFormatter: ({ value }) => value?.toLocaleString() || '0',
      type: 'number',
    },
    { 
      field: 'completedQty', 
      headerName: '완료수량', 
      width: 90, 
      headerAlign: 'center', 
      align: 'right', 
      editable: false,
      valueFormatter: ({ value }) => value?.toLocaleString() || '0',
      type: 'number',
    },
    { 
      field: 'remainingQty', 
      headerName: '잔여수량', 
      width: 90, 
      headerAlign: 'center', 
      align: 'right', 
      editable: false,
      valueFormatter: ({ value }) => value?.toLocaleString() || '0',
      type: 'number',
    },
    { 
      field: 'achievementRate', 
      headerName: '달성률(%)', 
      width: 100, 
      headerAlign: 'center', 
      align: 'right', 
      editable: false,
      renderCell: (params) => {
        const value = parseFloat(params.value);
        let color = theme.palette.text.primary;
        
        if (value >= 100) {
          color = theme.palette.success.main;
        } else if (value < 80) {
          color = theme.palette.error.main;
        } else if (value < 100) {
          color = theme.palette.warning.main;
        }
        
        return (
          <Box sx={{ color, fontWeight: 'bold' }}>
            {value}%
          </Box>
        );
      },
    },
    { 
      field: 'state', 
      headerName: '상태', 
      width: 90, 
      headerAlign: 'center', 
      align: 'center', 
      editable: false,
      renderCell: (params) => {
        const state = params.value;
        let text = '';
        let color = '';
        
        switch (state) {
          case 'COMPLETED':
            text = '완료';
            color = theme.palette.success.main;
            break;
          case 'IN_PROGRESS':
            text = '진행중';
            color = theme.palette.warning.main;
            break;
          default:
            text = state;
            color = theme.palette.text.primary;
        }
        
        return (
          <Box 
            sx={{ 
              bgcolor: alpha(color, 0.1), 
              color: color, 
              px: 1.5, 
              py: 0.5, 
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}
          >
            {text}
          </Box>
        );
      },
    },
  ];
  
  return (
    <Box sx={{ p: 2, minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, borderBottom: `1px solid ${getBorderColor()}`, pb: 1 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: getTextColor() }}>
          계획대비 실적조회
        </Typography>
        <IconButton onClick={() => setIsHelpModalOpen(true)} sx={{ ml: 1, color: theme.palette.primary.main }}>
          <HelpOutlineIcon />
        </IconButton>
      </Box>
      
      <SearchCondition onSearch={handleSubmit(handleSearch)} onReset={handleReset}>
        {searchFormItems}
        
        {/* 제품 선택 버튼 */}
        <Grid item xs={12} md={12} mt={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpenProductSelect}
            >
              제품 선택
            </Button>
            
            {/* 선택된 제품 표시 영역 */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, overflow: 'auto', maxHeight: '60px', flex: 1 }}>
              {selectedProducts.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                  모든 제품
                </Typography>
              ) : (
                selectedProducts.map((product) => (
                  <Chip
                    key={product.productId}
                    label={`${product.productName}`}
                    size="small"
                    onDelete={() => handleRemoveProduct(product.productId)}
                  />
                ))
              )}
            </Box>
          </Box>
        </Grid>
      </SearchCondition>
      
      <Grid container spacing={2} mt={0}>
        <Grid item xs={12} md={12}>
          <Box sx={{ height: 300, bgcolor: getBgColor(), borderRadius: 1, p: 2, border: `1px solid ${getBorderColor()}` }}>
            <Typography variant="h6" sx={{ mb: 2, color: getTextColor() }}>제품별 계획/지시/완료 수량</Typography>
            {!isLoading && chartData && chartData.length > 0 ? (
              <PlanVsActualChart 
                data={chartData} 
                highlightedProduct={highlightedProduct}
                onBarMouseOver={(productName) => setHighlightedProduct(productName)}
                onBarMouseOut={() => setHighlightedProduct(null)}
              />
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography sx={{ color: getTextColor() }}>{isLoading ? '차트 로딩 중...' : '데이터 없음'}</Typography>
              </Box>
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12} md={12} mt={3}>
          <EnhancedDataGridWrapper
            title="계획대비 실적 현황"
            key={refreshKey}
            rows={reportData}
            columns={planVsActualColumns}
            loading={isLoading}
            buttons={[]}
            height={500}
            tabId={props.tabId + "-grid"}
            gridProps={{
              autoHeight: true,
              sx: {
                '& .MuiDataGrid-cell': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                },
                // 강조 행 스타일 추가
                '& .highlighted-row': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.25),
                  }
                }
              },
              pagination: true,
              paginationMode: 'client',
              pageSizeOptions: [5, 10, 20, 50],
              initialState: {
                sorting: {
                  sortModel: [{ field: 'planDate', sort: 'desc' }],
                },
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              },
              density: 'standard',
              paginationPosition: 'bottom',
              paginationModel: {
                pageSize: 10,
                page: 0
              },
              onPaginationModelChange: () => {},
              disableRowSelectionOnClick: true,
              rowsPerPageOptions: [5, 10, 20, 50],
              showFooter: true,
              getRowClassName: (params) => {
                if (highlightedProduct && params.row.productName === highlightedProduct) {
                  return 'highlighted-row';
                }
                return '';
              },
              onRowMouseEnter: (params) => {
                setHighlightedProduct(params.row.productName);
              },
              onRowMouseLeave: () => {
                setHighlightedProduct(null);
              }
            }}
          />
        </Grid>
      </Grid>
      
      {/* 도움말 모달 */}
      <HelpModal open={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} title="계획대비 실적조회 도움말">
        <Typography component="div" color={getTextColor()} paragraph>
          • 설정된 기간 동안의 제품별 생산계획 대비 실적을 조회합니다.
          • 차트에서는 계획수량, 지시수량, 완료수량을 비교할 수 있습니다.
          • 테이블에서는 각 계획에 대한 세부 정보와 달성률을 확인할 수 있습니다.
        </Typography>
      </HelpModal>
      
      {/* 제품 선택 모달 */}
      <Dialog
        open={productSelectModal.open}
        onClose={handleCloseProductSelect}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>제품 선택</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {/* 검색 필드 */}
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>제품 검색</InputLabel>
              <Select
                value=""
                input={
                  <FormControl>
                    <InputLabel>제품 검색</InputLabel>
                    <input
                      type="text"
                      value={productSelectModal.searchText}
                      onChange={handleSearchTextChange}
                      placeholder="제품명 또는 ID로 검색"
                      style={{
                        width: '100%',
                        padding: '8.5px 14px',
                        border: '1px solid rgba(0, 0, 0, 0.23)',
                        borderRadius: '4px',
                        outline: 'none',
                      }}
                    />
                  </FormControl>
                }
              />
            </FormControl>
            
            {/* 제품 목록 */}
            <Box sx={{ mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, maxHeight: '300px', overflow: 'auto' }}>
              <List dense>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ListItem 
                      key={product.productId} 
                      button
                      onClick={() => handleToggleProduct(product)}
                      dense
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={productSelectModal.selectedProducts.some(p => p.productId === product.productId)}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={product.productName} 
                        secondary={`${product.productId} | ${product.productType || ''} | ${product.productCategory || ''}`} 
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="표시할 제품이 없습니다" />
                  </ListItem>
                )}
              </List>
            </Box>
            
            <Typography variant="body2" align="right">
              선택된 제품: {productSelectModal.selectedProducts.length}개
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductSelect}>취소</Button>
          <Button onClick={handleComplete} variant="contained">선택 완료</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlanVsActualCombined; 