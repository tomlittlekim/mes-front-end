import React, { useState, useEffect } from 'react';
import './BomManagement.css';
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
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const BomManagement = (props) => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // React Hook Form 설정
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      productGroup: '',
      productType: '',
      productId: '',
      productName: ''
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [productList, setProductList] = useState([]);
  const [bomList, setBomList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bomInfo, setBomInfo] = useState({
    bomId: '',
    modifierName: '',
    modifyDate: ''
  });

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
      productGroup: '',
      productType: '',
      productId: '',
      productName: ''
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: '40001', category: '완제품', type: '빵류', name: '블루베리머핀', spec: '50g', unit: 'BX', quantity: 10, useYn: 'Y' },
      { id: '40002', category: '반제품', type: '반죽류', name: '반죽_블루베리머핀', spec: '500g', unit: 'g', quantity: 1, useYn: 'Y' }
    ];
    
    setProductList(dummyData);
    setBomList([]);
    setSelectedProduct(null);
    setBomInfo({
      bomId: '',
      modifierName: '',
      modifyDate: ''
    });
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
    Swal.fire({
      icon: 'info',
      title: '알림',
      text: '등록 기능이 실행되었습니다.',
      confirmButtonText: '확인'
    });
  };

  // 상세관리 버튼 클릭 핸들러
  const handleDetail = () => {
    if (!selectedProduct) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '제품을 먼저 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    Swal.fire({
      icon: 'info',
      title: '알림',
      text: '상세관리 기능이 실행되었습니다.',
      confirmButtonText: '확인'
    });
  };

  // 제품 선택 핸들러
  const handleProductSelect = (params) => {
    const product = productList.find(p => p.id === params.id);
    setSelectedProduct(product);
    
    // 선택된 제품에 대한 BOM 정보 로드
    loadBomData(product);
  };

  // BOM 데이터 로드 함수
  const loadBomData = (product) => {
    if (!product) return;
    
    // API 호출 대신 더미 데이터 사용
    let dummyBomData = [];
    
    // 제품ID에 따라 다른 BOM 데이터 표시
    if (product.id === '40001') {
      dummyBomData = [
        { id: 'BOM001', bomLabel: 1, parentCode: '40001', parentName: '블루베리머핀', itemCategory: '반제품', itemId: '40002', itemName: '반죽_블루베리머핀', quantity: 500, unit: 'g', createdBy: '자동', createdDate: '2023-05-15', updatedBy: '자동', updatedDate: '2023-05-15' },
        { id: 'BOM002', bomLabel: 2, parentCode: '40002', parentName: '반죽_블루베리머핀', itemCategory: '원자재', itemId: 'W0001', itemName: '계란(60G)', quantity: 5, unit: 'EA', createdBy: '자동', createdDate: '2023-05-15', updatedBy: '자동', updatedDate: '2023-05-15' },
        { id: 'BOM003', bomLabel: 1, parentCode: '40002', parentName: '블루베리머핀', itemCategory: '부자재', itemId: 'BU001', itemName: '머핀포장박스', quantity: 1, unit: 'BX', createdBy: '자동', createdDate: '2023-05-15', updatedBy: '자동', updatedDate: '2023-05-15' }
      ];
      setBomInfo({
        bomId: product.id,
        modifierName: '홍길동',
        modifyDate: '2023-05-15'
      });
    }
    setBomList(dummyBomData);
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
    { field: 'id', headerName: '제품 ID', width: 100 },
    { field: 'category', headerName: '제품 구분', width: 100 },
    { field: 'type', headerName: '제품 유형', width: 100 },
    { field: 'name', headerName: '제품명', width: 200, flex: 1 },
    { field: 'spec', headerName: '규격', width: 80 },
    { field: 'unit', headerName: '단위', width: 70 },
    { field: 'quantity', headerName: '기본 수량', width: 100 },
    { 
      field: 'useYn', 
      headerName: '사용여부', 
      width: 100,
      valueFormatter: (params) => params.value === 'Y' ? '사용' : '미사용'
    }
  ];

  // BOM 목록 그리드 컬럼 정의
  const bomColumns = [
    { field: 'bomLabel', headerName: 'BOM 라벨', width: 100 },
    { field: 'parentCode', headerName: '상위품목 코드', width: 120 },
    { field: 'parentName', headerName: '상위품목명', width: 180 },
    { field: 'itemCategory', headerName: '품목 구분', width: 100 },
    { field: 'itemId', headerName: '품목 ID', width: 100 },
    { field: 'itemName', headerName: '품목명', width: 180, flex: 1 },
    { field: 'quantity', headerName: '수량', width: 70, type: 'number' },
    { field: 'unit', headerName: '단위', width: 70 },
    { field: 'createdBy', headerName: '등록자', width: 100 },
    { field: 'createdDate', headerName: '등록일', width: 120 },
    { field: 'updatedBy', headerName: '수정자', width: 100 },
    { field: 'updatedDate', headerName: '수정일', width: 120 }
  ];

  // 제품 목록 그리드 버튼
  const productGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> }
  ];

  // BOM 목록 그리드 버튼
  const bomGridButtons = [
    { label: '상세관리', onClick: handleDetail, icon: <BuildIcon /> }
  ];

  return (
    <Box sx={{ p: 2, minHeight: '100vh' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
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
          BOM 관리
        </Typography>
      </Box>

      {/* 검색 조건 영역 - 공통 컴포넌트 사용 */}
      <SearchCondition 
        onSearch={handleSubmit(handleSearch)}
        onReset={handleReset}
      >
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="productGroup"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="productGroup-label">제품구분</InputLabel>
                <Select
                  {...field}
                  labelId="productGroup-label"
                  label="제품구분"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="완제품">완제품</MenuItem>
                  <MenuItem value="반제품">반제품</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="productType"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="productType-label">제품유형</InputLabel>
                <Select
                  {...field}
                  labelId="productType-label"
                  label="제품유형"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="빵류">빵류</MenuItem>
                  <MenuItem value="반죽류">반죽류</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="productId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="제품ID"
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
      </SearchCondition>

      {/* 그리드 영역 */}
      {!isLoading && (
        <Grid container spacing={2}>
          {/* 제품 목록 그리드 */}
          <Grid item xs={12} md={5}>
            <MuiDataGridWrapper
              title="제품 목록"
              rows={productList}
              columns={productColumns}
              buttons={productGridButtons}
              height={450}
              onRowClick={handleProductSelect}
            />
          </Grid>
          
          {/* BOM 목록 그리드 */}
          <Grid item xs={12} md={7}>
            <MuiDataGridWrapper
              title={`BOM 목록 ${selectedProduct ? '- ' + selectedProduct.name : ''}`}
              rows={bomList}
              columns={bomColumns}
              buttons={bomGridButtons}
              height={450}
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
            • BOM관리에서는 제품 구성에 필요한 모든 부품과 원자재 목록을 등록, 수정, 삭제할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 제품 목록에서 제품을 선택하면 해당 제품의 BOM 정보를 확인하고 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 정확한 BOM 정보는 자재소요량 계획(MRP) 및 생산계획 수립의 기초가 됩니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default BomManagement; 