import React, { useState, useEffect } from 'react';
import './WorkOrderManagement.css';
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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const WorkOrderManagement = (props) => {
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
      workOrderId: '',
      productName: '',
      workStatus: '',
      facility: '',
      fromDate: null,
      toDate: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [workOrderList, setWorkOrderList] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [workOrderDetail, setWorkOrderDetail] = useState(null);

  // 초기화 함수
  const handleReset = () => {
    reset({
      workOrderId: '',
      productName: '',
      workStatus: '',
      facility: '',
      fromDate: null,
      toDate: null
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: 'WO2024001', orderDate: '2024-04-15', productId: 'PD001', product: '제품A', productType: '완제품', planId: 'PP2024001', facility: '1공장 3라인', quantity: 1000, startDate: '2024-04-17', endDate: '2024-04-20', status: '작업대기', priority: '높음', note: '주문량 증가로 인한 생산' },
      { id: 'WO2024002', orderDate: '2024-04-16', productId: 'PD002', product: '제품B', productType: '완제품', planId: 'PP2024002', facility: '1공장 2라인', quantity: 500, startDate: '2024-04-18', endDate: '2024-04-20', status: '작업중', priority: '중간', note: '재고 보충용' },
      { id: 'WO2024003', orderDate: '2024-04-17', productId: 'PD003', product: '반제품C', productType: '반제품', planId: 'PP2024003', facility: '2공장 1라인', quantity: 2000, startDate: '2024-04-21', endDate: '2024-04-25', status: '작업대기', priority: '낮음', note: '' },
      { id: 'WO2024004', orderDate: '2024-04-18', productId: 'PD004', product: '제품D', productType: '완제품', planId: 'PP2024004', facility: '1공장 1라인', quantity: 300, startDate: '2024-04-19', endDate: '2024-04-20', status: '완료', priority: '긴급', note: '납기일 임박' }
    ];
    
    setWorkOrderList(dummyData);
    setSelectedWorkOrder(null);
    setWorkOrderDetail(null);
  };

  // 작업지시 선택 핸들러
  const handleWorkOrderSelect = (params) => {
    const workOrder = workOrderList.find(o => o.id === params.id);
    setSelectedWorkOrder(workOrder);
    
    if (!workOrder) return;
    
    // 작업지시 상세 정보 (실제로는 API 호출)
    const detailData = {
      ...workOrder,
      workCenter: 'WC001',
      shift: '주간',
      worker: '홍길동',
      supervisor: '김관리',
      setupTime: 30,
      inspectionTime: 20,
      materialList: '원자재A, 원자재B',
      bomId: 'BOM001',
      qualityTarget: 98,
      actualQuantity: workOrder.status === '완료' ? workOrder.quantity : 0,
      defectQuantity: workOrder.status === '완료' ? Math.floor(workOrder.quantity * 0.02) : 0,
      registDate: '2024-04-10',
      updateDate: '2024-04-10',
      registUser: '김계획',
      updateUser: '김계획'
    };
    
    setWorkOrderDetail([detailData]);
  };

  // 등록 버튼 클릭 핸들러
  const handleAdd = () => {
    const newWorkOrder = {
      id: `NEW_${Date.now()}`,
      orderDate: new Date().toISOString().split('T')[0],
      productId: '',
      product: '',
      productType: '',
      planId: '',
      facility: '',
      quantity: 0,
      startDate: '',
      endDate: '',
      status: '작업대기',
      priority: '중간',
      note: '',
      workCenter: '',
      shift: '주간',
      worker: '',
      supervisor: '',
      setupTime: 0,
      inspectionTime: 0,
      materialList: '',
      bomId: '',
      qualityTarget: 98,
      actualQuantity: 0,
      defectQuantity: 0,
      registDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      registUser: '시스템',
      updateUser: '시스템'
    };
    
    setWorkOrderList([...workOrderList, newWorkOrder]);
    setSelectedWorkOrder(newWorkOrder);
    setWorkOrderDetail([newWorkOrder]);
  };

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    if (!selectedWorkOrder) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '저장할 작업지시를 선택해주세요.',
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
        text: '삭제할 작업지시를 선택해주세요.',
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
        const updatedList = workOrderList.filter(o => o.id !== selectedWorkOrder.id);
        setWorkOrderList(updatedList);
        setSelectedWorkOrder(null);
        setWorkOrderDetail(null);
        Swal.fire({
          icon: 'success',
          title: '성공',
          text: '삭제되었습니다.',
          confirmButtonText: '확인'
        });
      }
    });
  };

  // 작업지시서 출력 핸들러
  const handlePrint = () => {
    if (!selectedWorkOrder) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '출력할 작업지시를 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    Swal.fire({
      icon: 'info',
      title: '작업지시서 출력',
      text: '작업지시서가 출력됩니다.',
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

  // 작업지시 목록 그리드 컬럼 정의
  const workOrderColumns = [
    { field: 'id', headerName: '작업지시ID', width: 110 },
    { field: 'orderDate', headerName: '지시일자', width: 110 },
    { field: 'productId', headerName: '제품코드', width: 100 },
    { field: 'product', headerName: '제품명', width: 150, flex: 1 },
    { field: 'productType', headerName: '제품유형', width: 100 },
    { field: 'planId', headerName: '계획ID', width: 110 },
    { field: 'facility', headerName: '설비', width: 120 },
    { field: 'quantity', headerName: '수량', width: 80, type: 'number' },
    { field: 'startDate', headerName: '시작일', width: 110 },
    { field: 'endDate', headerName: '종료일', width: 110 },
    { 
      field: 'status', 
      headerName: '상태', 
      width: 100,
      cellClassName: (params) => {
        if (params.value === '작업대기') return 'status-wait';
        if (params.value === '작업중') return 'status-inprogress';
        if (params.value === '완료') return 'status-completed';
        return '';
      }
    },
    { 
      field: 'priority', 
      headerName: '우선순위', 
      width: 100,
      cellClassName: (params) => {
        if (params.value === '긴급') return 'priority-urgent';
        if (params.value === '높음') return 'priority-high';
        if (params.value === '중간') return 'priority-medium';
        if (params.value === '낮음') return 'priority-low';
        return '';
      }
    },
    { field: 'note', headerName: '비고', width: 150 }
  ];
  
  // 작업지시 상세 정보 그리드 컬럼 정의
  const detailColumns = [
    { field: 'id', headerName: '작업지시ID', width: 110, editable: true },
    { field: 'orderDate', headerName: '지시일자', width: 110, editable: true },
    { field: 'productId', headerName: '제품코드', width: 100, editable: true },
    { field: 'product', headerName: '제품명', width: 150, editable: true },
    { field: 'productType', headerName: '제품유형', width: 100, editable: true, type: 'singleSelect', valueOptions: ['완제품', '반제품', '부자재'] },
    { field: 'planId', headerName: '계획ID', width: 110, editable: true },
    { field: 'facility', headerName: '설비', width: 120, editable: true },
    { field: 'workCenter', headerName: '작업장', width: 100, editable: true },
    { field: 'quantity', headerName: '계획수량', width: 100, type: 'number', editable: true },
    { field: 'actualQuantity', headerName: '실적수량', width: 100, type: 'number', editable: true },
    { field: 'defectQuantity', headerName: '불량수량', width: 100, type: 'number', editable: true },
    { field: 'materialList', headerName: '소요자재', width: 200, editable: true },
    { field: 'bomId', headerName: 'BOM ID', width: 100, editable: true },
    { field: 'shift', headerName: '근무조', width: 80, editable: true, type: 'singleSelect', valueOptions: ['주간', '야간', '교대'] },
    { field: 'worker', headerName: '작업자', width: 100, editable: true },
    { field: 'supervisor', headerName: '관리자', width: 100, editable: true },
    { field: 'setupTime', headerName: '셋업시간', width: 100, type: 'number', editable: true },
    { field: 'inspectionTime', headerName: '검사시간', width: 100, type: 'number', editable: true },
    { field: 'qualityTarget', headerName: '품질목표(%)', width: 110, type: 'number', editable: true },
    { field: 'startDate', headerName: '시작일', width: 110, editable: true },
    { field: 'endDate', headerName: '종료일', width: 110, editable: true },
    { 
      field: 'status', 
      headerName: '상태', 
      width: 100, 
      editable: true,
      type: 'singleSelect',
      valueOptions: ['작업대기', '작업중', '완료', '취소']
    },
    { 
      field: 'priority', 
      headerName: '우선순위', 
      width: 100, 
      editable: true,
      type: 'singleSelect',
      valueOptions: ['긴급', '높음', '중간', '낮음']
    },
    { field: 'note', headerName: '비고', width: 150, editable: true },
    { field: 'registUser', headerName: '등록자', width: 100 },
    { field: 'registDate', headerName: '등록일', width: 120 },
    { field: 'updateUser', headerName: '수정자', width: 100 },
    { field: 'updateDate', headerName: '수정일', width: 120 }
  ];

  // 작업지시 목록 그리드 버튼
  const workOrderGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: <SearchIcon /> }
  ];

  // 작업지시 상세 그리드 버튼
  const detailGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> },
    { label: '지시서', onClick: handlePrint, icon: <PrintIcon /> }
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
          작업지시관리
        </Typography>
      </Box>

      {/* 검색 조건 영역 - 공통 컴포넌트 사용 */}
      <SearchCondition 
        onSearch={handleSubmit(handleSearch)}
        onReset={handleReset}
      >
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
            name="workStatus"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="workStatus-label">상태</InputLabel>
                <Select
                  {...field}
                  labelId="workStatus-label"
                  label="상태"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="작업대기">작업대기</MenuItem>
                  <MenuItem value="작업중">작업중</MenuItem>
                  <MenuItem value="완료">완료</MenuItem>
                  <MenuItem value="취소">취소</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="facility"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="설비"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="설비를 입력하세요"
              />
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
        <Grid container spacing={2}>
          {/* 작업지시 기본 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title="작업지시목록"
              rows={workOrderList}
              columns={workOrderColumns}
              buttons={workOrderGridButtons}
              height={450}
              onRowClick={handleWorkOrderSelect}
            />
          </Grid>
          
          {/* 작업지시 상세 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title={`작업지시상세정보 ${selectedWorkOrder ? '- ' + selectedWorkOrder.id : ''}`}
              rows={workOrderDetail || []}
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
            • 작업지시관리 화면에서는 생산계획에 따른 작업지시를 효율적으로 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 작업지시목록에서 특정 작업지시를 선택하면 해당 작업지시의 상세 정보를 확인할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 작업지시 등록, 수정, 삭제 기능과 작업지시서 출력을 통해 효율적인 생산 관리를 수행할 수 있습니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default WorkOrderManagement; 