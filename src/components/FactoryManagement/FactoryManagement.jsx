import React, { useState, useEffect } from 'react';
import './FactoryManagement.css';
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
  Button,
  FormHelperText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { MuiDataGridWrapper, SearchCondition, EnhancedDataGridWrapper } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const FactoryManagement = (props) => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';

  // React Hook Form 설정
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      factoryId: '',
      factoryName: '',
      factoryCode: '',
      useYn: 'all'
    }
  });
  
  // 상태 관리
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [factoryDetail, setFactoryDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 더미 데이터
  const [factoryList, setFactoryList] = useState([
    { id: 'FAC001', name: '서울공장', code: 'S001', useYn: 'Y', address: '서울특별시 강남구 테헤란로 123', phone: '02-1234-5678', manager: '홍길동' },
    { id: 'FAC002', name: '부산공장', code: 'B001', useYn: 'Y', address: '부산광역시 해운대구 센텀중앙로 123', phone: '051-321-4567', manager: '김영희' },
    { id: 'FAC003', name: '대구공장', code: 'D001', useYn: 'N', address: '대구광역시 동구 동대구로 123', phone: '053-456-7890', manager: '박철수' },
    { id: 'FAC004', name: '인천공장', code: 'I001', useYn: 'Y', address: '인천광역시 남동구 남동대로 123', phone: '032-567-8901', manager: '이영수' },
    { id: 'FAC005', name: '광주공장', code: 'G001', useYn: 'Y', address: '광주광역시 북구 첨단과기로 123', phone: '062-678-9012', manager: '정민지' }
  ]);

  // 검색 조건 변경 핸들러
  const handleSearch = (data) => {
    console.log('Search with:', data);
    // 실제로는 API 호출하여 검색 조건에 맞는 데이터를 가져옴
  };

  // 초기화 함수
  const handleReset = () => {
    reset({
      factoryId: '',
      factoryName: '',
      factoryCode: '',
      useYn: 'all'
    });
  };

  // 공장 선택 핸들러
  const handleFactorySelect = (params) => {
    const factory = factoryList.find(f => f.id === params.id);
    setSelectedFactory(factory);
    
    // 공장 상세 정보 (실제로는 API 호출)
    const detailData = {
      ...factory,
      registDate: '2023-01-15',
      updateDate: '2023-06-20',
      registUser: '자동입력',
      updateUser: '자동입력',
      usagePurpose: '제조'
    };
    
    setFactoryDetail([detailData]);
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

  // 등록 버튼 클릭 핸들러
  const handleAdd = () => {
    const newFactory = {
      id: `NEW_${Date.now()}`,
      name: '',
      code: '',
      useYn: 'Y',
      address: '',
      phone: '',
      manager: '',
      registDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      registUser: '시스템',
      updateUser: '시스템',
      usagePurpose: ''
    };
    
    setFactoryList([...factoryList, newFactory]);
    setSelectedFactory(newFactory);
    setFactoryDetail([newFactory]);
  };

  // 삭제 버튼 클릭 핸들러
  const handleDelete = () => {
    if (!selectedFactory) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 공장을 선택해주세요.',
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
        const updatedList = factoryList.filter(f => f.id !== selectedFactory.id);
        setFactoryList(updatedList);
        setSelectedFactory(null);
        setFactoryDetail(null);
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
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // 공장 목록 그리드 컬럼 정의
  const factoryColumns = [
    { field: 'id', headerName: '공장 ID', width: 100 },
    { field: 'name', headerName: '공장 명', width: 150 },
    { field: 'code', headerName: '공장 코드', width: 100 },
    { 
      field: 'useYn', 
      headerName: '사용여부', 
      width: 100,
      valueFormatter: (params) => params.value === 'Y' ? '사용' : '미사용'
    },
    { field: 'address', headerName: '주소', width: 250, flex: 1 },
    { field: 'phone', headerName: '전화번호', width: 150 },
    { field: 'manager', headerName: '담당자', width: 100 }
  ];
  
  // 공장 상세 정보 그리드 컬럼 정의
  const detailColumns = [
    { field: 'id', headerName: '공장ID', width: 100, editable: true },
    { field: 'name', headerName: '공장 명', width: 150, editable: true },
    { field: 'code', headerName: '공장코드', width: 100, editable: true },
    { field: 'address', headerName: '주소', width: 250, flex: 1, editable: true },
    { field: 'phone', headerName: '전화번호', width: 150, editable: true },
    { field: 'manager', headerName: '담당자 명', width: 100, editable: true },
    { 
      field: 'useYn', 
      headerName: '사용 여부', 
      width: 100, 
      type: 'singleSelect',
      valueOptions: ['Y', 'N'],
      valueFormatter: (params) => params.value === 'Y' ? '사용' : '미사용',
      editable: true 
    },
    { field: 'usagePurpose', headerName: '용도', width: 100, editable: true },
    { field: 'registUser', headerName: '등록자', width: 100 },
    { field: 'registDate', headerName: '등록일', width: 120 },
    { field: 'updateUser', headerName: '수정자', width: 100 },
    { field: 'updateDate', headerName: '수정일', width: 120 }
  ];

  // 공장 목록 그리드 버튼
  const factoryGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: null }
  ];

  // 공장 상세 그리드 버튼
  const detailGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
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
          공장정보관리
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
                placeholder="공장ID를 입력하세요"
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
                label="공장 명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="공장 명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="factoryCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="공장코드"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="공장코드를 입력하세요"
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
                  <MenuItem value="all">전체</MenuItem>
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
          {/* 공장 목록 그리드 */}
          <Grid item xs={12} md={6}>
            <EnhancedDataGridWrapper
              title="공장 목록"
              rows={factoryList}
              columns={factoryColumns}
              buttons={factoryGridButtons}
              height={450}
              onRowClick={handleFactorySelect}
              tabId={props.tabId + "-factories"}
            />
          </Grid>
          
          {/* 공장 상세 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <EnhancedDataGridWrapper
              title={`공장 상세 정보 ${selectedFactory ? '- ' + selectedFactory.name : ''}`}
              rows={factoryDetail || []}
              columns={detailColumns}
              buttons={detailGridButtons}
              height={450}
              gridProps={{
                editMode: 'row'
              }}
              tabId={props.tabId + "-factoryDetails"}
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
            • 공장관리에서는 기업의 공장 시설 정보를 등록, 수정, 삭제할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 공장 목록에서 공장을 선택하면 해당 공장의 상세 정보를 확인하고 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 공장별 위치, 면적, 가동 상태 등 기본 정보를 관리하여 생산 환경을 효율적으로 관리할 수 있습니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default FactoryManagement; 