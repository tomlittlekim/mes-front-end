import React, { useState, useEffect } from 'react';
import './MaterialManagement.css';
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

const MaterialManagement = () => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // React Hook Form 설정
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      materialType: '',
      materialId: '',
      materialName: '',
      useYn: '',
      fromDate: null,
      toDate: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [materialList, setMaterialList] = useState([]);

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
      materialType: '',
      materialId: '',
      materialName: '',
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
      { id: '0000001', type: '원자재', name: '[T55VD] 보라 VIOLET', spec: '정품입고', unit: 'L', price: 1, quantity: 3, manufacturer: '엠스', supplier: '팔도입고', warehouse: '자재창고', useYn: 'Y', registUser: '홍길동', registDate: '2023-10-15', updateUser: '김유신', updateDate: '2024-01-20' },
      { id: '0000002', type: '원자재', name: 'PFI-050M_빨강', spec: '정품입고', unit: 'L', price: 1, quantity: 5, manufacturer: '캐논', supplier: '한솔입고', warehouse: '자재창고', useYn: 'Y', registUser: '홍길동', registDate: '2023-10-15', updateUser: '김유신', updateDate: '2024-01-20' },
      { id: '0000003', type: '원자재', name: '모조지70g', spec: '91.4cm(폭)', unit: 'M', price: 1, quantity: 1, manufacturer: '창조산사', supplier: '중이경단', warehouse: '자재창고', useYn: 'Y', registUser: '홍길동', registDate: '2023-10-15', updateUser: '김유신', updateDate: '2024-01-20' },
      { id: '0000004', type: '부자재', name: '포장비닐', spec: '100cm(폭)', unit: 'EA', price: 10, quantity: 100, manufacturer: '패이퍼윌트', supplier: '패이퍼윌스', warehouse: '자재창고', useYn: 'Y', registUser: '홍길동', registDate: '2023-10-15', updateUser: '김유신', updateDate: '2024-01-20' }
    ];
    
    setMaterialList(dummyData);
  };

  // 행 추가 버튼 클릭 핸들러
  const handleAdd = () => {
    const newMaterial = {
      id: `NEW_${Date.now()}`,
      type: '',
      name: '',
      spec: '',
      unit: '',
      price: 0,
      quantity: 0,
      manufacturer: '',
      supplier: '',
      warehouse: '',
      useYn: 'Y',
      registUser: '시스템',
      registDate: new Date().toISOString().split('T')[0],
      updateUser: '시스템',
      updateDate: new Date().toISOString().split('T')[0]
    };
    
    setMaterialList([...materialList, newMaterial]);
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

  // 원/부자재 목록 그리드 컬럼 정의
  const materialColumns = [
    { field: 'type', headerName: '자재종류', width: 100 },
    { field: 'id', headerName: '자재 ID', width: 100 },
    { field: 'name', headerName: '자재명', width: 180, flex: 1 },
    { field: 'spec', headerName: '규격', width: 120 },
    { field: 'unit', headerName: '단위', width: 70 },
    { field: 'price', headerName: '단가', width: 80, type: 'number' },
    { field: 'quantity', headerName: '수량', width: 80, type: 'number' },
    { field: 'manufacturer', headerName: '제조사명', width: 120 },
    { field: 'supplier', headerName: '공급업체명', width: 120 },
    { field: 'warehouse', headerName: '보관창고', width: 120 },
    { 
      field: 'useYn', 
      headerName: '사용여부', 
      width: 100,
      type: 'singleSelect',
      valueOptions: ['Y', 'N'],
      valueFormatter: (params) => params.value === 'Y' ? '사용' : '미사용',
      editable: true
    }
  ];

  // 원/부자재 목록 그리드 버튼
  const materialGridButtons = [
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
          원/부자재관리
        </Typography>
      </Box>

      {/* 검색 조건 영역 - 공통 컴포넌트 사용 */}
      <SearchCondition 
        onSearch={handleSubmit(handleSearch)}
        onReset={handleReset}
      >
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="materialType"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="materialType-label">자재종류</InputLabel>
                <Select
                  {...field}
                  labelId="materialType-label"
                  label="자재종류"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="원자재">원자재</MenuItem>
                  <MenuItem value="부자재">부자재</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="materialId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="자재 ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="자재ID를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="materialName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="자재명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="자재명을 입력하세요"
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
        <MuiDataGridWrapper
          title="원/부자재 목록"
          rows={materialList}
          columns={materialColumns}
          buttons={materialGridButtons}
          height={500}
          gridProps={{
            editMode: 'row',
            checkboxSelection: true
          }}
        />
      )}
      
      {/* 하단 정보 영역 */}
      <Box mt={2} p={2} sx={{ 
        bgcolor: getBgColor(), 
        borderRadius: 1,
        border: `1px solid ${getBorderColor()}`
      }}>
        <Stack spacing={1}>
          <Typography variant="body2" color={getTextColor()}>
            • 원/부자재관리에서는 제품 생산에 필요한 원자재와 부자재 정보를 관리합니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 행추가 버튼을 클릭하여 새로운 자재를 등록할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 각 행을 직접 수정한 후 저장 버튼을 클릭하여 변경사항을 저장할 수 있습니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default MaterialManagement; 