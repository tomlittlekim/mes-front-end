import React, { useState, useEffect } from 'react';
import './OrderRegistration.css';
import { useForm, Controller } from 'react-hook-form';
import { 
  TextField, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select,
  Grid, 
  Box, 
  Typography, 
  useTheme,
  Stack
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const OrderRegistration = (props) => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // React Hook Form 설정
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      orderId: '',
      customerName: '',
      productName: '',
      productType: '',
      fromDate: null,
      toDate: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [orderList, setOrderList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);

  // 도메인별 색상 설정
  const getTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
    }
    return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
  };
  
  const getBgColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(45, 30, 15, 0.5)' : 'rgba(252, 235, 212, 0.6)';
    }
    return isDarkMode ? 'rgba(0, 27, 63, 0.5)' : 'rgba(232, 244, 253, 0.6)';
  };
  
  const getBorderColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#1e3a5f' : '#e0e0e0';
  };

  // 초기화 함수
  const handleReset = () => {
    reset({
      orderId: '',
      customerName: '',
      productName: '',
      productType: '',
      fromDate: null,
      toDate: null
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: '0000001', orderDate: '2024-03-15', customer: '(주)한국전자', product: '[T55VD] 보라 VIOLET', spec: '정품입고', unit: 'L', price: 1, quantity: 3, totalAmount: 3000, paymentMethod: '선택형', deliveryAddress: '서울시 강남구', note: '배송전 연락 요망' },
      { id: '0000002', orderDate: '2024-03-16', customer: '대림산업', product: 'PFI-050M_빨강', spec: '정품입고', unit: 'L', price: 1, quantity: 5, totalAmount: 5000, paymentMethod: 'Drop down', deliveryAddress: '경기도 성남시', note: '' },
      { id: '0000003', orderDate: '2024-03-17', customer: '중앙출판', product: '모조지70g', spec: '91.4cm(폭)', unit: 'M', price: 1, quantity: 1, totalAmount: 1000, paymentMethod: '선택형', deliveryAddress: '서울시 서초구', note: '오후 배송 요망' },
      { id: '0000004', orderDate: '2024-03-18', customer: '신한물산', product: '포장비닐', spec: '100cm(폭)', unit: 'EA', price: 10, quantity: 100, totalAmount: 10000, paymentMethod: 'Drop down', deliveryAddress: '인천시 연수구', note: '' }
    ];
    
    setOrderList(dummyData);
    setSelectedOrder(null);
    setOrderDetail(null);
  };

  // 주문 선택 핸들러
  const handleOrderSelect = (params) => {
    const order = orderList.find(o => o.id === params.id);
    setSelectedOrder(order);
    
    if (!order) return;
    
    // 주문 상세 정보 (실제로는 API 호출)
    const detailData = {
      ...order,
      contactPerson: '홍길동',
      contactPhone: '010-1234-5678',
      email: 'hong@example.com',
      deliveryMethod: '택배',
      registDate: '2023-01-15',
      updateDate: '2023-06-20',
      registUser: '자동입력',
      updateUser: '자동입력'
    };
    
    setOrderDetail([detailData]);
  };

  // 등록 버튼 클릭 핸들러
  const handleAdd = () => {
    const newOrder = {
      id: `NEW_${Date.now()}`,
      orderDate: new Date().toISOString().split('T')[0],
      customer: '',
      product: '',
      spec: '',
      unit: '',
      price: 0,
      quantity: 0,
      totalAmount: 0,
      paymentMethod: '',
      deliveryAddress: '',
      note: '',
      contactPerson: '',
      contactPhone: '',
      email: '',
      deliveryMethod: '',
      registDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      registUser: '시스템',
      updateUser: '시스템'
    };
    
    setOrderList([...orderList, newOrder]);
    setSelectedOrder(newOrder);
    setOrderDetail([newOrder]);
  };

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    if (!selectedOrder) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '저장할 주문을 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    Swal.fire({
      icon: 'success',
      title: '성공',
      text: '저장되었습니다.',
      confirmButtonText: '확인'
    });
  };

  // 삭제 버튼 클릭 핸들러
  const handleDelete = () => {
    if (!selectedOrder) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 주문을 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    Swal.fire({
      title: '삭제 확인',
      text: '정말 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedList = orderList.filter(o => o.id !== selectedOrder.id);
        setOrderList(updatedList);
        setSelectedOrder(null);
        setOrderDetail(null);
        Swal.fire({
          icon: 'success',
          title: '성공',
          text: '삭제되었습니다.',
          confirmButtonText: '확인'
        });
      }
    });
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
    const timer = setTimeout(() => {
      handleSearch({});
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // 주문 목록 그리드 컬럼 정의
  const orderColumns = [
    { field: 'id', headerName: '주문ID', width: 100 },
    { field: 'orderDate', headerName: '주문일자', width: 110 },
    { field: 'customer', headerName: '고객사', width: 150 },
    { field: 'product', headerName: '제품', width: 180, flex: 1 },
    { field: 'spec', headerName: '규격', width: 120 },
    { field: 'unit', headerName: '단위', width: 70 },
    { field: 'price', headerName: '단가', width: 80, type: 'number' },
    { field: 'quantity', headerName: '수량', width: 80, type: 'number' },
    { field: 'totalAmount', headerName: '총금액', width: 100, type: 'number' },
    { field: 'paymentMethod', headerName: '결제방식', width: 100 },
    { field: 'deliveryAddress', headerName: '배송주소', width: 200 },
    { field: 'note', headerName: '비고사항', width: 150 }
  ];
  
  // 주문 상세 정보 그리드 컬럼 정의
  const detailColumns = [
    { field: 'id', headerName: '주문ID', width: 100, editable: true },
    { field: 'orderDate', headerName: '주문일자', width: 110, editable: true },
    { field: 'customer', headerName: '고객사', width: 150, editable: true },
    { field: 'contactPerson', headerName: '고객담당자', width: 100, editable: true },
    { field: 'contactPhone', headerName: '연락처', width: 120, editable: true },
    { field: 'email', headerName: '이메일', width: 150, editable: true },
    { field: 'product', headerName: '제품', width: 180, editable: true },
    { field: 'spec', headerName: '규격', width: 120, editable: true },
    { field: 'unit', headerName: '단위', width: 70, editable: true },
    { field: 'price', headerName: '단가', width: 80, type: 'number', editable: true },
    { field: 'quantity', headerName: '수량', width: 80, type: 'number', editable: true },
    { field: 'totalAmount', headerName: '총금액', width: 100, type: 'number', editable: true },
    { 
      field: 'paymentMethod', 
      headerName: '결제방식', 
      width: 100, 
      editable: true,
      type: 'singleSelect',
      valueOptions: ['선택형', 'Drop down', '현금', '카드', '계좌이체']
    },
    { field: 'deliveryAddress', headerName: '배송주소', width: 200, editable: true },
    { 
      field: 'deliveryMethod', 
      headerName: '배송방법', 
      width: 100, 
      editable: true,
      type: 'singleSelect',
      valueOptions: ['택배', '방문수령', '직접배송']
    },
    { field: 'note', headerName: '비고사항', width: 150, editable: true },
    { field: 'registUser', headerName: '등록자', width: 100 },
    { field: 'registDate', headerName: '등록일', width: 120 },
    { field: 'updateUser', headerName: '수정자', width: 100 },
    { field: 'updateDate', headerName: '수정일', width: 120 }
  ];

  // 주문 목록 그리드 버튼
  const orderGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: <SearchIcon /> }
  ];

  // 주문 상세 그리드 버튼
  const detailGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> }
  ];

  return (
    <Box sx={{ p: 0, minHeight: '100vh' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        borderBottom: `1px solid ${getBorderColor()}`,
        pb: 1
      }}>
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            fontWeight: 600,
            color: getTextColor()
          }}
        >
          주문등록
        </Typography>
      </Box>

      {/* 검색 조건 영역 - 공통 컴포넌트 사용 */}
      <SearchCondition 
        onSearch={handleSubmit(handleSearch)}
        onReset={handleReset}
      >
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="orderId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="주문ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="주문ID를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="customerName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="고객사"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="고객사를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="productName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="제품"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="제품명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="productType"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="productType-label">제품 종류</InputLabel>
                <Select
                  {...field}
                  labelId="productType-label"
                  label="제품 종류"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="원자재">원자재</MenuItem>
                  <MenuItem value="부자재">부자재</MenuItem>
                  <MenuItem value="완제품">완제품</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Controller
                name="fromDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="시작일"
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true
                      }
                    }}
                  />
                )}
              />
              <Typography variant="body2" sx={{ mx: 1 }}>~</Typography>
              <Controller
                name="toDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="종료일"
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true
                      }
                    }}
                  />
                )}
              />
            </Stack>
          </LocalizationProvider>
        </Grid>
      </SearchCondition>
      
      {/* 그리드 영역 */}
      {!isLoading && (
        <Grid container spacing={2}>
          {/* 주문 기본 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title="주문목록"
              rows={orderList}
              columns={orderColumns}
              buttons={orderGridButtons}
              height={450}
              onRowClick={handleOrderSelect}
            />
          </Grid>
          
          {/* 주문 상세 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title={`주문상세정보 ${selectedOrder ? '- ' + selectedOrder.id : ''}`}
              rows={orderDetail || []}
              columns={detailColumns}
              buttons={detailGridButtons}
              height={450}
              gridProps={{
                editMode: 'row'
              }}
            />
          </Grid>
        </Grid>
      )}
      
      {/* 하단 정보 영역 */}
      <Box mt={2} p={2} sx={{ 
        bgcolor: getBgColor(), 
        borderRadius: 1,
        border: `1px solid ${getBorderColor()}`
      }}>
        <Stack spacing={1}>
          <Typography variant="body2" color={getTextColor()}>
            • 주문등록 화면에서는 고객의 주문 정보를 효율적으로 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 주문목록에서 특정 주문을 선택하면 해당 주문의 상세 정보를 확인할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 주문등록, 수정, 삭제 기능을 통해 주문 정보를 실시간으로 업데이트할 수 있습니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default OrderRegistration; 