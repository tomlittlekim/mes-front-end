import React, { useState, useEffect } from 'react';
import './ProductionPlanManagement.css';
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
import CachedIcon from '@mui/icons-material/Cached';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import HelpModal from '../Common/HelpModal';

const ProductionPlanManagement = (props) => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // React Hook Form 설정
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      planId: '',
      productName: '',
      productGroup: '',
      planStatus: '',
      fromDate: null,
      toDate: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [planList, setPlanList] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planDetail, setPlanDetail] = useState(null);
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
      planId: '',
      productName: '',
      productGroup: '',
      planStatus: '',
      fromDate: null,
      toDate: null
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: 'PP2024001', planDate: '2024-04-10', productId: 'PD001', productName: '제품A', productGroup: '완제품', planQuantity: 1000, planStartDate: '2024-04-15', planEndDate: '2024-04-20', status: '계획', priority: '높음', note: '주문량 증가로 인한 생산' },
      { id: 'PP2024002', planDate: '2024-04-11', productId: 'PD002', productName: '제품B', productGroup: '완제품', planQuantity: 500, planStartDate: '2024-04-16', planEndDate: '2024-04-18', status: '진행중', priority: '중간', note: '재고 보충용' },
      { id: 'PP2024003', planDate: '2024-04-12', productId: 'PD003', productName: '반제품C', productGroup: '반제품', planQuantity: 2000, planStartDate: '2024-04-20', planEndDate: '2024-04-25', status: '계획', priority: '낮음', note: '' },
      { id: 'PP2024004', planDate: '2024-04-13', productId: 'PD004', productName: '제품D', productGroup: '완제품', planQuantity: 300, planStartDate: '2024-04-18', planEndDate: '2024-04-19', status: '완료', priority: '긴급', note: '납기일 임박' }
    ];
    
    setPlanList(dummyData);
    setSelectedPlan(null);
    setPlanDetail(null);
  };

  // 계획 선택 핸들러
  const handlePlanSelect = (params) => {
    const plan = planList.find(p => p.id === params.id);
    setSelectedPlan(plan);
    
    if (!plan) return;
    
    // 계획 상세 정보 (실제로는 API 호출)
    const detailData = {
      ...plan,
      facility: '1공장 3라인',
      workCenter: 'WC001',
      orderNo: plan.id.includes('PP2024001') ? 'OR2024001' : '',
      materialList: '원자재A, 원자재B',
      requiredCapacity: plan.planQuantity * 0.5,
      productionRate: 100,
      leadTime: 5,
      setupTime: 2,
      inspectionTime: 1,
      registDate: '2024-04-01',
      updateDate: '2024-04-05',
      registUser: '김생산',
      updateUser: '이계획',
      isReschedulable: true
    };
    
    setPlanDetail([detailData]);
  };

  // 등록 버튼 클릭 핸들러
  const handleAdd = () => {
    const newPlan = {
      id: `NEW_${Date.now()}`,
      planDate: new Date().toISOString().split('T')[0],
      productId: '',
      productName: '',
      productGroup: '',
      planQuantity: 0,
      planStartDate: '',
      planEndDate: '',
      status: '계획',
      priority: '중간',
      note: '',
      facility: '',
      workCenter: '',
      orderNo: '',
      materialList: '',
      requiredCapacity: 0,
      productionRate: 100,
      leadTime: 0,
      setupTime: 0,
      inspectionTime: 0,
      registDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      registUser: '시스템',
      updateUser: '시스템',
      isReschedulable: true
    };
    
    setPlanList([...planList, newPlan]);
    setSelectedPlan(newPlan);
    setPlanDetail([newPlan]);
  };

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    if (!selectedPlan) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '저장할 생산계획을 선택해주세요.',
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
    if (!selectedPlan) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 생산계획을 선택해주세요.',
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
        const updatedList = planList.filter(p => p.id !== selectedPlan.id);
        setPlanList(updatedList);
        setSelectedPlan(null);
        setPlanDetail(null);
        Swal.fire({
          icon: 'success',
          title: '성공',
          text: '삭제되었습니다.',
          confirmButtonText: '확인'
        });
      }
    });
  };

  // 일정 재계산 버튼 클릭 핸들러
  const handleReschedule = () => {
    if (!selectedPlan) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '일정을 재계산할 생산계획을 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    Swal.fire({
      icon: 'info',
      title: '일정 재계산',
      text: '생산 일정이 재계산되었습니다.',
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

  // 생산계획 목록 그리드 컬럼 정의
  const planColumns = [
    { field: 'id', headerName: '계획ID', width: 100 },
    { field: 'planDate', headerName: '계획일자', width: 110 },
    { field: 'productId', headerName: '제품코드', width: 100 },
    { field: 'productName', headerName: '제품명', width: 150, flex: 1 },
    { field: 'productGroup', headerName: '제품그룹', width: 100 },
    { field: 'planQuantity', headerName: '계획수량', width: 100, type: 'number' },
    { field: 'planStartDate', headerName: '시작일', width: 110 },
    { field: 'planEndDate', headerName: '종료일', width: 110 },
    { 
      field: 'status', 
      headerName: '상태', 
      width: 100,
      cellClassName: (params) => {
        if (params.value === '계획') return 'status-planned';
        if (params.value === '진행중') return 'status-inprogress';
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
    { field: 'note', headerName: '비고', width: 200 }
  ];
  
  // 생산계획 상세 정보 그리드 컬럼 정의
  const detailColumns = [
    { field: 'id', headerName: '계획ID', width: 100, editable: true },
    { field: 'planDate', headerName: '계획일자', width: 110, editable: true },
    { field: 'productId', headerName: '제품코드', width: 100, editable: true },
    { field: 'productName', headerName: '제품명', width: 150, editable: true },
    { field: 'productGroup', headerName: '제품그룹', width: 100, editable: true, type: 'singleSelect', valueOptions: ['완제품', '반제품', '부자재'] },
    { field: 'planQuantity', headerName: '계획수량', width: 100, type: 'number', editable: true },
    { field: 'facility', headerName: '설비', width: 120, editable: true },
    { field: 'workCenter', headerName: '작업장', width: 100, editable: true },
    { field: 'orderNo', headerName: '주문번호', width: 120, editable: true },
    { field: 'materialList', headerName: '소요자재', width: 200, editable: true },
    { field: 'requiredCapacity', headerName: '소요능력', width: 100, type: 'number', editable: true },
    { field: 'productionRate', headerName: '생산율(%)', width: 110, type: 'number', editable: true },
    { field: 'leadTime', headerName: '리드타임', width: 100, type: 'number', editable: true },
    { field: 'setupTime', headerName: '셋업시간', width: 100, type: 'number', editable: true },
    { field: 'inspectionTime', headerName: '검사시간', width: 100, type: 'number', editable: true },
    { field: 'planStartDate', headerName: '시작일', width: 110, editable: true },
    { field: 'planEndDate', headerName: '종료일', width: 110, editable: true },
    { 
      field: 'status', 
      headerName: '상태', 
      width: 100, 
      editable: true,
      type: 'singleSelect',
      valueOptions: ['계획', '진행중', '완료', '취소']
    },
    { 
      field: 'priority', 
      headerName: '우선순위', 
      width: 100, 
      editable: true,
      type: 'singleSelect',
      valueOptions: ['긴급', '높음', '중간', '낮음']
    },
    { field: 'note', headerName: '비고', width: 200, editable: true },
    { field: 'registUser', headerName: '등록자', width: 100 },
    { field: 'registDate', headerName: '등록일', width: 120 },
    { field: 'updateUser', headerName: '수정자', width: 100 },
    { field: 'updateDate', headerName: '수정일', width: 120 },
    { field: 'isReschedulable', headerName: '일정재계산가능', width: 140, type: 'boolean', editable: true }
  ];

  // 생산계획 목록 그리드 버튼
  const planGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: <SearchIcon /> }
  ];

  // 생산계획 상세 그리드 버튼
  const detailGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> },
    { label: '일정재계산', onClick: handleReschedule, icon: <CachedIcon /> }
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
          생산계획관리
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
            name="planId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="계획ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="계획ID를 입력하세요"
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
            name="productGroup"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="productGroup-label">제품그룹</InputLabel>
                <Select
                  {...field}
                  labelId="productGroup-label"
                  label="제품그룹"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="완제품">완제품</MenuItem>
                  <MenuItem value="반제품">반제품</MenuItem>
                  <MenuItem value="부자재">부자재</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="planStatus"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="planStatus-label">상태</InputLabel>
                <Select
                  {...field}
                  labelId="planStatus-label"
                  label="상태"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="계획">계획</MenuItem>
                  <MenuItem value="진행중">진행중</MenuItem>
                  <MenuItem value="완료">완료</MenuItem>
                  <MenuItem value="취소">취소</MenuItem>
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
        <Grid container spacing={2}>
          {/* 생산계획 기본 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title="생산계획목록"
              rows={planList}
              columns={planColumns}
              buttons={planGridButtons}
              height={450}
              onRowClick={handlePlanSelect}
            />
          </Grid>
          
          {/* 생산계획 상세 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title={`생산계획상세정보 ${selectedPlan ? '- ' + selectedPlan.id : ''}`}
              rows={planDetail || []}
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
            • 생산계획관리 화면에서는 제품별 생산계획을 효율적으로 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 계획을 등록하고 작업지시를 생성하여 공정별 생산 일정을 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 제품명을 선택하면 해당 제품의 생산계획 상세내역을 확인할 수 있습니다.
          </Typography>
        </Stack>
      </Box>

      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="생산계획관리 도움말"
      >
        <Typography variant="body2" color={getTextColor()}>
          • 생산계획관리에서는 생산 계획 정보를 등록하고 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 계획번호, 제품 정보, 계획수량, 계획일자 등을 관리하여 생산 계획을 체계적으로 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 생산 계획 정보는 작업 지시, 생산 실적 관리 등에서 활용됩니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default ProductionPlanManagement; 