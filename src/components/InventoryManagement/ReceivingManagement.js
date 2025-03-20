import React, { useState, useEffect } from 'react';
import './ReceivingManagement.css';
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

const ReceivingManagement = () => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
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
  
  // React Hook Form 설정
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      productId: '',
      productName: '',
      productType: '',
      supplier: '',
      fromDate: null,
      toDate: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [receivingList, setReceivingList] = useState([]);
  const [selectedReceiving, setSelectedReceiving] = useState(null);
  const [receivingDetail, setReceivingDetail] = useState(null);

  // 초기화 함수
  const handleReset = () => {
    reset({
      productId: '',
      productName: '',
      productType: '',
      supplier: '',
      fromDate: null,
      toDate: null
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: 'I0001', receiveDate: '2024-04-15', supplier: '(주)코리아잉크', product: '잉크믹스_보라', type: '원자재', spec: '정품 잉크 믹스', unit: 'L', price: 5000, quantity: 100, totalAmount: 500000, warehouse: '자재창고A', note: '정기발주품' },
      { id: 'I0002', receiveDate: '2024-04-16', supplier: '대림페이퍼', product: '모조지 70g', type: '원자재', spec: '91.4cm(폭) 용지', unit: 'M', price: 1000, quantity: 500, totalAmount: 500000, warehouse: '자재창고B', note: '긴급발주품' },
      { id: 'I0003', receiveDate: '2024-04-17', supplier: '신한물산', product: '포장비닐', type: '부자재', spec: '100cm(폭) 롤형태', unit: 'EA', price: 300, quantity: 300, totalAmount: 90000, warehouse: '자재창고A', note: '' },
      { id: 'I0004', receiveDate: '2024-04-18', supplier: '한국케미칼', product: '세척제', type: '부자재', spec: '고급 세척제', unit: 'L', price: 3000, quantity: 50, totalAmount: 150000, warehouse: '자재창고C', note: '취급주의물품' }
    ];
    
    setReceivingList(dummyData);
    setSelectedReceiving(null);
    setReceivingDetail(null);
  };

  // 입고 선택 핸들러
  const handleReceivingSelect = (params) => {
    const receiving = receivingList.find(r => r.id === params.id);
    setSelectedReceiving(receiving);
    
    if (!receiving) return;
    
    // 입고 상세 정보 (실제로는 API 호출)
    const detailData = {
      ...receiving,
      supplierCode: 'SUP' + receiving.id.substring(1),
      supplierContact: '010-1234-5678',
      purchaseOrderId: 'PO' + receiving.id.substring(1),
      inspectionResult: '합격',
      inspectionUser: '김검수',
      inspectionDate: receiving.receiveDate,
      registDate: receiving.receiveDate,
      updateDate: receiving.receiveDate,
      registUser: '시스템',
      updateUser: '시스템'
    };
    
    setReceivingDetail([detailData]);
  };

  // 등록 버튼 클릭 핸들러
  const handleAdd = () => {
    const newReceiving = {
      id: `NEW_${Date.now()}`,
      receiveDate: new Date().toISOString().split('T')[0],
      supplier: '',
      product: '',
      type: '',
      spec: '',
      unit: '',
      price: 0,
      quantity: 0,
      totalAmount: 0,
      warehouse: '',
      note: '',
      supplierCode: '',
      supplierContact: '',
      purchaseOrderId: '',
      inspectionResult: '대기',
      inspectionUser: '',
      inspectionDate: '',
      registDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      registUser: '시스템',
      updateUser: '시스템'
    };
    
    setReceivingList([...receivingList, newReceiving]);
    setSelectedReceiving(newReceiving);
    setReceivingDetail([newReceiving]);
  };

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    if (!selectedReceiving) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '저장할 입고정보를 선택해주세요.',
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
    if (!selectedReceiving) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 입고정보를 선택해주세요.',
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
        const updatedList = receivingList.filter(r => r.id !== selectedReceiving.id);
        setReceivingList(updatedList);
        setSelectedReceiving(null);
        setReceivingDetail(null);
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

  // 입고 목록 그리드 컬럼 정의
  const receivingColumns = [
    { field: 'id', headerName: '입고ID', width: 100 },
    { field: 'receiveDate', headerName: '입고일자', width: 110 },
    { field: 'supplier', headerName: '공급업체', width: 150 },
    { field: 'product', headerName: '품목명', width: 180, flex: 1 },
    { field: 'type', headerName: '품목유형', width: 100 },
    { field: 'spec', headerName: '규격', width: 120 },
    { field: 'unit', headerName: '단위', width: 70 },
    { field: 'price', headerName: '단가', width: 80, type: 'number' },
    { field: 'quantity', headerName: '수량', width: 80, type: 'number' },
    { field: 'totalAmount', headerName: '총금액', width: 100, type: 'number' },
    { field: 'warehouse', headerName: '입고창고', width: 120 },
    { field: 'note', headerName: '비고', width: 150 }
  ];
  
  // 입고 상세 정보 그리드 컬럼 정의
  const detailColumns = [
    { field: 'id', headerName: '입고ID', width: 100, editable: true },
    { field: 'receiveDate', headerName: '입고일자', width: 110, editable: true },
    { field: 'supplier', headerName: '공급업체', width: 150, editable: true },
    { field: 'supplierCode', headerName: '업체코드', width: 100, editable: true },
    { field: 'supplierContact', headerName: '연락처', width: 120, editable: true },
    { field: 'purchaseOrderId', headerName: '발주번호', width: 120, editable: true },
    { field: 'product', headerName: '품목명', width: 180, editable: true },
    { field: 'type', headerName: '품목유형', width: 100, editable: true, type: 'singleSelect', valueOptions: ['원자재', '부자재', '반제품', '완제품'] },
    { field: 'spec', headerName: '규격', width: 120, editable: true },
    { field: 'unit', headerName: '단위', width: 70, editable: true },
    { field: 'price', headerName: '단가', width: 80, type: 'number', editable: true },
    { field: 'quantity', headerName: '수량', width: 80, type: 'number', editable: true },
    { field: 'totalAmount', headerName: '총금액', width: 100, type: 'number', editable: true },
    { field: 'warehouse', headerName: '입고창고', width: 120, editable: true, type: 'singleSelect', valueOptions: ['자재창고A', '자재창고B', '자재창고C', '완제품창고'] },
    { field: 'inspectionResult', headerName: '검수결과', width: 100, editable: true, type: 'singleSelect', valueOptions: ['대기', '합격', '불합격', '조건부합격'] },
    { field: 'inspectionUser', headerName: '검수자', width: 100, editable: true },
    { field: 'inspectionDate', headerName: '검수일자', width: 100, editable: true },
    { field: 'note', headerName: '비고', width: 150, editable: true },
    { field: 'registUser', headerName: '등록자', width: 100 },
    { field: 'registDate', headerName: '등록일', width: 120 },
    { field: 'updateUser', headerName: '수정자', width: 100 },
    { field: 'updateDate', headerName: '수정일', width: 120 }
  ];

  // 입고 목록 그리드 버튼
  const receivingGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: <SearchIcon /> }
  ];

  // 입고 상세 그리드 버튼
  const detailGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
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
          입고관리
        </Typography>
      </Box>

      {/* 검색 조건 영역 - 공통 컴포넌트 사용 */}
      <SearchCondition 
        onSearch={handleSubmit(handleSearch)}
        onReset={handleReset}
      >
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="productId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="품목코드"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="품목코드를 입력하세요"
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
                label="품목명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="품목명을 입력하세요"
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
                <InputLabel id="productType-label">품목유형</InputLabel>
                <Select
                  {...field}
                  labelId="productType-label"
                  label="품목유형"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="원자재">원자재</MenuItem>
                  <MenuItem value="부자재">부자재</MenuItem>
                  <MenuItem value="반제품">반제품</MenuItem>
                  <MenuItem value="완제품">완제품</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="supplier"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="공급업체"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="공급업체를 입력하세요"
              />
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
          {/* 입고 기본 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title="입고목록"
              rows={receivingList}
              columns={receivingColumns}
              buttons={receivingGridButtons}
              height={450}
              onRowClick={handleReceivingSelect}
            />
          </Grid>
          
          {/* 입고 상세 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title={`입고상세정보 ${selectedReceiving ? '- ' + selectedReceiving.id : ''}`}
              rows={receivingDetail || []}
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
            • 입고관리 화면에서는 원자재, 부자재 등의 입고 정보를 효율적으로 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 구매발주 정보를 바탕으로 입고 처리하며, 품질검사 결과에 따라 입고 상태가 변경됩니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 입고 처리 후 자동으로 재고가 증가하며, 추적성을 위해 로트 정보도 함께 관리됩니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default ReceivingManagement; 