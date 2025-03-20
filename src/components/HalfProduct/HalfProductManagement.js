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
  Stack,
  Checkbox
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
      { id: 1, code: 'HP001', name: '알루미늄 프레임 45T', standard: '45x45x100', unit: 'EA', price: 3000, safetyStock: 100, warehouseId: 'WH001', warehouseName: '본사창고', useYn: 'Y', createDate: '2023-03-15', updateDate: '2023-05-20' },
      { id: 2, code: 'HP002', name: '스틸 파이프 외경 25mm', standard: 'Φ25 x 2t', unit: 'M', price: 1500, safetyStock: 200, warehouseId: 'WH001', warehouseName: '본사창고', useYn: 'Y', createDate: '2023-03-15', updateDate: '2023-04-10' },
      { id: 3, code: 'HP003', name: 'PCB 기판 TYPE-A', standard: '150 x 200 mm', unit: 'EA', price: 7500, safetyStock: 50, warehouseId: 'WH002', warehouseName: '자재창고', useYn: 'Y', createDate: '2023-03-16', updateDate: '2023-05-15' },
      { id: 4, code: 'HP004', name: '인쇄회로 베이스보드', standard: '200 x 300 mm', unit: 'EA', price: 12000, safetyStock: 30, warehouseId: 'WH002', warehouseName: '자재창고', useYn: 'N', createDate: '2023-03-18', updateDate: '2023-04-25' },
      { id: 5, code: 'HP005', name: '케이스 타입 B', standard: '300 x 400 x 150 mm', unit: 'EA', price: 8500, safetyStock: 80, warehouseId: 'WH003', warehouseName: '2공장창고', useYn: 'Y', createDate: '2023-03-20', updateDate: '2023-05-08' }
    ];
    
    setInventoryList(dummyData);
    setIsLoading(false);
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

  // 등록 버튼 클릭 핸들러
  const handleAdd = () => {
    // 신규 항목 추가 로직
    const newItem = {
      id: Date.now(),
      code: '',
      name: '',
      standard: '',
      unit: '',
      price: 0,
      safetyStock: 0,
      warehouseId: '',
      warehouseName: '',
      useYn: 'Y',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0]
    };
    
    setInventoryList([...inventoryList, newItem]);
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
    const timer = setTimeout(() => {
      handleSearch({});
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // 반제품 목록 그리드 컬럼 정의
  const inventoryColumns = [
    { field: 'code', headerName: '반제품코드', width: 120, editable: true },
    { field: 'name', headerName: '반제품명', width: 200, flex: 1, editable: true },
    { field: 'standard', headerName: '규격', width: 150, editable: true },
    { field: 'unit', headerName: '단위', width: 80, editable: true },
    { field: 'price', headerName: '단가', width: 100, type: 'number', editable: true },
    { field: 'safetyStock', headerName: '안전재고', width: 100, type: 'number', editable: true },
    { field: 'warehouseName', headerName: '보관창고', width: 150, editable: true },
    { 
      field: 'useYn', 
      headerName: '사용여부', 
      width: 100,
      type: 'singleSelect',
      valueOptions: ['Y', 'N'],
      valueFormatter: (params) => params.value === 'Y' ? '사용' : '미사용',
      editable: true 
    },
    { field: 'createDate', headerName: '등록일', width: 120 },
    { field: 'updateDate', headerName: '수정일', width: 120 }
  ];

  // 반제품 목록 그리드 버튼
  const inventoryGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: <SearchIcon /> },
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
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true
                      }
                    }}
                  />
                )}
              />
              <Controller
                name="toDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="등록일(종료)"
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
          <Grid item xs={12}>
            <MuiDataGridWrapper
              title="반제품 정보"
              rows={inventoryList}
              columns={inventoryColumns}
              buttons={inventoryGridButtons}
              height={500}
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