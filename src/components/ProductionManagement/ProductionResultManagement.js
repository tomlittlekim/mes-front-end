import React, { useState, useEffect } from 'react';
import './ProductionResultManagement.css';
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
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../Common/HelpModal';

const ProductionResultManagement = (props) => {
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
  const [workOrderList, setWorkOrderList] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [productionResults, setProductionResults] = useState(null);
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
      { id: 'WO2024001', orderDate: '2024-04-15', productId: 'PD001', productName: '제품A', workOrderId: 'WO2024001', planQuantity: 1000, facility: '1공장 3라인', startDate: '2024-04-17', endDate: '2024-04-20', status: '완료' },
      { id: 'WO2024002', orderDate: '2024-04-16', productId: 'PD002', productName: '제품B', workOrderId: 'WO2024002', planQuantity: 500, facility: '1공장 2라인', startDate: '2024-04-18', endDate: '2024-04-20', status: '진행중' },
      { id: 'WO2024003', orderDate: '2024-04-17', productId: 'PD003', productName: '반제품C', workOrderId: 'WO2024003', planQuantity: 2000, facility: '2공장 1라인', startDate: '2024-04-21', endDate: '2024-04-25', status: '대기' },
      { id: 'WO2024004', orderDate: '2024-04-18', productId: 'PD004', productName: '제품D', workOrderId: 'WO2024004', planQuantity: 300, facility: '1공장 1라인', startDate: '2024-04-19', endDate: '2024-04-20', status: '완료' }
    ];
    
    setWorkOrderList(dummyData);
    setSelectedWorkOrder(null);
    setProductionResults(null);
  };

  // 작업지시 선택 핸들러
  const handleWorkOrderSelect = (params) => {
    const workOrder = workOrderList.find(o => o.id === params.id);
    setSelectedWorkOrder(workOrder);
    
    if (!workOrder) return;
    
    // 생산실적 상세 정보 (실제로는 API 호출)
    const resultData = [
      {
        id: `PR${workOrder.id.slice(2)}`,
        workOrderId: workOrder.id,
        productId: workOrder.productId,
        productName: workOrder.productName,
        facility: workOrder.facility,
        productionDate: new Date().toISOString().split('T')[0],
        planQuantity: workOrder.planQuantity,
        goodQuantity: workOrder.status === '완료' ? Math.floor(workOrder.planQuantity * 0.98) : 0,
        defectQuantity: workOrder.status === '완료' ? Math.floor(workOrder.planQuantity * 0.02) : 0,
        inputAmount: workOrder.status === '완료' ? workOrder.planQuantity * 1.1 : 0,
        outputAmount: workOrder.status === '완료' ? workOrder.planQuantity : 0,
        productionTime: workOrder.status === '완료' ? '08:00' : '00:00',
        worker: '홍길동',
        status: workOrder.status,
        note: ''
      }
    ];
    
    setProductionResults(resultData);
  };

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    if (!selectedWorkOrder) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '저장할 생산실적을 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    Swal.fire({
      icon: 'success',
      title: '성공',
      text: '저장되었습니다.',
      confirmButtonText: '확인'
    });
  };

  // 삭제 버튼 클릭 핸들러
  const handleDelete = () => {
    if (!selectedWorkOrder) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 생산실적을 선택해주세요.',
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
        Swal.fire({
          icon: 'success',
          title: '성공',
          text: '삭제되었습니다.',
          confirmButtonText: '확인'
        });
      }
    });
  };

  // 새 생산실적 추가 핸들러
  const handleAdd = () => {
    if (!selectedWorkOrder) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '작업지시를 먼저 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    const newResult = {
      id: `NEW_${Date.now()}`,
      workOrderId: selectedWorkOrder.id,
      productId: selectedWorkOrder.productId,
      productName: selectedWorkOrder.productName,
      facility: selectedWorkOrder.facility,
      productionDate: new Date().toISOString().split('T')[0],
      planQuantity: selectedWorkOrder.planQuantity,
      goodQuantity: 0,
      defectQuantity: 0,
      inputAmount: 0,
      outputAmount: 0,
      productionTime: '00:00',
      worker: '',
      status: '대기',
      note: ''
    };
    
    setProductionResults([newResult]);
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

  // 작업지시 목록 그리드 컬럼 정의
  const workOrderColumns = [
    { field: 'id', headerName: '작업지시ID', width: 120 },
    { field: 'orderDate', headerName: '작업지시일', width: 110 },
    { field: 'productId', headerName: '생산계획번호', width: 140 },
    { field: 'productName', headerName: '작업지시명', width: 150, flex: 1 },
    { field: 'facility', headerName: '설비', width: 120 },
    { field: 'planQuantity', headerName: '계획수량', width: 100, type: 'number' },
    { field: 'startDate', headerName: '시작일시', width: 110 },
    { field: 'endDate', headerName: '종료일시', width: 110 },
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
  
  // 생산실적 그리드 컬럼 정의
  const resultColumns = [
    { field: 'id', headerName: '생산실적ID', width: 120, editable: true },
    { field: 'workOrderId', headerName: '작업지시ID', width: 120, editable: true },
    { field: 'productId', headerName: '제품ID', width: 100, editable: true },
    { field: 'productName', headerName: '제품명', width: 150, editable: true },
    { field: 'facility', headerName: '설비명', width: 120, editable: true },
    { field: 'productionDate', headerName: '생산일자', width: 110, editable: true },
    { field: 'planQuantity', headerName: '계획수량', width: 100, type: 'number', editable: true },
    { field: 'goodQuantity', headerName: '양품수량', width: 100, type: 'number', editable: true },
    { field: 'defectQuantity', headerName: '불량수량', width: 100, type: 'number', editable: true },
    { field: 'inputAmount', headerName: '양품수량', width: 100, type: 'number', editable: true },
    { field: 'outputAmount', headerName: '불량수량', width: 100, type: 'number', editable: true },
    { field: 'productionTime', headerName: '생산시비', width: 100, editable: true },
    { field: 'worker', headerName: '작업자', width: 100, editable: true },
    { 
      field: 'status', 
      headerName: '상태', 
      width: 100, 
      editable: true,
      type: 'singleSelect',
      valueOptions: ['대기', '진행중', '완료', '취소']
    },
    { field: 'note', headerName: '비고', width: 150, editable: true }
  ];

  // 작업지시 목록 그리드 버튼
  const workOrderGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: <SearchIcon /> }
  ];

  // 생산실적 그리드 버튼
  const resultGridButtons = [
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> },
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> }
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
          생산실적관리
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
                label="생산계획번호"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="생산계획번호를 입력하세요"
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
                label="작업지시번호"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="작업지시번호를 입력하세요"
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
                    label="시작일시"
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
                    label="종료일시"
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
          {/* 작업지시 목록 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title="작업지시 목록"
              rows={workOrderList}
              columns={workOrderColumns}
              buttons={workOrderGridButtons}
              height={450}
              onRowClick={handleWorkOrderSelect}
            />
          </Grid>
          
          {/* 생산실적 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title={`생산실적등록 ${selectedWorkOrder ? '- ' + selectedWorkOrder.id : ''}`}
              rows={productionResults || []}
              columns={resultColumns}
              buttons={resultGridButtons}
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
            • 생산실적등록 화면에서는 작업지시에 따른 생산실적을 등록하고 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 작업지시목록에서 특정 작업지시를 선택하면 해당 작업지시의 생산실적을 등록할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 생산수량, 양품/불량 수량, 작업시간 등의 정보를 기록하여 생산이력을 관리합니다.
          </Typography>
        </Stack>
      </Box>

      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="생산실적관리 도움말"
      >
        <Typography variant="body2" color={getTextColor()}>
          • 생산실적관리에서는 생산 작업의 실적 정보를 등록하고 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 작업지시번호, 제품 정보, 생산수량, 작업일자 등을 관리하여 생산 실적을 체계적으로 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 생산 실적 정보는 재고 관리, 생산 계획 등에서 활용됩니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default ProductionResultManagement; 