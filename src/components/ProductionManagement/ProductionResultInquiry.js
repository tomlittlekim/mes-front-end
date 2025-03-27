import React, { useState, useEffect } from 'react';
import './ProductionResultInquiry.css';
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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import HelpModal from '../Common/HelpModal';

const ProductionResultInquiry = (props) => {
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
      productionId: '',
      workOrderId: '',
      productName: '',
      productId: '',
      startDate: null,
      endDate: null,
      status: ''
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [productionList, setProductionList] = useState([]);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [productionDetails, setProductionDetails] = useState(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // 초기화 함수
  const handleReset = () => {
    reset({
      productionId: '',
      workOrderId: '',
      productName: '',
      productId: '',
      startDate: null,
      endDate: null,
      status: ''
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: 'PR2024001', workOrderId: 'WO2024001', productId: 'PD001', productName: '제품A', facility: '1공장 3라인', productionDate: '2024-04-17', planQuantity: 1000, actualQuantity: 980, defectQuantity: 20, worker: '홍길동', status: '완료', createdDate: '2024-04-17', updatedDate: '2024-04-17' },
      { id: 'PR2024002', workOrderId: 'WO2024002', productId: 'PD002', productName: '제품B', facility: '1공장 2라인', productionDate: '2024-04-18', planQuantity: 500, actualQuantity: 490, defectQuantity: 10, worker: '김철수', status: '완료', createdDate: '2024-04-18', updatedDate: '2024-04-18' },
      { id: 'PR2024003', workOrderId: 'WO2024003', productId: 'PD003', productName: '반제품C', facility: '2공장 1라인', productionDate: '2024-04-21', planQuantity: 2000, actualQuantity: 0, defectQuantity: 0, worker: '이영희', status: '대기', createdDate: '2024-04-21', updatedDate: '2024-04-21' },
      { id: 'PR2024004', workOrderId: 'WO2024004', productId: 'PD004', productName: '제품D', facility: '1공장 1라인', productionDate: '2024-04-19', planQuantity: 300, actualQuantity: 295, defectQuantity: 5, worker: '박성준', status: '완료', createdDate: '2024-04-19', updatedDate: '2024-04-19' }
    ];
    
    setProductionList(dummyData);
    setSelectedProduction(null);
    setProductionDetails(null);
  };

  // 생산실적 선택 핸들러
  const handleProductionSelect = (params) => {
    const production = productionList.find(p => p.id === params.id);
    setSelectedProduction(production);
    
    if (!production) return;
    
    // 생산실적 상세 정보 (실제로는 API 호출)
    const detailData = [
      {
        id: production.id,
        workOrderId: production.workOrderId,
        productId: production.productId, 
        productName: production.productName,
        facility: production.facility,
        lineId: production.facility.split(' ')[1],
        factoryId: production.facility.split(' ')[0],
        productionDate: production.productionDate,
        planQuantity: production.planQuantity,
        goodQuantity: production.actualQuantity,
        defectQuantity: production.defectQuantity,
        inputAmount: production.status === '완료' ? production.planQuantity * 1.05 : 0,
        outputAmount: production.status === '완료' ? production.actualQuantity : 0,
        yieldRate: production.status === '완료' ? ((production.actualQuantity / production.planQuantity) * 100).toFixed(2) + '%' : '0%',
        productionTime: production.status === '완료' ? '08:00' : '00:00',
        worker: production.worker,
        supervisor: '김관리',
        startTime: production.status === '완료' ? '08:00' : '',
        endTime: production.status === '완료' ? '16:00' : '',
        status: production.status,
        note: '정상 생산',
        createdDate: production.createdDate,
        updatedDate: production.updatedDate,
        createdBy: 'admin',
        updatedBy: 'admin'
      }
    ];
    
    setProductionDetails(detailData);
  };

  // 출력 핸들러
  const handlePrint = () => {
    if (!selectedProduction) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '출력할 생산실적을 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    Swal.fire({
      icon: 'info',
      title: '생산실적 출력',
      text: '생산실적이 출력됩니다.',
      confirmButtonText: '확인'
    });
  };

  // 엑셀 다운로드 핸들러
  const handleExport = () => {
    Swal.fire({
      icon: 'info',
      title: '엑셀 내보내기',
      text: '생산실적 데이터가 엑셀로 내보내집니다.',
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

  // 생산실적 목록 그리드 컬럼 정의
  const productionColumns = [
    { field: 'id', headerName: '생산실적ID', width: 120 },
    { field: 'workOrderId', headerName: '작업지시ID', width: 120 },
    { field: 'productId', headerName: '제품코드', width: 100 },
    { field: 'productName', headerName: '제품명', width: 150, flex: 1 },
    { field: 'facility', headerName: '설비', width: 120 },
    { field: 'productionDate', headerName: '생산일자', width: 110 },
    { field: 'planQuantity', headerName: '계획수량', width: 100, type: 'number' },
    { field: 'actualQuantity', headerName: '실적수량', width: 100, type: 'number' },
    { field: 'defectQuantity', headerName: '불량수량', width: 100, type: 'number' },
    { field: 'worker', headerName: '작업자', width: 100 },
    { 
      field: 'status', 
      headerName: '상태', 
      width: 100,
      cellClassName: (params) => {
        if (params.value === '대기') return 'status-wait';
        if (params.value === '진행중') return 'status-inprogress';
        if (params.value === '완료') return 'status-completed';
        return '';
      }
    }
  ];
  
  // 생산실적 상세 정보 그리드 컬럼 정의
  const detailColumns = [
    { field: 'id', headerName: '생산실적ID', width: 120 },
    { field: 'workOrderId', headerName: '작업지시ID', width: 120 },
    { field: 'productId', headerName: '제품ID', width: 100 },
    { field: 'productName', headerName: '제품명', width: 150 },
    { field: 'facility', headerName: '설비명', width: 120 },
    { field: 'factoryId', headerName: '공장', width: 100 },
    { field: 'lineId', headerName: '라인', width: 80 },
    { field: 'productionDate', headerName: '생산일자', width: 110 },
    { field: 'planQuantity', headerName: '계획수량', width: 100, type: 'number' },
    { field: 'goodQuantity', headerName: '양품수량', width: 100, type: 'number' },
    { field: 'defectQuantity', headerName: '불량수량', width: 100, type: 'number' },
    { field: 'inputAmount', headerName: '투입량', width: 100, type: 'number' },
    { field: 'outputAmount', headerName: '생산량', width: 100, type: 'number' },
    { field: 'yieldRate', headerName: '수율', width: 100 },
    { field: 'productionTime', headerName: '생산시간', width: 100 },
    { field: 'startTime', headerName: '시작시각', width: 100 },
    { field: 'endTime', headerName: '종료시각', width: 100 },
    { field: 'worker', headerName: '작업자', width: 100 },
    { field: 'supervisor', headerName: '관리자', width: 100 },
    { field: 'status', headerName: '상태', width: 100 },
    { field: 'note', headerName: '비고', width: 150 },
    { field: 'createdDate', headerName: '등록일', width: 110 },
    { field: 'updatedDate', headerName: '수정일', width: 110 },
    { field: 'createdBy', headerName: '등록자', width: 100 },
    { field: 'updatedBy', headerName: '수정자', width: 100 }
  ];

  // 생산실적 목록 그리드 버튼
  const productionGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: <SearchIcon /> },
    { label: '출력', onClick: handlePrint, icon: <PrintIcon /> },
    { label: '엑셀', onClick: handleExport, icon: <FileDownloadIcon /> }
  ];

  // 생산실적 상세 그리드 버튼
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
          생산실적조회
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
            name="productionId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="생산실적ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="생산실적ID를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="workOrderId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="작업지시ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="작업지시ID를 입력하세요"
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
                  <MenuItem value="대기">대기</MenuItem>
                  <MenuItem value="진행중">진행중</MenuItem>
                  <MenuItem value="완료">완료</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Controller
                name="startDate"
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
                name="endDate"
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
          {/* 생산실적 목록 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title="생산실적 목록"
              rows={productionList}
              columns={productionColumns}
              buttons={productionGridButtons}
              height={450}
              onRowClick={handleProductionSelect}
            />
          </Grid>
          
          {/* 생산실적 상세 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title={`생산실적 상세정보 ${selectedProduction ? '- ' + selectedProduction.id : ''}`}
              rows={productionDetails || []}
              columns={detailColumns}
              buttons={detailGridButtons}
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
            • 생산실적조회 화면에서는 생산된 제품의 실적 정보를 조회할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 생산 일자, 제품, 작업지시 등의 조건으로 검색이 가능합니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 출력 버튼을 통해 생산실적을 인쇄하거나, 엑셀 버튼을 통해 데이터를 내보낼 수 있습니다.
          </Typography>
        </Stack>
      </Box>

      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="생산실적조회 도움말"
      >
        <Typography variant="body2" color={getTextColor()}>
          • 생산실적조회에서는 생산 작업의 실적 정보를 조회할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 작업지시번호, 제품 정보, 생산수량, 작업일자 등을 조회하여 생산 실적을 확인할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 생산 실적 정보는 재고 관리, 생산 계획 등에서 활용됩니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default ProductionResultInquiry; 