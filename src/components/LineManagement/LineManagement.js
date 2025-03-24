import React, { useState, useEffect } from 'react';
import './LineManagement.css';
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
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const LineManagement = (props) => {
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
      lineId: '',
      lineName: '',
      status: '',
      useYn: ''
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [lineList, setLineList] = useState([]);
  const [selectedLine, setSelectedLine] = useState(null);
  const [lineDetail, setLineDetail] = useState(null);

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
      factoryCode: '',
      lineId: '',
      lineName: '',
      status: '',
      useYn: ''
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: 'LINE001', name: '1라인', factoryId: 'FAC001', factoryName: '서울공장', status: '가동중', useYn: 'Y' },
      { id: 'LINE002', name: '2라인', factoryId: 'FAC001', factoryName: '서울공장', status: '대기중', useYn: 'Y' },
      { id: 'LINE003', name: '1라인', factoryId: 'FAC002', factoryName: '부산공장', status: '점검중', useYn: 'N' },
      { id: 'LINE004', name: '2라인', factoryId: 'FAC002', factoryName: '부산공장', status: '가동중', useYn: 'Y' },
      { id: 'LINE005', name: '3라인', factoryId: 'FAC002', factoryName: '부산공장', status: '대기중', useYn: 'Y' }
    ];
    
    setLineList(dummyData);
    setSelectedLine(null);
    setLineDetail(null);
  };

  // 라인 선택 핸들러
  const handleLineSelect = (params) => {
    const line = lineList.find(l => l.id === params.id);
    setSelectedLine(line);
    
    // 라인 상세 정보 (실제로는 API 호출)
    const detailData = {
      ...line,
      description: '생산 라인',
      registDate: '2023-01-15',
      updateDate: '2023-06-20',
      registUser: '자동입력',
      updateUser: '자동입력'
    };
    
    setLineDetail([detailData]);
  };

  // 등록 버튼 클릭 핸들러
  const handleAdd = () => {
    const newLine = {
      id: `NEW_${Date.now()}`,
      name: '',
      factoryId: '',
      factoryName: '',
      status: '대기중',
      useYn: 'Y',
      description: '',
      registDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      registUser: '시스템',
      updateUser: '시스템'
    };
    
    setLineList([...lineList, newLine]);
    setSelectedLine(newLine);
    setLineDetail([newLine]);
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
    if (!selectedLine) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 라인을 선택해주세요.',
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
        const updatedList = lineList.filter(l => l.id !== selectedLine.id);
        setLineList(updatedList);
        setSelectedLine(null);
        setLineDetail(null);
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

  // 라인 목록 그리드 컬럼 정의
  const lineColumns = [
    { field: 'id', headerName: '라인 ID', width: 100 },
    { field: 'name', headerName: '라인 명', width: 100 },
    { field: 'factoryId', headerName: '공장 ID', width: 100 },
    { field: 'factoryName', headerName: '공장 명', width: 150 },
    { 
      field: 'status', 
      headerName: '상태', 
      width: 100,
      renderCell: (params) => {
        let color = '';
        if (params.value === '가동중') color = 'green';
        else if (params.value === '대기중') color = 'orange';
        else if (params.value === '점검중') color = 'red';
        
        return (
          <span style={{ color }}>{params.value}</span>
        );
      }
    },
    { 
      field: 'useYn', 
      headerName: '사용여부', 
      width: 100,
      valueFormatter: (params) => params.value === 'Y' ? '사용' : '미사용'
    }
  ];
  
  // 라인 상세 정보 그리드 컬럼 정의
  const detailColumns = [
    { field: 'id', headerName: '라인ID', width: 100, editable: true },
    { field: 'name', headerName: '라인 명', width: 120, editable: true },
    { field: 'factoryId', headerName: '공장ID', width: 100, editable: true },
    { field: 'factoryName', headerName: '공장 명', width: 150, editable: true },
    { 
      field: 'status', 
      headerName: '상태', 
      width: 100, 
      editable: true,
      type: 'singleSelect',
      valueOptions: ['가동중', '대기중', '점검중']
    },
    { field: 'description', headerName: '설명', width: 200, editable: true },
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

  // 라인 목록 그리드 버튼
  const lineGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: null }
  ];

  // 라인 상세 그리드 버튼
  const detailGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
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
          라인정보관리
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
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="status-label">상태</InputLabel>
                <Select
                  {...field}
                  labelId="status-label"
                  label="상태"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="가동중">가동중</MenuItem>
                  <MenuItem value="대기중">대기중</MenuItem>
                  <MenuItem value="점검중">점검중</MenuItem>
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
          {/* 라인 목록 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title="라인 목록"
              rows={lineList}
              columns={lineColumns}
              buttons={lineGridButtons}
              height={450}
              onRowClick={handleLineSelect}
            />
          </Grid>
          
          {/* 라인 상세 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title={`라인 상세 정보 ${selectedLine ? '- ' + selectedLine.name : ''}`}
              rows={lineDetail || []}
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
            • 라인관리에서는 공장 내 생산라인의 정보를 등록, 수정, 삭제할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 라인을 선택하면 해당 라인의 상세 정보를 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 라인 등록 시 라인코드, 라인명, 공장, 설비구성 등의 정보를 입력해야 합니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default LineManagement; 