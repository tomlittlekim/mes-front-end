import React, { useState, useEffect } from 'react';
import './InventoryStatusManagement.css';
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
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const InventoryStatusManagement = () => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // React Hook Form 설정
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      warehouseId: '',
      itemId: '',
      itemName: '',
      itemType: '',
      fromDate: null,
      toDate: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [inventoryList, setInventoryList] = useState([]);

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
      warehouseId: '',
      itemId: '',
      itemName: '',
      itemType: '',
      fromDate: null,
      toDate: null
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: 'M001', warehouseId: '자재창고A', warehouseName: '자재창고A', location: 'A-101', itemId: '1332', itemName: '밀키루', type: '원자재', spec: '정품 잉크 믹스', unit: 'Kg', price: 5000, openingQty: 100, inQty: 50, outQty: 35, adjustQty: 0, currentQty: 115, safetyQty: 30, issuedBy: '김창고', lastUpdated: '2024-04-15' },
      { id: 'M002', warehouseId: '자재창고B', warehouseName: '자재창고B', location: 'B-202', itemId: '4523', itemName: '박력분', type: '원자재', spec: '밀가루, 고급형', unit: 'Kg', price: 3000, openingQty: 200, inQty: 100, outQty: 70, adjustQty: -5, currentQty: 225, safetyQty: 50, issuedBy: '박관리', lastUpdated: '2024-04-16' },
      { id: 'M003', warehouseId: '자재창고A', warehouseName: '자재창고A', location: 'A-103', itemId: '2245', itemName: '포장비닐', type: '부자재', spec: '100cm(폭) 롤형태', unit: 'EA', price: 300, openingQty: 500, inQty: 200, outQty: 150, adjustQty: 0, currentQty: 550, safetyQty: 100, issuedBy: '이자재', lastUpdated: '2024-04-17' },
      { id: 'M004', warehouseId: '완제품창고', warehouseName: '완제품창고', location: 'C-303', itemId: '8872', itemName: '완제품박스', type: '부자재', spec: '30x40x15cm', unit: 'EA', price: 500, openingQty: 1000, inQty: 500, outQty: 800, adjustQty: 10, currentQty: 710, safetyQty: 200, issuedBy: '정완제', lastUpdated: '2024-04-18' }
    ];
    
    setInventoryList(dummyData);
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

  // 재고 현황 그리드 컬럼 정의
  const inventoryColumns = [
    { field: 'warehouseId', headerName: '창고코드', width: 110 },
    { field: 'warehouseName', headerName: '창고명', width: 120 },
    { field: 'location', headerName: '위치', width: 100 },
    { field: 'itemId', headerName: '자재ID', width: 100 },
    { field: 'itemName', headerName: '자재명', width: 150, flex: 1 },
    { field: 'type', headerName: '품목유형', width: 100 },
    { field: 'spec', headerName: '규격', width: 150 },
    { field: 'unit', headerName: '단위', width: 70 },
    { field: 'price', headerName: '단가', width: 80, type: 'number' },
    { field: 'openingQty', headerName: '기초수량', width: 90, type: 'number' },
    { field: 'inQty', headerName: '입고수량', width: 90, type: 'number' },
    { field: 'outQty', headerName: '출고수량', width: 90, type: 'number' },
    { field: 'adjustQty', headerName: '조정수량', width: 90, type: 'number' },
    { field: 'currentQty', headerName: '현재고', width: 90, type: 'number' },
    { field: 'safetyQty', headerName: '안전재고', width: 90, type: 'number' },
    { field: 'issuedBy', headerName: '담당자', width: 100 },
    { field: 'lastUpdated', headerName: '최종수정일', width: 120 }
  ];

  // 재고 현황 그리드 버튼
  const inventoryGridButtons = [
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
          자재/재고현황
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
              title="재고 현황"
              rows={inventoryList}
              columns={inventoryColumns}
              buttons={inventoryGridButtons}
              height={500}
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
            • 자재/재고현황에서는 창고별 모든 자재 및 제품의 실시간 재고 현황을 조회할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 기초수량, 입고수량, 출고수량, 조정수량을 기반으로 현 재고를 확인하고 안전재고와 비교할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 모든 항목은 엑셀로 내보내기가 가능하며 인쇄하여 실물 문서로 관리할 수도 있습니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default InventoryStatusManagement; 