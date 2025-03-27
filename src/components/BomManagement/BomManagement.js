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
  Stack,
  IconButton,
  alpha
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import HelpModal from '../Common/HelpModal';

const BomManagement = (props) => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';

  // React Hook Form 설정
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      productId: '',
      productName: '',
      version: '',
      useYn: ''
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [bomList, setBomList] = useState([]);
  const [selectedBom, setSelectedBom] = useState(null);
  const [bomDetail, setBomDetail] = useState(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

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
      productId: '',
      productName: '',
      version: '',
      useYn: ''
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

    setBomList(dummyData);
    setBomDetail(null);
    setSelectedBom(null);
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
    if (!selectedBom) {
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
  const handleBomSelect = (params) => {
    const product = bomList.find(p => p.id === params.id);
    setSelectedBom(product);

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
      setBomDetail({
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
    { label: '상세관리', onClick: handleDetail, icon: <EditIcon /> }
  ];

  // BOM 상세 정보 그리드 컬럼 정의
  const detailColumns = [
    { field: 'bomId', headerName: 'BOM ID', width: 100 },
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

  // BOM 상세 정보 그리드 버튼
  const detailGridButtons = [
    { label: '수정', onClick: handleDetail, icon: <EditIcon /> },
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
          BOM 관리
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
            name="version"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="버전"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="버전을 입력하세요"
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
      </SearchCondition>

      {/* 그리드 영역 */}
      {!isLoading && (
        <Grid container spacing={2}>
          {/* BOM 기본 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title="BOM 목록"
              rows={bomList}
              columns={bomColumns}
              buttons={productGridButtons}
              height={450}
              onRowClick={handleBomSelect}
            />
          </Grid>

          {/* BOM 상세 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title={`BOM 상세정보 ${selectedBom ? '- ' + selectedBom.name : ''}`}
              rows={bomDetail || []}
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

      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="BOM 관리 도움말"
      >
        <Typography variant="body2" color={getTextColor()}>
          • BOM 관리에서는 제품의 구성요소와 조립 방법을 관리합니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • BOM 목록에서 특정 제품을 선택하면 해당 제품의 상세 구성요소를 확인하고 편집할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 각 구성요소의 수량과 단위를 관리하여 생산 계획 수립에 활용할 수 있습니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default BomManagement;