import React, { useState, useEffect } from 'react';
import './HalfProductManagement.css';
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
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const HalfProductManagement = () => {
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
      useYn: '',
      fromDate: null,
      toDate: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [inventoryList, setInventoryList] = useState([]);

  // 초기화 함수
  const handleReset = () => {
    reset({
      productId: '',
      productName: '',
      useYn: '',
      fromDate: null,
      toDate: null
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: '20001', type: '잉크믹스', name: '반제품_보라 믹스', spec: '정품 잉크 믹스', unit: 'L', price: 1, quantity: 1, warehouse: '생산창고', useYn: 'Y', registUser: '홍길동', registDate: '2023-10-15', updateUser: '김유신', updateDate: '2024-01-20' },
      { id: '20002', type: '잉크믹스', name: '반제품_빨강 믹스', spec: '정품 잉크 믹스', unit: 'L', price: 1, quantity: 1, warehouse: '생산창고', useYn: 'Y', registUser: '홍길동', registDate: '2023-10-15', updateUser: '김유신', updateDate: '2024-01-20' },
      { id: '20003', type: '코팅종이', name: '반제품_코팅 모조지70g', spec: '91.4cm(폭) 코팅종이', unit: 'M', price: 10, quantity: 10, warehouse: '생산창고', useYn: 'Y', registUser: '홍길동', registDate: '2023-10-15', updateUser: '김유신', updateDate: '2024-01-20' },
      { id: '20004', type: '포장재', name: '반제품_포장 비닐', spec: '100cm(폭) 롤 형태 비닐', unit: 'EA', price: 100, quantity: 100, warehouse: '생산창고', useYn: 'Y', registUser: '홍길동', registDate: '2023-10-15', updateUser: '김유신', updateDate: '2024-01-20' },
      { id: '20005', type: '미표시', name: '미표시', spec: '미표시', unit: '미표시', price: 0, quantity: 0, warehouse: '미지정', useYn: 'N', registUser: '홍길동', registDate: '2023-10-15', updateUser: '김유신', updateDate: '2024-01-20' }
    ];
    
    setInventoryList(dummyData);
  };

  // 행 추가 버튼 클릭 핸들러
  const handleAdd = () => {
    const newInventory = {
      id: `NEW_${Date.now()}`,
      type: '',
      name: '',
      spec: '',
      unit: '',
      price: 0,
      quantity: 0,
      warehouse: '',
      useYn: 'Y',
      registUser: '시스템',
      registDate: new Date().toISOString().split('T')[0],
      updateUser: '시스템',
      updateDate: new Date().toISOString().split('T')[0]
    };
    
    setInventoryList([...inventoryList, newInventory]);
  };

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    Swal.fire({
      icon: 'success',
      title: '성공',
      text: '저장되었습니다.',
      confirmButtonText: '확인'
    });
  };

  // 삭제 버튼 클릭 핸들러
  const handleDelete = () => {
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

  // 반제품 목록 그리드 컬럼 정의
  const inventoryColumns = [
    { field: 'type', headerName: '제품유형', width: 100 },
    { field: 'id', headerName: '제품 ID', width: 100 },
    { field: 'name', headerName: '제품명', width: 180, flex: 1 },
    { field: 'spec', headerName: '규격', width: 150 },
    { field: 'unit', headerName: '단위', width: 70 },
    { field: 'price', headerName: '단가', width: 80, type: 'number' },
    { field: 'quantity', headerName: '기본수량', width: 100, type: 'number' },
    { field: 'warehouse', headerName: '보관창고', width: 120 },
    { 
      field: 'useYn', 
      headerName: '사용여부', 
      width: 100,
      type: 'singleSelect',
      valueOptions: ['Y', 'N'],
      valueFormatter: (params) => params.value === 'Y' ? '사용' : '미사용'
    },
    { field: 'registUser', headerName: '등록자', width: 100 },
    { field: 'registDate', headerName: '등록일', width: 120 },
    { field: 'updateUser', headerName: '수정자', width: 100 },
    { field: 'updateDate', headerName: '수정일', width: 120 }
  ];

  // 반제품 목록 그리드 버튼
  const inventoryGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: null },
    { label: '행추가', onClick: handleAdd, icon: <AddIcon /> },
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
          반제품관리
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
                label="제품 ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="제품ID를 입력하세요"
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
                label="제품명"
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
            name="useYn"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="useYn-label">사용여부</InputLabel>
                <Select
                  {...field}
                  labelId="useYn-label"
                  label="사용여부"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="Y">사용</MenuItem>
                  <MenuItem value="N">미사용</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Controller
                name="fromDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="등록일(시작)"
                    inputFormat="yyyy-MM-dd"
                    mask="____-__-__"
                    onChange={(date) => field.onChange(date)}
                    renderInput={(params) => 
                      <TextField {...params} size="small" sx={{ minWidth: '140px' }} />
                    }
                  />
                )}
              />
              <span>~</span>
              <Controller
                name="toDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="등록일(종료)"
                    inputFormat="yyyy-MM-dd"
                    mask="____-__-__"
                    onChange={(date) => field.onChange(date)}
                    renderInput={(params) => 
                      <TextField {...params} size="small" sx={{ minWidth: '140px' }} />
                    }
                  />
                )}
              />
            </Stack>
          </LocalizationProvider>
        </Grid>
      </SearchCondition>
      
      {/* 그리드 영역 */}
      <Box sx={{ mt: 2, mb: 2, height: 'calc(100vh - 310px)', width: '100%' }}>
        <MuiDataGridWrapper
          loading={isLoading}
          rows={inventoryList}
          columns={inventoryColumns}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          checkboxSelection
          disableSelectionOnClick
          buttons={inventoryGridButtons}
          isEditable={true}
        />
      </Box>
      
      {/* 하단 정보 영역 */}
      <Box mt={2} p={2} sx={{ 
        bgcolor: getBgColor(), 
        borderRadius: 1,
        border: `1px solid ${getBorderColor()}`
      }}>
        <Stack spacing={1}>
          <Typography variant="body2" color={getTextColor()}>
            • 반제품관리에서는 생산 공정 중 발생하는 중간 제품의 정보를 등록, 수정, 삭제할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 반제품 코드, 제품명, 규격, 단위 등의 기본 정보와 함께 보관 창고를 지정할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 생산된 반제품은 재고 시스템과 연동되어 추적 관리됩니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default HalfProductManagement; 