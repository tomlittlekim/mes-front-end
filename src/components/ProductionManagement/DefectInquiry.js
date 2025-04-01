import React, { useState, useEffect } from 'react';
import './DefectInquiry.css';
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
  alpha,
  Chip
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import HelpModal from '../Common/HelpModal';

const DefectInquiry = (props) => {
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
      defectType: '',
      fromDate: null,
      toDate: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [defectList, setDefectList] = useState([]);
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [defectDetails, setDefectDetails] = useState(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // 초기화 함수
  const handleReset = () => {
    reset({
      productId: '',
      productName: '',
      defectType: '',
      fromDate: null,
      toDate: null
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: 'DF2024001', productionId: 'PR2024001', workOrderId: 'WO2024001', productId: 'PD001', productName: '제품A', defectDate: '2024-04-17', defectType: '외관불량', defectCount: 12, defectReason: '스크래치', facility: '1공장 3라인', inspector: '홍길동', status: '확인완료', processDate: '2024-04-17', processResult: '폐기' },
      { id: 'DF2024002', productionId: 'PR2024001', workOrderId: 'WO2024001', productId: 'PD001', productName: '제품A', defectDate: '2024-04-17', defectType: '기능불량', defectCount: 8, defectReason: '동작불량', facility: '1공장 3라인', inspector: '홍길동', status: '확인완료', processDate: '2024-04-17', processResult: '재작업' },
      { id: 'DF2024003', productionId: 'PR2024002', workOrderId: 'WO2024002', productId: 'PD002', productName: '제품B', defectDate: '2024-04-18', defectType: '치수불량', defectCount: 6, defectReason: '규격초과', facility: '1공장 2라인', inspector: '김철수', status: '확인완료', processDate: '2024-04-18', processResult: '폐기' },
      { id: 'DF2024004', productionId: 'PR2024002', workOrderId: 'WO2024002', productId: 'PD002', productName: '제품B', defectDate: '2024-04-18', defectType: '외관불량', defectCount: 4, defectReason: '색상불량', facility: '1공장 2라인', inspector: '김철수', status: '확인완료', processDate: '2024-04-18', processResult: '재작업' },
      { id: 'DF2024005', productionId: 'PR2024004', workOrderId: 'WO2024004', productId: 'PD004', productName: '제품D', defectDate: '2024-04-19', defectType: '기능불량', defectCount: 5, defectReason: '전기접촉불량', facility: '1공장 1라인', inspector: '박성준', status: '처리중', processDate: '', processResult: '' }
    ];
    
    setDefectList(dummyData);
    setSelectedDefect(null);
    setDefectDetails(null);
  };

  // 불량 선택 핸들러
  const handleDefectSelect = (params) => {
    const defect = defectList.find(d => d.id === params.id);
    setSelectedDefect(defect);
    
    if (!defect) return;
    
    // 불량 상세 정보 (실제로는 API 호출)
    const detailData = [
      {
        id: defect.id,
        productionId: defect.productionId,
        workOrderId: defect.workOrderId,
        productId: defect.productId, 
        productName: defect.productName,
        defectDate: defect.defectDate,
        defectTime: '14:30',
        defectType: defect.defectType,
        defectCount: defect.defectCount,
        defectReason: defect.defectReason,
        defectDetail: `${defect.defectReason}으로 인한 제품 품질 기준 미달`,
        facility: defect.facility,
        lineId: defect.facility.split(' ')[1],
        factoryId: defect.facility.split(' ')[0],
        inspector: defect.inspector,
        inspectorId: 'EMP001',
        manager: '김관리',
        managerId: 'EMP010',
        status: defect.status,
        processMethod: defect.processResult || '대기중',
        processDate: defect.processDate || '',
        processTime: defect.processDate ? '16:00' : '',
        processUser: defect.processDate ? '이처리' : '',
        processUserId: defect.processDate ? 'EMP015' : '',
        causeAnalysis: defect.processDate ? '설비 오작동 및 작업자 실수' : '',
        preventionMeasure: defect.processDate ? '설비 점검 주기 단축 및 작업자 교육 강화' : '',
        note: '품질관리부서 최종 확인 필요',
        createdDate: defect.defectDate,
        updatedDate: defect.processDate || defect.defectDate,
        createdBy: defect.inspector,
        updatedBy: defect.processDate ? '이처리' : defect.inspector
      }
    ];
    
    setDefectDetails(detailData);
  };

  // 출력 핸들러
  const handlePrint = () => {
    if (!selectedDefect) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '출력할 불량정보를 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    Swal.fire({
      icon: 'info',
      title: '불량정보 출력',
      text: '불량정보가 출력됩니다.',
      confirmButtonText: '확인'
    });
  };

  // 엑셀 다운로드 핸들러
  const handleExport = () => {
    Swal.fire({
      icon: 'info',
      title: '엑셀 내보내기',
      text: '불량정보 데이터가 엑셀로 내보내집니다.',
      confirmButtonText: '확인'
    });
  };

  // 분석 핸들러
  const handleAnalysis = () => {
    Swal.fire({
      icon: 'info',
      title: '불량 분석',
      text: '불량 유형별 분석 화면으로 이동합니다.',
      confirmButtonText: '확인'
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

  // 불량 목록 그리드 컬럼 정의
  const defectColumns = [
    { field: 'id', headerName: '불량ID', width: 110 },
    { field: 'productionId', headerName: '생산실적ID', width: 120 },
    { field: 'workOrderId', headerName: '작업지시ID', width: 120 },
    { field: 'productName', headerName: '제품명', width: 150, flex: 1 },
    { 
      field: 'defectType', 
      headerName: '불량유형', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={
            params.value === '외관불량' ? 'warning' : 
            params.value === '기능불량' ? 'error' : 
            params.value === '치수불량' ? 'primary' : 
            'default'
          } 
          variant="outlined"
        />
      )
    },
    { field: 'defectCount', headerName: '불량수량', width: 90, type: 'number' },
    { field: 'defectReason', headerName: '불량사유', width: 120 },
    { field: 'facility', headerName: '발생설비', width: 120 },
    { field: 'defectDate', headerName: '발생일자', width: 110 },
    { field: 'inspector', headerName: '검사자', width: 90 },
    { 
      field: 'status', 
      headerName: '상태', 
      width: 100,
      cellClassName: (params) => {
        if (params.value === '확인필요') return 'status-wait';
        if (params.value === '처리중') return 'status-inprogress';
        if (params.value === '확인완료') return 'status-completed';
        return '';
      }
    },
    { field: 'processResult', headerName: '처리결과', width: 100 }
  ];
  
  // 불량 상세 정보 그리드 컬럼 정의
  const detailColumns = [
    { field: 'id', headerName: '불량ID', width: 110 },
    { field: 'productionId', headerName: '생산실적ID', width: 120 },
    { field: 'workOrderId', headerName: '작업지시ID', width: 120 },
    { field: 'productId', headerName: '제품ID', width: 100 },
    { field: 'productName', headerName: '제품명', width: 150 },
    { field: 'defectDate', headerName: '발생일자', width: 110 },
    { field: 'defectTime', headerName: '발생시각', width: 90 },
    { field: 'defectType', headerName: '불량유형', width: 100 },
    { field: 'defectCount', headerName: '불량수량', width: 90, type: 'number' },
    { field: 'defectReason', headerName: '불량사유', width: 120 },
    { field: 'defectDetail', headerName: '상세내용', width: 180 },
    { field: 'facility', headerName: '발생설비', width: 120 },
    { field: 'factoryId', headerName: '공장', width: 80 },
    { field: 'lineId', headerName: '라인', width: 80 },
    { field: 'inspector', headerName: '검사자', width: 90 },
    { field: 'manager', headerName: '관리자', width: 90 },
    { field: 'status', headerName: '상태', width: 100 },
    { field: 'processMethod', headerName: '처리방법', width: 100 },
    { field: 'processDate', headerName: '처리일자', width: 110 },
    { field: 'processTime', headerName: '처리시각', width: 90 },
    { field: 'processUser', headerName: '처리자', width: 90 },
    { field: 'causeAnalysis', headerName: '원인분석', width: 180 },
    { field: 'preventionMeasure', headerName: '방지대책', width: 180 },
    { field: 'note', headerName: '비고', width: 150 },
    { field: 'createdDate', headerName: '등록일', width: 110 },
    { field: 'updatedDate', headerName: '수정일', width: 110 },
    { field: 'createdBy', headerName: '등록자', width: 90 },
    { field: 'updatedBy', headerName: '수정자', width: 90 }
  ];

  // 불량 목록 그리드 버튼
  const defectGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: <SearchIcon /> },
    { label: '분석', onClick: handleAnalysis, icon: <AnalyticsIcon /> },
    { label: '출력', onClick: handlePrint, icon: <PrintIcon /> },
    { label: '엑셀', onClick: handleExport, icon: <FileDownloadIcon /> }
  ];

  // 불량 상세 그리드 버튼
  const detailGridButtons = [];

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
          불량조회
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
                label="제품코드"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="제품코드를 입력하세요"
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
            name="defectType"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="defectType-label">불량유형</InputLabel>
                <Select
                  {...field}
                  labelId="defectType-label"
                  label="불량유형"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="외관불량">외관불량</MenuItem>
                  <MenuItem value="기능불량">기능불량</MenuItem>
                  <MenuItem value="치수불량">치수불량</MenuItem>
                  <MenuItem value="기타">기타</MenuItem>
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
          title="불량조회"
          rows={defectList}
          columns={defectColumns}
          buttons={defectGridButtons}
          height={500}
        />
      )}
      
      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="불량조회 도움말"
      >
        <Typography variant="body2" color={getTextColor()}>
          • 불량조회에서는 제품별 불량 발생 현황을 조회할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 제품코드, 제품명, 불량유형, 기간으로 검색하여 원하는 불량 정보를 확인할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 불량 발생 추이를 분석하여 품질 개선에 활용할 수 있습니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default DefectInquiry; 