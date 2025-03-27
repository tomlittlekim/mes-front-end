import React, { useState, useEffect } from 'react';
import './ProductManagement.css';
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
  Checkbox,
  IconButton,
  alpha
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
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../Common/HelpModal';

const ProductManagement = (props) => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
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
  const [productList, setProductList] = useState([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

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
      { id: '001', type: '완제품', name: '모니터 24인치', spec: '1920x1080, IPS', unit: 'EA', price: 150000, defaultQuantity: 1, warehouse: '완제품창고', useYn: true, createdBy: '김철수', createdAt: '2023-01-10', updatedBy: '이영희', updatedAt: '2023-06-15' },
      { id: '002', type: '완제품', name: '키보드', spec: '기계식, 텐키리스', unit: 'EA', price: 80000, defaultQuantity: 1, warehouse: '완제품창고', useYn: true, createdBy: '김철수', createdAt: '2023-01-15', updatedBy: '이영희', updatedAt: '2023-06-20' },
      { id: '003', type: '원자재', name: '알루미늄', spec: '1mm 두께', unit: 'KG', price: 30000, defaultQuantity: 100, warehouse: '원자재창고', useYn: true, createdBy: '박지성', createdAt: '2023-02-10', updatedBy: '박지성', updatedAt: '2023-02-10' },
      { id: '004', type: '부자재', name: '나사', spec: '5mm x 10mm', unit: 'BOX', price: 5000, defaultQuantity: 1000, warehouse: '부자재창고', useYn: false, createdBy: '이민정', createdAt: '2023-03-05', updatedBy: '김철수', updatedAt: '2023-07-01' }
    ];
    
    setProductList(dummyData);
  };

  // 행 추가 핸들러
  const handleAddRow = () => {
    const newProduct = {
      id: `NEW_${Date.now()}`,
      type: '',
      name: '',
      spec: '',
      unit: '',
      price: 0,
      defaultQuantity: 0,
      warehouse: '',
      useYn: true,
      createdBy: '시스템',
      createdAt: new Date().toISOString().split('T')[0],
      updatedBy: '시스템',
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setProductList([...productList, newProduct]);
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

  // 제품 목록 그리드 컬럼 정의
  const productColumns = [
    { field: 'type', headerName: '제품유형', width: 100, editable: true },
    { field: 'id', headerName: '제품 ID', width: 100 },
    { field: 'name', headerName: '제품명', width: 180, editable: true },
    { field: 'spec', headerName: '규격', width: 150, editable: true },
    { field: 'unit', headerName: '단위', width: 80, editable: true },
    { field: 'price', headerName: '단가', width: 100, type: 'number', editable: true },
    { field: 'defaultQuantity', headerName: '기본수량', width: 100, type: 'number', editable: true },
    { field: 'warehouse', headerName: '보관창고', width: 120, editable: true },
    { 
      field: 'useYn', 
      headerName: '사용 여부', 
      width: 100, 
      type: 'boolean',
      editable: true
    },
    { field: 'createdBy', headerName: '등록자', width: 100 },
    { field: 'createdAt', headerName: '등록일', width: 110 },
    { field: 'updatedBy', headerName: '수정자', width: 100 },
    { field: 'updatedAt', headerName: '수정일', width: 110 }
  ];

  // 제품 목록 그리드 버튼
  const productGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: <SearchIcon /> },
    { label: '행추가', onClick: handleAddRow, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> }
  ];

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
          제품관리
        </Typography>
        <IconButton
          onClick={() => setIsHelpModalOpen(true)}
          sx={{
            ml: 1,
            color: isDarkMode ? theme.palette.primary.light : theme.palette.primary.main,
            '&:hover': {
              backgroundColor: isDarkMode 
                ? alpha(theme.palette.primary.light, 0.1)
                : alpha(theme.palette.primary.main, 0.05)
            }
          }}
        >
          <HelpOutlineIcon />
        </IconButton>
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
          <Grid item xs={12}>
            <MuiDataGridWrapper
              title="제품 정보"
              rows={productList}
              columns={productColumns}
              buttons={productGridButtons}
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
            • 제품관리에서는 최종 판매되는 제품 정보를 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 제품별로 규격, 단가, 기본수량 등 상세 정보를 관리하여 판매 과정의 효율성을 높일 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 제품 코드, 제품명, 규격, 단위 등 기본 정보를 정확하게 입력하여 BOM 및 생산계획에 활용할 수 있습니다.
          </Typography>
        </Stack>
      </Box>

      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="제품관리 도움말"
      >
        <Typography variant="body2" color={getTextColor()}>
          • 제품관리에서는 생산하는 제품의 기본 정보를 등록하고 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 제품코드, 제품명, 규격, 단위 등의 정보를 관리하여 제품 정보를 체계적으로 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 제품 정보는 생산 계획, 재고 관리, 출하 관리 등에서 활용됩니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default ProductManagement;
