import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  useTheme,
  CircularProgress,
  Divider,
  TextField,
  Grid,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid } from '@mui/x-data-grid';
import { useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';
import { format } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ko from "date-fns/locale/ko";

// GraphQL 쿼리 정의
const ORDER_HEADERS_QUERY = gql`
  query OrderHeaders($req: OrderHeaderSearchRequest) {
    orderHeaders(req: $req) {
      id
      orderNo
      orderDate
      customerId
      orderer
      orderQuantity
      totalAmount
      vatAmount
      finalAmount
      remark
    }
  }
`;

const ORDER_DETAILS_QUERY = gql`
  query OrderDetails($orderNo: String!) {
    orderDetails(orderNo: $orderNo) {
      id
      orderNo
      orderSubNo
      systemMaterialId
      materialName
      materialStandard
      unit
      quantity
      unitPrice
      totalPrice
      deliveryDate
      remark
    }
  }
`;

// 벤더(고객사) 정보 조회 쿼리 추가
const VENDORS_QUERY = gql`
  query getVendors {
    getVendors {
      vendorId
      vendorName
      vendorType
      businessRegNo
      ceoName
      businessType
      address
      telNo
      createUser
      createDate
      updateUser
      updateDate
    }
  }
`;

/**
 * 주문 정보 모달 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {boolean} props.open - 모달 열림 상태
 * @param {Function} props.onClose - 모달 닫기 핸들러
 * @param {string} props.orderId - 주문번호
 * @param {string} props.orderDetailId - 주문상세ID
 * @param {Function} props.onConfirm - 확인 버튼 클릭 핸들러 (선택한 값 저장)
 * @param {Object} props.vendorMap - 고객사ID를 고객사 정보로 매핑하는 객체
 * @returns {JSX.Element}
 */
const OrderInfoModal = ({
  open,
  onClose,
  orderId = '',
  orderDetailId = '',
  onConfirm,
  vendorMap = {}
}) => {
  const theme = useTheme();
  const client = useApolloClient();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // 상태 관리
  const [orderHeaders, setOrderHeaders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  
  // 검색 필드 상태 추가
  const [searchOrderNo, setSearchOrderNo] = useState('');
  const [searchOrderDate, setSearchOrderDate] = useState(null);
  const [filteredHeaders, setFilteredHeaders] = useState([]);

  // 모달이 열릴 때마다 주문 데이터와 벤더 데이터 가져오기
  useEffect(() => {
    if (open) {
      fetchOrderHeaders();
      fetchVendors();
    }
  }, [open]);

  // 벤더(고객사) 정보 조회
  const fetchVendors = async () => {
    setVendorsLoading(true);
    try {
      const { data } = await client.query({
        query: VENDORS_QUERY,
        fetchPolicy: 'network-only'
      });

      if (data && data.getVendors) {
        setVendors(data.getVendors);
      }
    } catch (error) {
      console.error("벤더 정보 조회 중 오류 발생:", error);
    } finally {
      setVendorsLoading(false);
    }
  };

  // 선택된 주문이 변경될 때 주문 상세 데이터 가져오기
  useEffect(() => {
    if (selectedOrder && selectedOrder.orderNo) {
      fetchOrderDetails(selectedOrder.orderNo);
    } else {
      setOrderDetails([]);
    }
  }, [selectedOrder]);

  // 모달이 열리고 orderID가 있을 경우 해당 주문 선택
  useEffect(() => {
    if (open && orderId && orderHeaders.length > 0) {
      const order = orderHeaders.find(order => order.orderNo === orderId);
      if (order) {
        setSelectedOrder(order);
        
        // 주문상세ID가 있을 경우 해당 주문 상세 선택
        if (orderDetailId && orderDetails.length > 0) {
          const detail = orderDetails.find(detail => detail.orderSubNo === orderDetailId);
          if (detail) {
            setSelectedOrderDetail(detail);
          }
        }
      }
    }
  }, [open, orderId, orderDetailId, orderHeaders, orderDetails]);

  // orderHeaders가 변경될 때마다 필터링된 헤더 업데이트
  useEffect(() => {
    filterOrderHeaders();
  }, [orderHeaders, searchOrderNo, searchOrderDate]);

  // 주문 목록 필터링 함수
  const filterOrderHeaders = () => {
    let filtered = [...orderHeaders];
    
    // 주문번호로 필터링
    if (searchOrderNo) {
      filtered = filtered.filter(order => 
        order.orderNo.toLowerCase().includes(searchOrderNo.toLowerCase())
      );
    }
    
    // 주문일자로 필터링
    if (searchOrderDate) {
      const searchDateStr = format(searchOrderDate, 'yyyy-MM-dd');
      filtered = filtered.filter(order => 
        order.orderDate && order.orderDate.includes(searchDateStr)
      );
    }
    
    setFilteredHeaders(filtered);
  };

  // 주문 목록 조회
  const fetchOrderHeaders = async () => {
    setIsLoading(true);
    try {
      const { data } = await client.query({
        query: ORDER_HEADERS_QUERY,
        variables: {
          req: {}
        },
        fetchPolicy: 'network-only'
      });

      if (data && data.orderHeaders) {
        // 주문번호 역순으로 정렬
        const sortedData = [...data.orderHeaders].sort((a, b) => {
          // 문자열로 된 주문번호를 비교하여 역순으로 정렬
          return b.orderNo.localeCompare(a.orderNo);
        });
        
        const formattedData = sortedData.map((order, index) => ({
          ...order,
          id: order.id || index,
          // 데이터 표시 형식 변경
          orderDate: order.orderDate ? order.orderDate.substring(0, 10) : '',
          orderQuantity: Number(order.orderQuantity || 0),
          totalAmount: Number(order.totalAmount || 0)
        }));
        setOrderHeaders(formattedData);
        setFilteredHeaders(formattedData);
      }
    } catch (error) {
      console.error("주문 목록 조회 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 주문 상세 목록 조회
  const fetchOrderDetails = async (orderNo) => {
    setDetailsLoading(true);
    try {
      const { data } = await client.query({
        query: ORDER_DETAILS_QUERY,
        variables: {
          orderNo: orderNo
        },
        fetchPolicy: 'network-only'
      });

      if (data && data.orderDetails) {
        const formattedData = data.orderDetails.map((detail, index) => ({
          ...detail,
          id: detail.id || `detail-${index}`
        }));
        setOrderDetails(formattedData);
      }
    } catch (error) {
      console.error("주문 상세 목록 조회 중 오류 발생:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // 주문 행 선택 핸들러
  const handleOrderRowClick = useCallback((params) => {
    setSelectedOrder(params.row);
    setSelectedOrderDetail(null);
  }, []);

  // 주문 상세 행 선택 핸들러
  const handleOrderDetailRowClick = useCallback((params) => {
    setSelectedOrderDetail(params.row);
  }, []);

  // 확인 버튼 클릭 핸들러
  const handleConfirm = () => {
    if (typeof onConfirm === 'function' && selectedOrder && selectedOrderDetail) {
      // 필요한 모든 정보를 부모 컴포넌트에 전달
      onConfirm(
        selectedOrder.orderNo,                // 주문번호 
        selectedOrderDetail.orderSubNo,       // 주문상세ID
        selectedOrderDetail.systemMaterialId, // 제품ID (systemMaterialId)
        selectedOrderDetail.materialName,     // 제품명
        selectedOrderDetail.materialStandard, // 규격
        selectedOrderDetail.unit,             // 단위
        selectedOrderDetail.quantity          // 수량 (계획수량으로 사용)
      );
    }
    onClose();
  };

  // 그리드 스타일
  const getGridStyle = () => ({
    border: `1px solid ${isDarkMode ? 'rgba(81, 81, 81, 1)' : 'rgba(224, 224, 224, 1)'}`,
    '& .MuiDataGrid-root': {
      backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.5)'
    },
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.8)' : 'rgba(245, 245, 245, 0.8)'
    },
    '& .MuiDataGrid-row.Mui-selected': {
      backgroundColor: isDarkMode ? 'rgba(25, 118, 210, 0.3)' : 'rgba(25, 118, 210, 0.1)',
      '&:hover': {
        backgroundColor: isDarkMode ? 'rgba(25, 118, 210, 0.4)' : 'rgba(25, 118, 210, 0.2)',
      },
    },
    '& .MuiDataGrid-cell': {
      padding: '0 8px'
    },
    '& .MuiDataGrid-footerContainer': {
      backgroundColor: isDarkMode ? 'rgba(40, 40, 40, 0.8)' : 'rgba(245, 245, 245, 0.8)',
      minHeight: '42px'
    }
  });

  // 주문 목록 컬럼
  const orderColumns = [
    { 
      field: 'orderNo', 
      headerName: '주문번호', 
      flex: 1, 
      minWidth: 110,
      sortable: true,
      sortingOrder: ['desc', 'asc']
    },
    { 
      field: 'orderDate', 
      headerName: '주문일자', 
      flex: 1, 
      minWidth: 100,
      // 문자열이 아닌 날짜로 처리
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || ''}
        </Typography>
      )
    },
    { 
      field: 'orderQuantity', 
      headerName: '주문 총수량', 
      flex: 0.8, 
      minWidth: 100,
      type: 'number',
      // 숫자 포맷팅 수정
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? params.value.toLocaleString() : '0'}
        </Typography>
      )
    },
    { 
      field: 'customerId', 
      headerName: '고객사명', 
      flex: 1.2, 
      minWidth: 120,
      renderCell: (params) => {
        // vendorMap에서 고객사명 가져오기
        const vendor = vendorMap[params.value];
        const vendorName = vendor ? vendor.vendorName : params.value;
        
        return (
          <Typography variant="body2">
            {vendorName}
          </Typography>
        );
      }
    },
    { 
      field: 'orderer', 
      headerName: '주문자ID', 
      flex: 1, 
      minWidth: 100 
    },
    { 
      field: 'totalAmount', 
      headerName: '총금액', 
      flex: 1, 
      minWidth: 110,
      type: 'number',
      // 숫자 포맷팅 수정
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? `${params.value.toLocaleString()} 원` : '0 원'}
        </Typography>
      )
    }
  ];

  // 초기 정렬 설정 (주문번호 역순)
  const initialOrderState = {
    sorting: {
      sortModel: [{ field: 'orderNo', sort: 'desc' }],
    },
    // 표시할 열 설정
    columns: {
      columnVisibilityModel: {
        orderNo: true,
        orderDate: true,
        orderQuantity: true,
        customerId: true,
        orderer: true,
        totalAmount: true
      }
    }
  };

  // 주문 상세 목록 컬럼
  const orderDetailColumns = [
    { field: 'orderSubNo', headerName: '주문상세ID', flex: 1, minWidth: 100 },
    { field: 'materialName', headerName: '제품명', flex: 2, minWidth: 150 },
    { field: 'materialStandard', headerName: '규격', flex: 1, minWidth: 100 },
    { field: 'unit', headerName: '단위', width: 70 },
    { 
      field: 'quantity', 
      headerName: '수량', 
      flex: 0.8, 
      minWidth: 80,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? params.value.toLocaleString() : '0'}
        </Typography>
      )
    },
    { 
      field: 'unitPrice', 
      headerName: '단가', 
      flex: 1, 
      minWidth: 90,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? `${params.value.toLocaleString()} 원` : '0 원'}
        </Typography>
      )
    }
  ];

  // 검색어 변경 핸들러
  const handleOrderNoChange = (event) => {
    setSearchOrderNo(event.target.value);
  };

  // 주문일자 변경 핸들러
  const handleOrderDateChange = (newDate) => {
    setSearchOrderDate(newDate);
  };

  // 검색 초기화 핸들러
  const handleClearSearch = () => {
    setSearchOrderNo('');
    setSearchOrderDate(null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDarkMode ? '#1e1e1e' : '#ffffff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          maxHeight: '90vh',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2, 
        bgcolor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(245, 245, 245, 0.95)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${isDarkMode ? 'rgba(81, 81, 81, 1)' : 'rgba(224, 224, 224, 1)'}`
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          주문 정보 선택
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'auto',
        minHeight: '540px',
        maxHeight: 'calc(90vh - 130px)'
      }}>
        {/* 검색 필드 영역 */}
        <Box sx={{ 
          mb: 2, 
          p: 2, 
          borderRadius: 1,
          bgcolor: isDarkMode ? 'rgba(30, 40, 55, 0.5)' : 'rgba(240, 247, 255, 0.5)',
          border: `1px solid ${isDarkMode ? 'rgba(70, 90, 120, 0.3)' : 'rgba(224, 224, 224, 1)'}`
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="주문번호"
                variant="outlined"
                value={searchOrderNo}
                onChange={handleOrderNoChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                placeholder="주문번호 검색"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DatePicker
                  label="주문일자"
                  value={searchOrderDate}
                  onChange={handleOrderDateChange}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  inputFormat="yyyy-MM-dd"
                  mask="____-__-__"
                  slotProps={{
                    textField: { 
                      size: "small",
                      fullWidth: true,
                      placeholder: "YYYY-MM-DD" 
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button 
                variant="outlined" 
                onClick={handleClearSearch}
                size="small"
                sx={{ mr: 1 }}
              >
                초기화
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* 수평 레이아웃 (좌우 그리드) */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'row', 
          width: '100%', 
          gap: 3,
          minWidth: '1100px',
          flexGrow: 1
        }}>
          {/* 왼쪽: 주문 목록 */}
          <Box sx={{ width: '49%' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1, 
              px: 1.5,
              py: 0.8,
              borderRadius: 1,
              bgcolor: isDarkMode ? 'rgba(30, 40, 55, 0.8)' : 'rgba(240, 247, 255, 0.7)',
              border: `1px solid ${isDarkMode ? 'rgba(70, 90, 120, 0.3)' : 'rgba(224, 224, 224, 1)'}`
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                주문 목록
              </Typography>
              {selectedOrder && (
                <Typography variant="body2" sx={{ ml: 2, color: theme.palette.primary.main }}>
                  선택: {selectedOrder.orderNo}
                </Typography>
              )}
            </Box>
            <Box sx={{ height: '400px', width: '100%' }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress size={30} />
                </Box>
              ) : (
                <DataGrid
                  rows={filteredHeaders}
                  columns={orderColumns}
                  pageSize={8}
                  rowsPerPageOptions={[5, 8, 15]}
                  disableSelectionOnClick
                  onRowClick={handleOrderRowClick}
                  sx={getGridStyle()}
                  selectionModel={selectedOrder ? [selectedOrder.id] : []}
                  density="compact"
                  autoHeight={false}
                  headerHeight={40}
                  rowHeight={35}
                  initialState={initialOrderState}
                  getRowClassName={(params) => 
                    params.row.id === (selectedOrder?.id || '') ? 'Mui-selected' : ''
                  }
                />
              )}
            </Box>
          </Box>

          {/* 세로 구분선 */}
          <Divider orientation="vertical" flexItem />

          {/* 오른쪽: 주문 상세 목록 */}
          <Box sx={{ width: '49%' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1,
              px: 1.5,
              py: 0.8,
              borderRadius: 1,
              bgcolor: isDarkMode ? 'rgba(30, 40, 55, 0.8)' : 'rgba(240, 247, 255, 0.7)',
              border: `1px solid ${isDarkMode ? 'rgba(70, 90, 120, 0.3)' : 'rgba(224, 224, 224, 1)'}`
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {selectedOrder 
                  ? `주문 상세 목록 - ${selectedOrder.orderNo}`
                  : '주문 상세 목록'}
              </Typography>
              {selectedOrderDetail && (
                <Typography variant="body2" sx={{ ml: 2, color: theme.palette.primary.main }}>
                  선택: {selectedOrderDetail.orderSubNo}
                </Typography>
              )}
            </Box>
            <Box sx={{ height: '400px', width: '100%' }}>
              {detailsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress size={30} />
                </Box>
              ) : !selectedOrder ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  border: `1px solid ${isDarkMode ? 'rgba(81, 81, 81, 1)' : 'rgba(224, 224, 224, 1)'}`,
                  borderRadius: 1,
                  backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.5)' : 'rgba(250, 250, 250, 0.5)'
                }}>
                  <Typography variant="body1" color="text.secondary">
                    왼쪽에서 주문을 선택하세요
                  </Typography>
                </Box>
              ) : (
                <DataGrid
                  rows={orderDetails}
                  columns={orderDetailColumns}
                  pageSize={8}
                  rowsPerPageOptions={[5, 8, 15]}
                  disableSelectionOnClick
                  onRowClick={handleOrderDetailRowClick}
                  sx={getGridStyle()}
                  selectionModel={selectedOrderDetail ? [selectedOrderDetail.id] : []}
                  density="compact"
                  autoHeight={false}
                  headerHeight={40}
                  rowHeight={35}
                  getRowClassName={(params) => 
                    params.row.id === (selectedOrderDetail?.id || '') ? 'Mui-selected' : ''
                  }
                />
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        borderTop: `1px solid ${isDarkMode ? 'rgba(81, 81, 81, 1)' : 'rgba(224, 224, 224, 1)'}`,
        bgcolor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(250, 250, 250, 0.95)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            {selectedOrder && selectedOrderDetail && (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                선택된 주문: {selectedOrder.orderNo} / 주문상세: {selectedOrderDetail.orderSubNo}
              </Typography>
            )}
          </Box>
          <Box>
            <Button 
              onClick={onClose} 
              variant="outlined" 
              color="primary"
              sx={{ mr: 1 }}
            >
              취소
            </Button>
            <Button 
              onClick={handleConfirm} 
              variant="contained" 
              color="primary"
              disabled={!selectedOrder || !selectedOrderDetail}
            >
              확인
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default OrderInfoModal; 