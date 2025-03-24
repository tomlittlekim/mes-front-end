import React, { useState, useEffect } from 'react';
import './WarehouseManagement.css';
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
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const WarehouseManagement = (props) => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // React Hook Form 설정
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      factoryId: '',
      factoryName: '',
      warehouseId: '',
      warehouseName: '',
      useYn: ''
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [warehouseList, setWarehouseList] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehouseDetail, setWarehouseDetail] = useState(null);

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
      factoryId: '',
      factoryName: '',
      warehouseId: '',
      warehouseName: '',
      useYn: ''
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: 'WH001', name: '원자재창고', type: '원자재', area: 500, location: '1공장 A동', factoryId: 'FC001', factoryName: '서울공장', useYn: true, createdBy: '김철수', createdAt: '2023-01-10', updatedBy: '이영희', updatedAt: '2023-06-15' },
      { id: 'WH002', name: '부자재창고', type: '부자재', area: 300, location: '1공장 B동', factoryId: 'FC001', factoryName: '서울공장', useYn: true, createdBy: '김철수', createdAt: '2023-01-15', updatedBy: '이영희', updatedAt: '2023-06-20' },
      { id: 'WH003', name: '완제품창고', type: '완제품', area: 800, location: '2공장 A동', factoryId: 'FC002', factoryName: '부산공장', useYn: true, createdBy: '박지성', createdAt: '2023-02-10', updatedBy: '박지성', updatedAt: '2023-02-10' },
      { id: 'WH004', name: '보관창고', type: '완제품', area: 600, location: '2공장 B동', factoryId: 'FC002', factoryName: '부산공장', useYn: false, createdBy: '이민정', createdAt: '2023-03-05', updatedBy: '김철수', updatedAt: '2023-07-01' }
    ];
    
    setWarehouseList(dummyData);
    setSelectedWarehouse(null);
    setWarehouseDetail(null);
  };

  // 창고 선택 핸들러
  const handleWarehouseSelect = (params) => {
    const warehouse = warehouseList.find(w => w.id === params.id);
    setSelectedWarehouse(warehouse);
    
    if (!warehouse) return;
    
    // 창고 상세 정보 (실제로는 API 호출)
    const detailData = [
      { id: 1, section: 'A', zone: 'A-1', capacity: 100, currentStorage: 80, material: '알루미늄', quantity: 80, unit: 'KG' },
      { id: 2, section: 'A', zone: 'A-2', capacity: 100, currentStorage: 60, material: '구리', quantity: 60, unit: 'KG' },
      { id: 3, section: 'B', zone: 'B-1', capacity: 100, currentStorage: 30, material: '철', quantity: 30, unit: 'KG' },
      { id: 4, section: 'B', zone: 'B-2', capacity: 100, currentStorage: 0, material: '-', quantity: 0, unit: '-' }
    ];
    
    setWarehouseDetail(detailData);
  };

  // 행 추가 핸들러
  const handleAddRow = () => {
    const newWarehouse = {
      id: `NEW_${Date.now()}`,
      name: '',
      type: '',
      area: 0,
      location: '',
      factoryId: '',
      factoryName: '',
      useYn: true,
      createdBy: '시스템',
      createdAt: new Date().toISOString().split('T')[0],
      updatedBy: '시스템',
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setWarehouseList([...warehouseList, newWarehouse]);
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
    if (!selectedWarehouse) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 창고를 선택해주세요.',
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
        const updatedList = warehouseList.filter(w => w.id !== selectedWarehouse.id);
        setWarehouseList(updatedList);
        setSelectedWarehouse(null);
        setWarehouseDetail(null);
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

  // 창고 목록 그리드 컬럼 정의
  const warehouseColumns = [
    { field: 'id', headerName: '창고 ID', width: 100 },
    { field: 'name', headerName: '창고명', width: 150, editable: true },
    { field: 'type', headerName: '창고 유형', width: 120, editable: true },
    { field: 'area', headerName: '면적(㎡)', width: 100, type: 'number', editable: true },
    { field: 'location', headerName: '위치', width: 150, editable: true },
    { field: 'factoryId', headerName: '공장 ID', width: 100, editable: true },
    { field: 'factoryName', headerName: '공장명', width: 150, editable: true },
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
  
  // 창고 상세 정보 그리드 컬럼 정의
  const detailColumns = [
    { field: 'section', headerName: '구역', width: 100, editable: true },
    { field: 'zone', headerName: '존', width: 100, editable: true },
    { field: 'capacity', headerName: '수용량', width: 100, type: 'number', editable: true },
    { field: 'currentStorage', headerName: '현재보관량', width: 110, type: 'number', editable: true },
    { field: 'material', headerName: '자재명', width: 150, editable: true },
    { field: 'quantity', headerName: '수량', width: 100, type: 'number', editable: true },
    { field: 'unit', headerName: '단위', width: 80, editable: true }
  ];

  // 창고 목록 그리드 버튼
  const warehouseGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: <SearchIcon /> },
    { label: '행추가', onClick: handleAddRow, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> }
  ];

  // 창고 상세 그리드 버튼
  const detailGridButtons = [
    { label: '수정', onClick: () => {}, icon: <EditIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
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
          창고관리
        </Typography>
      </Box>

      {/* 검색 조건 영역 - 공통 컴포넌트 사용 */}
      <SearchCondition 
        onSearch={handleSubmit(handleSearch)}
        onReset={handleReset}
      >
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="factoryId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="공장 ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="공장 ID를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="factoryName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="공장명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="공장명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="warehouseId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="창고 ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="창고 ID를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="warehouseName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="창고명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="창고명을 입력하세요"
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
          {/* 창고 기본 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title="창고 목록"
              rows={warehouseList}
              columns={warehouseColumns}
              buttons={warehouseGridButtons}
              height={450}
              onRowClick={handleWarehouseSelect}
              gridProps={{
                editMode: 'row'
              }}
            />
          </Grid>
          
          {/* 창고 상세 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title={`재고 현황 ${selectedWarehouse ? '- ' + selectedWarehouse.name : ''}`}
              rows={warehouseDetail || []}
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
            • 창고관리에서는 공장 및 창고 정보를 등록, 수정, 삭제할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 창고를 선택하면 해당 창고의 상세 정보를 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 창고 등록 시 창고코드, 창고명, 위치, 관리자 등의 정보를 입력해야 합니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default WarehouseManagement;
