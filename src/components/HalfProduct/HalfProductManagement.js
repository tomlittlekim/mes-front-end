import React, { useState, useEffect } from 'react';
import './HalfProductManagement.css';
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
  Checkbox,
  IconButton,
  alpha
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { MuiDataGridWrapper, SearchCondition, EnhancedDataGridWrapper } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../Common/HelpModal';

const HalfProductManagement = (props) => {
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
      useYn: '',
      fromDate: null,
      toDate: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [inventoryList, setInventoryList] = useState([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // 초기화 함수
  const handleReset = () => {
    reset({
      productId: '',
      productName: '',
      useYn: '',
      fromDate: null,
      toDate: null
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용 (30개로 증가)
    const dummyData = [
      { id: 1, code: 'HP001', name: '알루미늄 프레임 45T', standard: '45x45x100', unit: 'EA', price: 3000, safetyStock: 100, warehouseId: 'WH001', warehouseName: '본사창고', useYn: 'Y', createDate: '2023-03-15', updateDate: '2023-05-20' },
      { id: 2, code: 'HP002', name: '스틸 파이프 외경 25mm', standard: 'Φ25 x 2t', unit: 'M', price: 1500, safetyStock: 200, warehouseId: 'WH001', warehouseName: '본사창고', useYn: 'Y', createDate: '2023-03-15', updateDate: '2023-04-10' },
      { id: 3, code: 'HP003', name: 'PCB 기판 TYPE-A', standard: '150 x 200 mm', unit: 'EA', price: 7500, safetyStock: 50, warehouseId: 'WH002', warehouseName: '자재창고', useYn: 'Y', createDate: '2023-03-16', updateDate: '2023-05-15' },
      { id: 4, code: 'HP004', name: '인쇄회로 베이스보드', standard: '200 x 300 mm', unit: 'EA', price: 12000, safetyStock: 30, warehouseId: 'WH002', warehouseName: '자재창고', useYn: 'N', createDate: '2023-03-18', updateDate: '2023-04-25' },
      { id: 5, code: 'HP005', name: '케이스 타입 B', standard: '300 x 400 x 150 mm', unit: 'EA', price: 8500, safetyStock: 80, warehouseId: 'WH003', warehouseName: '2공장창고', useYn: 'Y', createDate: '2023-03-20', updateDate: '2023-05-08' },
      { id: 6, code: 'HP006', name: '방열판 TYPE-A', standard: '100 x 50 x 20 mm', unit: 'EA', price: 2200, safetyStock: 150, warehouseId: 'WH001', warehouseName: '본사창고', useYn: 'Y', createDate: '2023-03-21', updateDate: '2023-05-22' },
      { id: 7, code: 'HP007', name: '전원 어댑터 PCB', standard: '80 x 60 mm', unit: 'EA', price: 6500, safetyStock: 60, warehouseId: 'WH002', warehouseName: '자재창고', useYn: 'Y', createDate: '2023-03-22', updateDate: '2023-04-28' },
      { id: 8, code: 'HP008', name: '광센서 모듈', standard: '40 x 20 mm', unit: 'EA', price: 15000, safetyStock: 40, warehouseId: 'WH002', warehouseName: '자재창고', useYn: 'Y', createDate: '2023-03-23', updateDate: '2023-05-25' },
      { id: 9, code: 'HP009', name: '모터 마운트', standard: '70 x 70 mm', unit: 'EA', price: 4200, safetyStock: 100, warehouseId: 'WH003', warehouseName: '2공장창고', useYn: 'N', createDate: '2023-03-24', updateDate: '2023-04-30' },
      { id: 10, code: 'HP010', name: '서보 모터 브라켓', standard: '50 x 60 mm', unit: 'EA', price: 3800, safetyStock: 120, warehouseId: 'WH001', warehouseName: '본사창고', useYn: 'Y', createDate: '2023-03-25', updateDate: '2023-05-10' },
      { id: 11, code: 'HP011', name: '터치 패널 모듈', standard: '400 x 250 mm', unit: 'EA', price: 18000, safetyStock: 25, warehouseId: 'WH002', warehouseName: '자재창고', useYn: 'Y', createDate: '2023-03-26', updateDate: '2023-05-12' },
      { id: 12, code: 'HP012', name: '배선 하네스 세트', standard: '500 mm', unit: 'SET', price: 7200, safetyStock: 70, warehouseId: 'WH003', warehouseName: '2공장창고', useYn: 'Y', createDate: '2023-03-27', updateDate: '2023-05-15' },
      { id: 13, code: 'HP013', name: '히트싱크 알루미늄', standard: '80 x 80 x 30 mm', unit: 'EA', price: 5500, safetyStock: 90, warehouseId: 'WH001', warehouseName: '본사창고', useYn: 'Y', createDate: '2023-03-28', updateDate: '2023-05-18' },
      { id: 14, code: 'HP014', name: '고무 댐퍼', standard: 'Φ20 x 15 mm', unit: 'EA', price: 800, safetyStock: 300, warehouseId: 'WH002', warehouseName: '자재창고', useYn: 'Y', createDate: '2023-03-29', updateDate: '2023-05-20' },
      { id: 15, code: 'HP015', name: '스텝 모터 어셈블리', standard: 'NEMA 17', unit: 'EA', price: 14500, safetyStock: 45, warehouseId: 'WH003', warehouseName: '2공장창고', useYn: 'Y', createDate: '2023-03-30', updateDate: '2023-05-25' },
      { id: 16, code: 'HP016', name: 'LCD 디스플레이 모듈', standard: '128 x 64 px', unit: 'EA', price: 9800, safetyStock: 55, warehouseId: 'WH001', warehouseName: '본사창고', useYn: 'Y', createDate: '2023-04-01', updateDate: '2023-05-28' },
      { id: 17, code: 'HP017', name: '리니어 가이드 레일', standard: '450 mm', unit: 'EA', price: 22000, safetyStock: 35, warehouseId: 'WH002', warehouseName: '자재창고', useYn: 'Y', createDate: '2023-04-02', updateDate: '2023-06-01' },
      { id: 18, code: 'HP018', name: '볼 스크류 세트', standard: '300 mm', unit: 'SET', price: 28000, safetyStock: 20, warehouseId: 'WH003', warehouseName: '2공장창고', useYn: 'N', createDate: '2023-04-03', updateDate: '2023-06-05' },
      { id: 19, code: 'HP019', name: '방진 고무 패드', standard: '100 x 100 x 10 mm', unit: 'EA', price: 1200, safetyStock: 250, warehouseId: 'WH001', warehouseName: '본사창고', useYn: 'Y', createDate: '2023-04-04', updateDate: '2023-06-08' },
      { id: 20, code: 'HP020', name: '인코더 모듈', standard: '600 PPR', unit: 'EA', price: 16500, safetyStock: 30, warehouseId: 'WH002', warehouseName: '자재창고', useYn: 'Y', createDate: '2023-04-05', updateDate: '2023-06-10' },
      { id: 21, code: 'HP021', name: '파워 서플라이 PCB', standard: '180 x 120 mm', unit: 'EA', price: 19500, safetyStock: 25, warehouseId: 'WH003', warehouseName: '2공장창고', useYn: 'Y', createDate: '2023-04-06', updateDate: '2023-06-12' },
      { id: 22, code: 'HP022', name: '커넥터 하우징 세트', standard: '2.54mm Pitch', unit: 'SET', price: 3500, safetyStock: 150, warehouseId: 'WH001', warehouseName: '본사창고', useYn: 'Y', createDate: '2023-04-07', updateDate: '2023-06-15' },
      { id: 23, code: 'HP023', name: '냉각 팬 어셈블리', standard: '80 x 80 mm', unit: 'EA', price: 7800, safetyStock: 65, warehouseId: 'WH002', warehouseName: '자재창고', useYn: 'N', createDate: '2023-04-08', updateDate: '2023-06-18' },
      { id: 24, code: 'HP024', name: '센서 마운팅 브래킷', standard: '60 x 40 mm', unit: 'EA', price: 4500, safetyStock: 110, warehouseId: 'WH003', warehouseName: '2공장창고', useYn: 'Y', createDate: '2023-04-09', updateDate: '2023-06-20' },
      { id: 25, code: 'HP025', name: '하프 미러 패널', standard: '200 x 150 mm', unit: 'EA', price: 13500, safetyStock: 40, warehouseId: 'WH001', warehouseName: '본사창고', useYn: 'Y', createDate: '2023-04-10', updateDate: '2023-06-22' },
      { id: 26, code: 'HP026', name: '실리콘 댐퍼 패드', standard: '50 x 50 x 5 mm', unit: 'EA', price: 2200, safetyStock: 180, warehouseId: 'WH002', warehouseName: '자재창고', useYn: 'Y', createDate: '2023-04-11', updateDate: '2023-06-25' },
      { id: 27, code: 'HP027', name: '로터리 인코더 모듈', standard: '24PPR', unit: 'EA', price: 8600, safetyStock: 70, warehouseId: 'WH003', warehouseName: '2공장창고', useYn: 'Y', createDate: '2023-04-12', updateDate: '2023-06-28' },
      { id: 28, code: 'HP028', name: '컨트롤러 PCB', standard: '150 x 100 mm', unit: 'EA', price: 25000, safetyStock: 20, warehouseId: 'WH001', warehouseName: '본사창고', useYn: 'N', createDate: '2023-04-13', updateDate: '2023-07-01' },
      { id: 29, code: 'HP029', name: '터치 스크린 패널', standard: '7인치', unit: 'EA', price: 32000, safetyStock: 15, warehouseId: 'WH002', warehouseName: '자재창고', useYn: 'Y', createDate: '2023-04-14', updateDate: '2023-07-05' },
      { id: 30, code: 'HP030', name: '배터리 하우징', standard: '120 x 80 x 30 mm', unit: 'EA', price: 6800, safetyStock: 85, warehouseId: 'WH003', warehouseName: '2공장창고', useYn: 'Y', createDate: '2023-04-15', updateDate: '2023-07-10' }
    ];
    
    setInventoryList(dummyData);
    setIsLoading(false);
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

  // 등록 버튼 클릭 핸들러
  const handleAdd = () => {
    // 신규 항목 추가 로직
    const newItem = {
      id: Date.now(),
      code: '',
      name: '',
      standard: '',
      unit: '',
      price: 0,
      safetyStock: 0,
      warehouseId: '',
      warehouseName: '',
      useYn: 'Y',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0]
    };
    
    setInventoryList([...inventoryList, newItem]);
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
    const timer = setTimeout(() => {
      handleSearch({});
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // 반제품 목록 그리드 컬럼 정의
  const inventoryColumns = [
    { field: 'code', headerName: '반제품코드', width: 120, editable: true },
    { field: 'name', headerName: '반제품명', width: 200, flex: 1, editable: true },
    { field: 'standard', headerName: '규격', width: 150, editable: true },
    { field: 'unit', headerName: '단위', width: 80, editable: true },
    { field: 'price', headerName: '단가', width: 100, type: 'number', editable: true },
    { field: 'safetyStock', headerName: '안전재고', width: 100, type: 'number', editable: true },
    { field: 'warehouseName', headerName: '보관창고', width: 150, editable: true },
    { 
      field: 'useYn', 
      headerName: '사용여부', 
      width: 100,
      type: 'singleSelect',
      valueOptions: ['Y', 'N'],
      valueFormatter: (params) => params.value === 'Y' ? '사용' : '미사용',
      editable: true 
    },
    { field: 'createDate', headerName: '등록일', width: 120 },
    { field: 'updateDate', headerName: '수정일', width: 120 }
  ];

  // 반제품 목록 그리드 버튼
  const inventoryGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: <SearchIcon /> },
    { label: '행추가', onClick: handleAdd, icon: <AddIcon /> },
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
          반제품관리
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
                label="제품 ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="제품 ID를 입력하세요"
                InputLabelProps={{
                  shrink: true,
                }}
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
                InputLabelProps={{
                  shrink: true,
                }}
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
                <InputLabel id="useYn-label" shrink>사용여부</InputLabel>
                <Select
                  {...field}
                  labelId="useYn-label"
                  label="사용여부"
                  displayEmpty
                  notched
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="Y">사용</MenuItem>
                  <MenuItem value="N">미사용</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Controller
                name="fromDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="등록일(시작)"
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        InputLabelProps: {
                          shrink: true,
                        },
                        placeholder: "시작일을 선택하세요"
                      }
                    }}
                  />
                )}
              />
              <Controller
                name="toDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="등록일(종료)"
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        InputLabelProps: {
                          shrink: true,
                        },
                        placeholder: "종료일을 선택하세요"
                      }
                    }}
                  />
                )}
              />
            </Stack>
          </LocalizationProvider>
        </Grid>
      </SearchCondition>
      
      {/* 반제품 목록 그리드 */}
      <Box mt={3}>
        <EnhancedDataGridWrapper
          title="반제품 목록"
          rows={inventoryList}
          columns={inventoryColumns}
          buttons={inventoryGridButtons}
          height={500}
          loading={isLoading}
          tabId={props.tabId}
          gridProps={{
            editMode: 'row',
            initialState: {
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            },
            pageSizeOptions: [5, 10, 15, 25, 50, 100],
          }}
        />
      </Box>
      
      {/* 하단 정보 영역 */}
      <Box mt={2} p={2} sx={{ 
        bgcolor: getBgColor(), 
        borderRadius: 1,
        border: `1px solid ${getBorderColor()}`
      }}>
        <Stack spacing={1}>
          <Typography variant="body2" color={getTextColor()}>
            • 반제품관리에서는 생산 공정 중 발생하는 중간 제품의 정보를 등록, 수정, 삭제할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 반제품 코드, 제품명, 규격, 단위 등의 기본 정보와 함께 보관 창고를 지정할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 생산된 반제품은 재고 시스템과 연동되어 추적 관리됩니다.
          </Typography>
        </Stack>
      </Box>

      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="반제품관리 도움말"
      >
        <Typography variant="body2" color={getTextColor()}>
          • 반제품관리에서는 생산 과정에서 발생하는 반제품의 정보를 등록하고 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 반제품코드, 반제품명, 규격, 단위 등의 정보를 관리하여 반제품 정보를 체계적으로 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 반제품 정보는 생산 계획, 재고 관리, 생산 실적 관리 등에서 활용됩니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default HalfProductManagement; 