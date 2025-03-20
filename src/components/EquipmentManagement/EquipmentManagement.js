import React, { useState, useEffect } from 'react';
import './EquipmentManagement.css';
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
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';

const EquipmentManagement = () => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // React Hook Form 설정
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      factoryId: '',
      factoryName: '',
      lineId: '',
      lineName: '',
      equipmentId: '',
      equipmentName: '',
      equipmentSn: '',
      equipmentType: '',
      useYn: ''
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [equipmentDetail, setEquipmentDetail] = useState(null);

  // 초기화 함수
  const handleReset = () => {
    reset({
      factoryId: '',
      factoryName: '',
      lineId: '',
      lineName: '',
      equipmentId: '',
      equipmentName: '',
      equipmentSn: '',
      equipmentType: '',
      useYn: ''
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: 'EQ001', name: '프레스기1', factoryId: 'FAC001', factoryName: '서울공장', lineId: 'LINE001', lineName: '1라인', type: '프레스', sn: 'SN001', useYn: 'Y' },
      { id: 'EQ002', name: '컷팅기1', factoryId: 'FAC001', factoryName: '서울공장', lineId: 'LINE001', lineName: '1라인', type: '절단', sn: 'SN002', useYn: 'Y' },
      { id: 'EQ003', name: '조립기1', factoryId: 'FAC001', factoryName: '서울공장', lineId: 'LINE002', lineName: '2라인', type: '조립', sn: 'SN003', useYn: 'Y' },
      { id: 'EQ004', name: '테스트기1', factoryId: 'FAC002', factoryName: '부산공장', lineId: 'LINE003', lineName: '1라인', type: '검사', sn: 'SN004', useYn: 'N' },
      { id: 'EQ005', name: '패키징기1', factoryId: 'FAC002', factoryName: '부산공장', lineId: 'LINE004', lineName: '2라인', type: '포장', sn: 'SN005', useYn: 'Y' }
    ];
    
    setEquipmentList(dummyData);
    setSelectedEquipment(null);
    setEquipmentDetail(null);
  };

  // 설비 선택 핸들러
  const handleEquipmentSelect = (params) => {
    const equipment = equipmentList.find(e => e.id === params.id);
    setSelectedEquipment(equipment);
    
    // 설비 상세 정보 (실제로는 API 호출)
    const detailData = {
      ...equipment,
      status: '정상',
      description: '생산 설비',
      lastMaintenance: '2024-02-15',
      nextMaintenance: '2024-05-15',
      registDate: '2023-01-15',
      updateDate: '2023-06-20',
      registUser: '자동입력',
      updateUser: '자동입력'
    };
    
    setEquipmentDetail([detailData]);
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
    if (!selectedEquipment) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 설비를 선택해주세요.',
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
        const updatedList = equipmentList.filter(e => e.id !== selectedEquipment.id);
        setEquipmentList(updatedList);
        setSelectedEquipment(null);
        setEquipmentDetail(null);
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
    const newEquipment = {
      id: `NEW_${Date.now()}`,
      name: '',
      factoryId: '',
      factoryName: '',
      lineId: '',
      lineName: '',
      type: '',
      sn: '',
      useYn: 'Y',
      status: '정상',
      description: '',
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: new Date().toISOString().split('T')[0],
      registDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      registUser: '시스템',
      updateUser: '시스템'
    };
    
    setEquipmentList([...equipmentList, newEquipment]);
    setSelectedEquipment(newEquipment);
    setEquipmentDetail([newEquipment]);
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

  // 설비 목록 그리드 컬럼 정의
  const equipmentColumns = [
    { field: 'id', headerName: '설비 ID', width: 100 },
    { field: 'name', headerName: '설비 명', width: 120 },
    { field: 'factoryId', headerName: '공장 ID', width: 100 },
    { field: 'factoryName', headerName: '공장 명', width: 150 },
    { field: 'lineId', headerName: '라인 ID', width: 100 },
    { field: 'lineName', headerName: '라인 명', width: 120 },
    { field: 'type', headerName: '설비 유형', width: 100 },
    { field: 'sn', headerName: '설비 S/N', width: 120 },
    { 
      field: 'useYn', 
      headerName: '사용여부', 
      width: 100,
      valueFormatter: (params) => params.value === 'Y' ? '사용' : '미사용'
    }
  ];
  
  // 설비 상세 정보 그리드 컬럼 정의
  const detailColumns = [
    { field: 'id', headerName: '설비ID', width: 100, editable: true },
    { field: 'name', headerName: '설비 명', width: 120, editable: true },
    { field: 'factoryId', headerName: '공장ID', width: 100, editable: true },
    { field: 'factoryName', headerName: '공장 명', width: 150, editable: true },
    { field: 'lineId', headerName: '라인ID', width: 100, editable: true },
    { field: 'lineName', headerName: '라인 명', width: 120, editable: true },
    { field: 'type', headerName: '설비 유형', width: 120, editable: true },
    { field: 'sn', headerName: '설비 S/N', width: 120, editable: true },
    { field: 'status', headerName: '상태', width: 100, editable: true },
    { field: 'description', headerName: '설명', width: 200, editable: true },
    { field: 'lastMaintenance', headerName: '최근 점검일', width: 120, editable: true },
    { field: 'nextMaintenance', headerName: '다음 점검일', width: 120, editable: true },
    { 
      field: 'useYn', 
      headerName: '사용 여부', 
      width: 100,
      type: 'singleSelect',
      valueOptions: ['Y', 'N'],
      valueFormatter: (params) => params.value === 'Y' ? '사용' : '미사용',
      editable: true 
    },
    { field: 'registUser', headerName: '등록자', width: 100 },
    { field: 'registDate', headerName: '등록일', width: 120 },
    { field: 'updateUser', headerName: '수정자', width: 100 },
    { field: 'updateDate', headerName: '수정일', width: 120 }
  ];

  // 설비 목록 그리드 버튼
  const equipmentGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: null }
  ];

  // 설비 상세 그리드 버튼
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
          설비정보관리
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
                placeholder="공장명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="lineId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="라인 ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="라인ID를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="lineName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="라인 명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="라인명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="equipmentId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="설비 ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="설비ID를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="equipmentName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="설비 명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="설비명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="equipmentSn"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="설비 S/N"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="설비 S/N을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="equipmentType"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="equipmentType-label">설비 유형</InputLabel>
                <Select
                  {...field}
                  labelId="equipmentType-label"
                  label="설비 유형"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="프레스">프레스</MenuItem>
                  <MenuItem value="절단">절단</MenuItem>
                  <MenuItem value="조립">조립</MenuItem>
                  <MenuItem value="검사">검사</MenuItem>
                  <MenuItem value="포장">포장</MenuItem>
                </Select>
              </FormControl>
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
          {/* 설비 목록 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title="설비 목록"
              rows={equipmentList}
              columns={equipmentColumns}
              buttons={equipmentGridButtons}
              height={450}
              onRowClick={handleEquipmentSelect}
            />
          </Grid>
          
          {/* 설비 상세 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title={`설비 상세 정보 ${selectedEquipment ? '- ' + selectedEquipment.name : ''}`}
              rows={equipmentDetail || []}
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
            • 설비관리에서는 공장 내 생산에 필요한 설비 정보를 등록, 수정, 삭제할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={isDarkMode ? '#b3c5e6' : 'text.secondary'}>
            • 설비 목록에서 설비를 선택하면 해당 설비의 상세 정보를 확인하고 관리할 수 있습니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default EquipmentManagement; 