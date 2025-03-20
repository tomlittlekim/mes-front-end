import React, { useState, useEffect } from 'react';
import './ShipmentManagement.css';
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
  Stack,
  Chip
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';

const ShipmentManagement = () => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // React Hook Form 설정
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      orderId: '',
      customerName: '',
      productName: '',
      outputStatus: '',
      fromDate: null,
      toDate: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [shipmentList, setShipmentList] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [shipmentDetail, setShipmentDetail] = useState(null);

  // 초기화 함수
  const handleReset = () => {
    reset({
      orderId: '',
      customerName: '',
      productName: '',
      outputStatus: '',
      fromDate: null,
      toDate: null
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: '0000001', orderDate: '2024-03-15', customer: '(주)한국전자', product: '[T55VD] 보라 VIOLET', totalAmount: 500000, shipmentStatus: '부분출하', orderQuantity: 2000, shippedQuantity: 1500, remainingQuantity: 500, note: '특이사항 없음' },
      { id: '0000002', orderDate: '2024-03-16', customer: '대림산업', product: 'PFI-050M_빨강', totalAmount: 350000, shipmentStatus: '출하완료', orderQuantity: 1000, shippedQuantity: 1000, remainingQuantity: 0, note: '출하완료' },
      { id: '0000003', orderDate: '2024-03-17', customer: '에이원', product: '모조지70g', totalAmount: 780000, shipmentStatus: '부분출하', orderQuantity: 5000, shippedQuantity: 3000, remainingQuantity: 2000, note: '일부 긴급출하' },
      { id: '0000004', orderDate: '2024-03-18', customer: '신한물산', product: '포장비닐', totalAmount: 120000, shipmentStatus: '미출하', orderQuantity: 500, shippedQuantity: 0, remainingQuantity: 500, note: '출하 대기중' }
    ];
    
    setShipmentList(dummyData);
    setSelectedShipment(null);
    setShipmentDetail(null);
  };

  // 출하 선택 핸들러
  const handleShipmentSelect = (params) => {
    const shipment = shipmentList.find(s => s.id === params.id);
    setSelectedShipment(shipment);
    
    if (!shipment) return;
    
    // 출하 내역 상세 정보 (실제로는 API 호출)
    const detailData = [
      { id: '00001', shipmentDate: '2024-03-25', productName: '과자', spec: '박스형', unit: 'BOX', orderQuantity: 1500, shippedQuantity: 800, remainingQuantity: 700, stockQuantity: 20, currentShipmentQuantity: 20, warehouse: '재품창고', shippedBy: '홍길동', note: '일반출하' },
      { id: '00002', shipmentDate: '2024-03-25', productName: '사과', spec: '샘플용', unit: 'EA', orderQuantity: 500, shippedQuantity: 500, remainingQuantity: 0, stockQuantity: 0, currentShipmentQuantity: 0, warehouse: '신선창고', shippedBy: '김철수', note: '급출하 요청' }
    ];
    
    setShipmentDetail(detailData);
  };

  // 출하등록 버튼 클릭 핸들러
  const handleAddShipment = () => {
    if (!selectedShipment) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '출하할 주문을 먼저 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    const newShipment = {
      id: `NEW_${Date.now()}`,
      shipmentDate: new Date().toISOString().split('T')[0],
      productName: selectedShipment.product,
      spec: '',
      unit: '',
      orderQuantity: selectedShipment.orderQuantity,
      shippedQuantity: selectedShipment.shippedQuantity,
      remainingQuantity: selectedShipment.remainingQuantity,
      stockQuantity: 0,
      currentShipmentQuantity: 0,
      warehouse: '',
      shippedBy: '시스템',
      note: ''
    };
    
    setShipmentDetail([...(shipmentDetail || []), newShipment]);
  };

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    if (!selectedShipment) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '저장할 주문을 먼저 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    if (!shipmentDetail || shipmentDetail.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '저장할 출하 내역이 없습니다.',
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
    if (!selectedShipment) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 주문을 먼저 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    if (!shipmentDetail || shipmentDetail.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 출하 내역이 없습니다.',
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
        setShipmentDetail(null);
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
  const shipmentColumns = [
    { field: 'id', headerName: '주문ID', width: 100 },
    { field: 'orderDate', headerName: '주문일자', width: 110 },
    { field: 'customer', headerName: '고객사', width: 150 },
    { field: 'product', headerName: '제품', width: 180, flex: 1 },
    { field: 'totalAmount', headerName: '제품최종금액', width: 120, type: 'number' },
    { 
      field: 'shipmentStatus', 
      headerName: '출하상태', 
      width: 110,
      renderCell: (params) => {
        let color = 'default';
        if (params.value === '미출하') color = 'error';
        else if (params.value === '부분출하') color = 'warning';
        else if (params.value === '출하완료') color = 'success';
        
        return (
          <Chip 
            label={params.value} 
            color={color} 
            size="small" 
            variant="outlined"
          />
        );
      }
    },
    { field: 'orderQuantity', headerName: '주문수량', width: 100, type: 'number' },
    { field: 'shippedQuantity', headerName: '출하수량', width: 100, type: 'number' },
    { field: 'remainingQuantity', headerName: '미출하수량', width: 100, type: 'number' },
    { field: 'note', headerName: '비고사항', width: 150 }
  ];
  
  // 출하 상세 정보 그리드 컬럼 정의
  const detailColumns = [
    { field: 'shipmentDate', headerName: '출하일자', width: 110, editable: true },
    { field: 'id', headerName: '출하ID', width: 100 },
    { field: 'productName', headerName: '품목명', width: 120, editable: true },
    { field: 'spec', headerName: '규격', width: 100, editable: true },
    { field: 'unit', headerName: '단위', width: 80, editable: true },
    { field: 'orderQuantity', headerName: '주문수량', width: 100, type: 'number' },
    { field: 'shippedQuantity', headerName: '출하수량', width: 100, type: 'number' },
    { field: 'remainingQuantity', headerName: '미출하수량', width: 100, type: 'number' },
    { field: 'stockQuantity', headerName: '재고수량', width: 100, type: 'number' },
    { field: 'currentShipmentQuantity', headerName: '금회출하수량', width: 120, type: 'number', editable: true,
      cellClassName: 'editable-cell'
    },
    { field: 'warehouse', headerName: '출하창고', width: 120, editable: true },
    { field: 'shippedBy', headerName: '출하처리자', width: 120, editable: true },
    { field: 'note', headerName: '비고사항', width: 150, editable: true }
  ];

  // 출하 목록 그리드 버튼
  const shipmentGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: <SearchIcon /> }
  ];

  // 출하 상세 그리드 버튼
  const detailGridButtons = [
    { label: '출하등록', onClick: handleAddShipment, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> }
  ];

  return (
    <Box sx={{ p: 2, minHeight: '100vh' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        borderBottom: `1px solid ${isDarkMode ? '#2d4764' : '#e0e0e0'}`,
        pb: 1
      }}>
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            fontWeight: 600,
            color: isDarkMode ? '#b3c5e6' : 'inherit'
          }}
        >
          출하관리
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
            name="outputStatus"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="outputStatus-label">출하상태</InputLabel>
                <Select
                  {...field}
                  labelId="outputStatus-label"
                  label="출하상태"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="미출하">미출하</MenuItem>
                  <MenuItem value="부분출하">부분출하</MenuItem>
                  <MenuItem value="출하완료">출하완료</MenuItem>
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
          {/* 주문 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title="주문정보"
              rows={shipmentList}
              columns={shipmentColumns}
              buttons={shipmentGridButtons}
              height={450}
              onRowClick={handleShipmentSelect}
            />
          </Grid>
          
          {/* 출하등록 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title={`출하등록 ${selectedShipment ? '- ' + selectedShipment.product : ''}`}
              rows={shipmentDetail || []}
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
        bgcolor: isDarkMode ? 'rgba(0, 27, 63, 0.5)' : 'rgba(232, 244, 253, 0.6)', 
        borderRadius: 1,
        border: `1px solid ${isDarkMode ? '#1e3a5f' : '#e0e0e0'}`
      }}>
        <Stack spacing={1}>
          <Typography variant="body2" color={isDarkMode ? '#b3c5e6' : 'text.secondary'}>
            • 출하관리 화면에서는 상단 주문정보와 하단 출하처리된 목록을 조회할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={isDarkMode ? '#b3c5e6' : 'text.secondary'}>
            • 출하처리는 금회출하수량 입력만 가능하며, 필요시 수량을 조정하여 저장할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={isDarkMode ? '#b3c5e6' : 'text.secondary'}>
            • 출하처리가 완료되면 상단 출하상태와 미출하수량이 자동 계산되어 업데이트됩니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default ShipmentManagement; 