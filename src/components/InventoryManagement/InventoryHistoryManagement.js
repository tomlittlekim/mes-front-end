import React, { useState, useEffect } from 'react';
import './InventoryHistoryManagement.css';
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
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';

const InventoryHistoryManagement = () => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // React Hook Form 설정
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      warehouseId: '',
      itemType: '',
      itemId: '',
      itemName: '',
      transactionType: '',
      fromDate: null,
      toDate: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [inventoryHistory, setInventoryHistory] = useState([]);

  // 초기화 함수
  const handleReset = () => {
    reset({
      warehouseId: '',
      itemType: '',
      itemId: '',
      itemName: '',
      transactionType: '',
      fromDate: null,
      toDate: null
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: 'TH001', transactionDate: '2024-03-13 14:00', transactionType: '입고', warehouseId: '자재창고A', warehouseName: '자재창고A', itemId: '1332', itemName: '밀키루', itemType: '원자재', spec: '정품 잉크 믹스', unit: 'Kg', price: 5000, quantity: 15, amount: 75000, refDocNo: 'PO-20240310-001', issuedBy: '오리온', approvedBy: '김창고', note: '정기발주분' },
      { id: 'TH002', transactionDate: '2024-03-13 17:00', transactionType: '출고', warehouseId: '자재창고A', warehouseName: '자재창고A', itemId: '1332', itemName: '밀키루', itemType: '원자재', spec: '정품 잉크 믹스', unit: 'Kg', price: 5000, quantity: 10, amount: 50000, refDocNo: 'WO-20240313-002', issuedBy: '오리온', approvedBy: '박관리', note: '생산용' },
      { id: 'TH003', transactionDate: '2024-03-14 09:30', transactionType: '입고', warehouseId: '자재창고B', warehouseName: '자재창고B', itemId: '4523', itemName: '박력분', itemType: '원자재', spec: '밀가루, 고급형', unit: 'Kg', price: 3000, quantity: 30, amount: 90000, refDocNo: 'PO-20240312-003', issuedBy: '해태', approvedBy: '이자재', note: '' },
      { id: 'TH004', transactionDate: '2024-03-14 11:45', transactionType: '출고', warehouseId: '자재창고B', warehouseName: '자재창고B', itemId: '4523', itemName: '박력분', itemType: '원자재', spec: '밀가루, 고급형', unit: 'Kg', price: 3000, quantity: 15, amount: 45000, refDocNo: 'WO-20240314-001', issuedBy: '해태', approvedBy: '정완제', note: '시제품 생산용' },
      { id: 'TH005', transactionDate: '2024-03-15 13:20', transactionType: '조정', warehouseId: '자재창고A', warehouseName: '자재창고A', itemId: '2245', itemName: '포장비닐', itemType: '부자재', spec: '100cm(폭) 롤형태', unit: 'EA', price: 300, quantity: -5, amount: -1500, refDocNo: 'ADJ-20240315-001', issuedBy: '나관리', approvedBy: '김책임', note: '불량품 조정' },
      { id: 'TH006', transactionDate: '2024-03-16 10:10', transactionType: '이동', warehouseId: '자재창고A', warehouseName: '자재창고A', itemId: '8872', itemName: '완제품박스', itemType: '부자재', spec: '30x40x15cm', unit: 'EA', price: 500, quantity: 50, amount: 25000, refDocNo: 'MOV-20240316-001', issuedBy: '이동담당', approvedBy: '박승인', note: '창고이동 (A→B)' }
    ];
    
    setInventoryHistory(dummyData);
  };

  // 인쇄 버튼 클릭 핸들러
  const handlePrint = () => {
    Swal.fire({
      icon: 'info',
      title: '인쇄',
      text: '인쇄 기능이 실행되었습니다.',
      confirmButtonText: '확인'
    });
  };

  // 내보내기 버튼 클릭 핸들러
  const handleExport = () => {
    Swal.fire({
      icon: 'info',
      title: '내보내기',
      text: '데이터가 엑셀 파일로 내보내기 되었습니다.',
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

  // 재고 이력 그리드 컬럼 정의
  const historyColumns = [
    { field: 'transactionDate', headerName: '등록일시', width: 150 },
    { field: 'transactionType', headerName: '유형', width: 100, 
      cellClassName: (params) => {
        if (params.value === '입고') return 'transaction-in';
        if (params.value === '출고') return 'transaction-out';
        if (params.value === '조정') return 'transaction-adjust';
        if (params.value === '이동') return 'transaction-move';
        return '';
      }
    },
    { field: 'warehouseId', headerName: '창고코드', width: 110 },
    { field: 'warehouseName', headerName: '창고명', width: 120 },
    { field: 'itemId', headerName: '자재ID', width: 100 },
    { field: 'itemName', headerName: '자재명', width: 150, flex: 1 },
    { field: 'itemType', headerName: '품목유형', width: 100 },
    { field: 'spec', headerName: '규격', width: 150 },
    { field: 'unit', headerName: '단위', width: 70 },
    { field: 'price', headerName: '단가', width: 90, type: 'number' },
    { field: 'quantity', headerName: '수량', width: 90, type: 'number',
      cellClassName: (params) => {
        if (params.value < 0) return 'negative-quantity';
        return 'positive-quantity';
      }
    },
    { field: 'amount', headerName: '총 금액', width: 110, type: 'number' },
    { field: 'refDocNo', headerName: '참조문서번호', width: 150 },
    { field: 'issuedBy', headerName: '제조사', width: 100 },
    { field: 'approvedBy', headerName: '담당자', width: 100 },
    { field: 'note', headerName: '비고', width: 150 }
  ];

  // 재고 이력 그리드 버튼
  const historyGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: <SearchIcon /> },
    { label: '인쇄', onClick: handlePrint, icon: <PrintIcon /> },
    { label: '내보내기', onClick: handleExport, icon: <FileDownloadIcon /> }
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
          재고상세이력
        </Typography>
      </Box>

      {/* 검색 조건 영역 - 공통 컴포넌트 사용 */}
      <SearchCondition 
        onSearch={handleSubmit(handleSearch)}
        onReset={handleReset}
      >
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="warehouseId"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="warehouseId-label">창고</InputLabel>
                <Select
                  {...field}
                  labelId="warehouseId-label"
                  label="창고"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="자재창고A">자재창고A</MenuItem>
                  <MenuItem value="자재창고B">자재창고B</MenuItem>
                  <MenuItem value="자재창고C">자재창고C</MenuItem>
                  <MenuItem value="완제품창고">완제품창고</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="itemType"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="itemType-label">품목유형</InputLabel>
                <Select
                  {...field}
                  labelId="itemType-label"
                  label="품목유형"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="원자재">원자재</MenuItem>
                  <MenuItem value="부자재">부자재</MenuItem>
                  <MenuItem value="반제품">반제품</MenuItem>
                  <MenuItem value="완제품">완제품</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="transactionType"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="transactionType-label">유형</InputLabel>
                <Select
                  {...field}
                  labelId="transactionType-label"
                  label="유형"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="입고">입고</MenuItem>
                  <MenuItem value="출고">출고</MenuItem>
                  <MenuItem value="조정">조정</MenuItem>
                  <MenuItem value="이동">이동</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="itemId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="자재코드"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="자재코드를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="itemName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="자재명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="자재명을 입력하세요"
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
          <Grid item xs={12}>
            <MuiDataGridWrapper
              title="재고 이력"
              rows={inventoryHistory}
              columns={historyColumns}
              buttons={historyGridButtons}
              height={500}
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
            • 재고상세이력에서는 자재 및 제품의 입고, 출고, 조정, 이동 등 모든 재고 변동 이력을 조회할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={isDarkMode ? '#b3c5e6' : 'text.secondary'}>
            • 참조문서번호를 통해 원본 문서(발주, 작업지시 등)를 추적할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={isDarkMode ? '#b3c5e6' : 'text.secondary'}>
            • 조회 결과는 인쇄하거나 엑셀로 내보내기가 가능합니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default InventoryHistoryManagement; 