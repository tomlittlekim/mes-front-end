import React, { useState, useEffect } from 'react';
import './CommonCodeManagement.css';
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
import { SearchCondition, EnhancedDataGridWrapper } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const CommonCodeManagement = (props) => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // React Hook Form 설정
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      codeGroupId: '',
      codeGroupName: '',
      useYn: 'all'
    }
  });
  
  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  
  // 코드 그룹 데이터
  const [codeGroups, setCodeGroups] = useState([
    { id: 'CG001', name: '공장코드', description: '공장 정보 코드', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'CG002', name: '설비코드', description: '설비 정보 코드', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'CG003', name: '창고코드', description: '창고 정보 코드', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'CG004', name: '거래처코드', description: '거래처 정보 코드', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'CG005', name: '재고상태코드', description: '재고 상태 정보 코드', useYn: 'Y', regUser: '관리자', regDate: '2024-03-16' },
    { id: 'CG006', name: '부서코드', description: '부서 정보 코드', useYn: 'Y', regUser: '관리자', regDate: '2024-03-16' },
    { id: 'CG007', name: '검사코드', description: '검사 정보 코드', useYn: 'Y', regUser: '관리자', regDate: '2024-03-17' },
    { id: 'CG008', name: '불량코드', description: '불량 유형 코드', useYn: 'Y', regUser: '관리자', regDate: '2024-03-17' },
    { id: 'CG009', name: '구매처유형코드', description: '구매처 유형 코드', useYn: 'Y', regUser: '관리자', regDate: '2024-03-18' },
    { id: 'CG010', name: '사원코드', description: '사원 정보 코드', useYn: 'Y', regUser: '관리자', regDate: '2024-03-18' },
    { id: 'CG011', name: '작업구분코드', description: '작업 구분 코드', useYn: 'Y', regUser: '관리자', regDate: '2024-03-19' },
    { id: 'CG012', name: '생산라인코드', description: '생산 라인 정보 코드', useYn: 'Y', regUser: '관리자', regDate: '2024-03-19' },
    { id: 'CG013', name: '작업장코드', description: '작업장 정보 코드', useYn: 'N', regUser: '관리자', regDate: '2024-03-20' },
    { id: 'CG014', name: '출하방식코드', description: '출하 방식 코드', useYn: 'Y', regUser: '관리자', regDate: '2024-03-20' },
    { id: 'CG015', name: '단위코드', description: '단위 정보 코드', useYn: 'Y', regUser: '관리자', regDate: '2024-03-21' },
  ]);

  // 코드 데이터
  const [codes, setCodes] = useState([
    { id: 'FC001', groupId: 'CG001', name: '대전공장', description: '대전 제조 공장', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'FC002', groupId: 'CG001', name: '천안공장', description: '천안 제조 공장', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'FC003', groupId: 'CG001', name: '구미공장', description: '구미 제조 공장', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'FC004', groupId: 'CG001', name: '부산공장', description: '부산 제조 공장', useYn: 'N', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'FC005', groupId: 'CG001', name: '울산공장', description: '울산 제조 공장', useYn: 'Y', regUser: '관리자', regDate: '2024-03-16' },
    { id: 'FC006', groupId: 'CG001', name: '광주공장', description: '광주 제조 공장', useYn: 'Y', regUser: '관리자', regDate: '2024-03-16' },
    { id: 'FC007', groupId: 'CG001', name: '인천공장', description: '인천 제조 공장', useYn: 'Y', regUser: '관리자', regDate: '2024-03-17' },
    { id: 'FC008', groupId: 'CG001', name: '포항공장', description: '포항 제조 공장', useYn: 'N', regUser: '관리자', regDate: '2024-03-17' },
    
    { id: 'EQ001', groupId: 'CG002', name: '자동선반', description: '자동 선반 설비', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'EQ002', groupId: 'CG002', name: 'CNC가공기', description: 'CNC 가공 설비', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'EQ003', groupId: 'CG002', name: '사출기', description: '플라스틱 사출 설비', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'EQ004', groupId: 'CG002', name: '조립로봇', description: '자동 조립 로봇', useYn: 'N', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'EQ005', groupId: 'CG002', name: '검사장비', description: '자동 검사 장비', useYn: 'Y', regUser: '관리자', regDate: '2024-03-16' },
    { id: 'EQ006', groupId: 'CG002', name: '레이저절단기', description: '레이저 절단 설비', useYn: 'Y', regUser: '관리자', regDate: '2024-03-16' },
    
    { id: 'WH001', groupId: 'CG003', name: '본사창고', description: '본사 주 창고', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'WH002', groupId: 'CG003', name: '자재창고', description: '원자재 보관 창고', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'WH003', groupId: 'CG003', name: '2공장창고', description: '2공장 내 창고', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'WH004', groupId: 'CG003', name: '완제품창고', description: '완제품 보관 창고', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'WH005', groupId: 'CG003', name: '외부임대창고', description: '외부 임대 창고', useYn: 'N', regUser: '관리자', regDate: '2024-03-16' },
    
    { id: 'CU001', groupId: 'CG004', name: '삼성전자', description: '삼성전자 거래처', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'CU002', groupId: 'CG004', name: 'LG전자', description: 'LG전자 거래처', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'CU003', groupId: 'CG004', name: '현대자동차', description: '현대자동차 거래처', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'CU004', groupId: 'CG004', name: 'SK하이닉스', description: 'SK하이닉스 거래처', useYn: 'Y', regUser: '관리자', regDate: '2024-03-15' },
    { id: 'CU005', groupId: 'CG004', name: '포스코', description: '포스코 거래처', useYn: 'N', regUser: '관리자', regDate: '2024-03-16' },
    { id: 'CU006', groupId: 'CG004', name: '한화시스템', description: '한화시스템 거래처', useYn: 'Y', regUser: '관리자', regDate: '2024-03-16' },
    
    { id: 'ST001', groupId: 'CG005', name: '정상', description: '정상 재고', useYn: 'Y', regUser: '관리자', regDate: '2024-03-16' },
    { id: 'ST002', groupId: 'CG005', name: '불량', description: '불량 재고', useYn: 'Y', regUser: '관리자', regDate: '2024-03-16' },
    { id: 'ST003', groupId: 'CG005', name: '폐기대기', description: '폐기 대기 재고', useYn: 'Y', regUser: '관리자', regDate: '2024-03-16' },
    { id: 'ST004', groupId: 'CG005', name: '출고대기', description: '출고 대기 재고', useYn: 'Y', regUser: '관리자', regDate: '2024-03-16' },
    
    { id: 'DP001', groupId: 'CG006', name: '관리부', description: '관리부서', useYn: 'Y', regUser: '관리자', regDate: '2024-03-16' },
    { id: 'DP002', groupId: 'CG006', name: '생산부', description: '생산부서', useYn: 'Y', regUser: '관리자', regDate: '2024-03-16' },
    { id: 'DP003', groupId: 'CG006', name: '영업부', description: '영업부서', useYn: 'Y', regUser: '관리자', regDate: '2024-03-16' },
    { id: 'DP004', groupId: 'CG006', name: '품질부', description: '품질관리부서', useYn: 'Y', regUser: '관리자', regDate: '2024-03-16' },
    { id: 'DP005', groupId: 'CG006', name: '연구개발부', description: '연구개발부서', useYn: 'Y', regUser: '관리자', regDate: '2024-03-16' },
  ]);

  // 선택된 코드 그룹 
  const [selectedCodeGroup, setSelectedCodeGroup] = useState(null);

  // 검색 실행 함수
  const onSubmit = (data) => {
    console.log('검색 실행:', data);
    // 실제로는 API 호출하여 검색 조건에 맞는 데이터를 가져옴
  };

  // 검색 조건 초기화
  const handleReset = () => {
    reset({
      codeGroupId: '',
      codeGroupName: '',
      useYn: 'all'
    });
  };

  // 코드 그룹 선택 시 이벤트 핸들러
  const handleCodeGroupSelect = (params) => {
    const codeGroup = codeGroups.find(cg => cg.id === params.id);
    setSelectedCodeGroup(codeGroup);
  };

  // 코드 필터링
  const filteredCodes = codes.filter(code => 
    selectedCodeGroup ? code.groupId === selectedCodeGroup.id : true
  );

  // 코드 추가 핸들러
  const handleAddCode = () => {
    if (!selectedCodeGroup) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '코드 그룹을 먼저 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    const newCode = {
      id: `NEW_${Date.now()}`, // 임시 ID
      groupId: selectedCodeGroup.id,
      name: '',
      description: '',
      useYn: 'Y',
      regUser: '시스템',
      regDate: new Date().toISOString().split('T')[0]
    };

    setCodes([...codes, newCode]);
  };

  // 코드 저장 핸들러
  const handleSaveCode = () => {
    Swal.fire({
      icon: 'success',
      title: '성공',
      text: '코드가 저장되었습니다.',
      confirmButtonText: '확인'
    });
  };

  // 코드 삭제 핸들러
  const handleDeleteCode = () => {
    Swal.fire({
      title: '삭제 확인',
      text: '선택한 코드를 삭제하시겠습니까?',
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
          text: '코드가 삭제되었습니다.',
          confirmButtonText: '확인'
        });
      }
    });
  };

  // 코드 그룹 저장 핸들러
  const handleSaveCodeGroup = () => {
    Swal.fire({
      icon: 'success',
      title: '성공',
      text: '코드그룹이 저장되었습니다.',
      confirmButtonText: '확인'
    });
  };

  // 코드 그룹 등록 핸들러
  const handleAddCodeGroup = () => {
    const newCodeGroup = {
      id: `NEW_${Date.now()}`, // 임시 ID
      name: '',
      description: '',
      useYn: 'Y',
      regUser: '시스템',
      regDate: new Date().toISOString().split('T')[0]
    };

    setCodeGroups([...codeGroups, newCodeGroup]);
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // 코드 그룹 DataGrid 컬럼 정의
  const codeGroupColumns = [
    { field: 'id', headerName: '코드그룹ID', width: 130 },
    { field: 'name', headerName: '코드그룹명', width: 150 },
    { field: 'description', headerName: '설명', width: 200, flex: 1 },
    { 
      field: 'useYn', 
      headerName: '사용여부', 
      width: 100,
      valueFormatter: (params) => params.value === 'Y' ? '사용' : '미사용'
    },
    { field: 'regUser', headerName: '등록자', width: 100 },
    { field: 'regDate', headerName: '등록일', width: 120 }
  ];

  // 코드 DataGrid 컬럼 정의
  const codeColumns = [
    { field: 'id', headerName: '코드ID', width: 130, editable: true },
    { field: 'name', headerName: '코드명', width: 150, editable: true },
    { field: 'description', headerName: '설명', width: 200, flex: 1, editable: true },
    { 
      field: 'useYn', 
      headerName: '사용여부', 
      width: 100,
      type: 'singleSelect',
      valueOptions: ['Y', 'N'],
      valueFormatter: (params) => params.value === 'Y' ? '사용' : '미사용',
      editable: true
    },
    { field: 'regUser', headerName: '등록자', width: 100 },
    { field: 'regDate', headerName: '등록일', width: 120 }
  ];

  // 코드 그룹 그리드 버튼
  const codeGroupButtons = [
    { label: '등록', onClick: handleAddCodeGroup, icon: <AddIcon /> },
    { label: '저장', onClick: handleSaveCodeGroup, icon: <SaveIcon /> }
  ];

  // 코드 그리드 버튼
  const codeButtons = [
    { label: '등록', onClick: handleAddCode, icon: <AddIcon /> },
    { label: '저장', onClick: handleSaveCode, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDeleteCode, icon: <DeleteIcon /> }
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
          공통코드관리
        </Typography>
      </Box>

      {/* 검색 조건 영역 - 공통 컴포넌트 사용 */}
      <SearchCondition 
        onSearch={handleSubmit(onSubmit)}
        onReset={handleReset}
      >
        <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="codeGroupId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="코드그룹ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="코드그룹ID를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="codeGroupName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="코드그룹명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="코드그룹명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
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
          {/* 코드 그룹 그리드 */}
          <Grid item xs={12} md={6}>
            <EnhancedDataGridWrapper
              title="코드 그룹"
              rows={codeGroups}
              columns={codeGroupColumns}
              buttons={codeGroupButtons}
              height={450}
              onRowClick={handleCodeGroupSelect}
              tabId={props.tabId + "-codegroup"}
            />
          </Grid>
          
          {/* 코드 그리드 */}
          <Grid item xs={12} md={6}>
            <EnhancedDataGridWrapper
              title={`코드 목록 ${selectedCodeGroup ? '- ' + selectedCodeGroup.name : ''}`}
              rows={filteredCodes}
              columns={codeColumns}
              buttons={codeButtons}
              height={450}
              gridProps={{
                editMode: 'row'
              }}
              tabId={props.tabId + "-codes"}
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
            • 공통코드관리에서는 시스템에서 사용하는 코드 그룹 및 코드 정보를 등록, 수정, 삭제할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 코드 그룹을 선택하면 해당 그룹에 속한 코드 목록을 확인하고 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 코드는 시스템 전반에서 사용되므로 코드 값과 명칭을 명확하게 입력하고 관리해야 합니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default CommonCodeManagement; 