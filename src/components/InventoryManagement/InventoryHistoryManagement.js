// import React, { useState, useEffect } from 'react';
// import './InventoryHistoryManagement.css';
// import { useForm, Controller } from 'react-hook-form';
// import { 
//   TextField, 
//   FormControl, 
//   InputLabel, 
//   MenuItem, 
//   Select,
//   Grid, 
//   Box, 
//   Typography, 
//   useTheme,
//   Stack,
//   IconButton,
//   alpha
// } from '@mui/material';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
// import SearchIcon from '@mui/icons-material/Search';
// import PrintIcon from '@mui/icons-material/Print';
// import FileDownloadIcon from '@mui/icons-material/FileDownload';
// import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
// import { MuiDataGridWrapper, SearchCondition } from '../Common';
// import Swal from 'sweetalert2';
// import { useDomain, DOMAINS } from '../../contexts/DomainContext';
// import HelpModal from '../Common/HelpModal';

// const InventoryHistoryManagement = (props) => {
//   // 현재 테마 가져오기
//   const theme = useTheme();
//   const { domain } = useDomain();
//   const isDarkMode = theme.palette.mode === 'dark';
  
//   // 도메인별 색상 설정
//   const getTextColor = () => {
//     if (domain === DOMAINS.PEMS) {
//       return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
//     }
//     return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
//   };
  
//   const getBgColor = () => {
//     if (domain === DOMAINS.PEMS) {
//       return isDarkMode ? 'rgba(45, 30, 15, 0.5)' : 'rgba(252, 235, 212, 0.6)';
//     }
//     return isDarkMode ? 'rgba(0, 27, 63, 0.5)' : 'rgba(232, 244, 253, 0.6)';
//   };
  
//   const getBorderColor = () => {
//     if (domain === DOMAINS.PEMS) {
//       return isDarkMode ? '#3d2814' : '#f5e8d7';
//     }
//     return isDarkMode ? '#1e3a5f' : '#e0e0e0';
//   };
  
//   // React Hook Form 설정
//   const { control, handleSubmit, reset } = useForm({
//     defaultValues: {
//       warehouseId: '',
//       itemType: '',
//       itemId: '',
//       itemName: '',
//       transactionType: '',
//       fromDate: null,
//       toDate: null
//     }
//   });

//   // 상태 관리
//   const [isLoading, setIsLoading] = useState(true);
//   const [inventoryHistory, setInventoryHistory] = useState([]);
//   const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

//   // 초기화 함수
//   const handleReset = () => {
//     reset({
//       warehouseId: '',
//       itemType: '',
//       itemId: '',
//       itemName: '',
//       transactionType: '',
//       fromDate: null,
//       toDate: null
//     });
//   };

//   // 검색 실행 함수
//   const handleSearch = (data) => {
//     console.log('검색 조건:', data);
    
//     // API 호출 대신 더미 데이터 사용
//     const dummyData = [
//       { id: 'TH001', transactionDate: '2024-03-13 14:00', transactionType: '입고', warehouseId: '자재창고A', warehouseName: '자재창고A', itemId: '1332', itemName: '밀키루', itemType: '원자재', spec: '정품 잉크 믹스', unit: 'Kg', price: 5000, quantity: 15, amount: 75000, refDocNo: 'PO-20240310-001', issuedBy: '오리온', approvedBy: '김창고', note: '정기발주분' },
//       { id: 'TH002', transactionDate: '2024-03-13 17:00', transactionType: '출고', warehouseId: '자재창고A', warehouseName: '자재창고A', itemId: '1332', itemName: '밀키루', itemType: '원자재', spec: '정품 잉크 믹스', unit: 'Kg', price: 5000, quantity: 10, amount: 50000, refDocNo: 'WO-20240313-002', issuedBy: '오리온', approvedBy: '박관리', note: '생산용' },
//       { id: 'TH003', transactionDate: '2024-03-14 09:30', transactionType: '입고', warehouseId: '자재창고B', warehouseName: '자재창고B', itemId: '4523', itemName: '박력분', itemType: '원자재', spec: '밀가루, 고급형', unit: 'Kg', price: 3000, quantity: 30, amount: 90000, refDocNo: 'PO-20240312-003', issuedBy: '해태', approvedBy: '이자재', note: '' },
//       { id: 'TH004', transactionDate: '2024-03-14 11:45', transactionType: '출고', warehouseId: '자재창고B', warehouseName: '자재창고B', itemId: '4523', itemName: '박력분', itemType: '원자재', spec: '밀가루, 고급형', unit: 'Kg', price: 3000, quantity: 15, amount: 45000, refDocNo: 'WO-20240314-001', issuedBy: '해태', approvedBy: '정완제', note: '시제품 생산용' },
//       { id: 'TH005', transactionDate: '2024-03-15 13:20', transactionType: '조정', warehouseId: '자재창고A', warehouseName: '자재창고A', itemId: '2245', itemName: '포장비닐', itemType: '부자재', spec: '100cm(폭) 롤형태', unit: 'EA', price: 300, quantity: -5, amount: -1500, refDocNo: 'ADJ-20240315-001', issuedBy: '나관리', approvedBy: '김책임', note: '불량품 조정' },
//       { id: 'TH006', transactionDate: '2024-03-16 10:10', transactionType: '이동', warehouseId: '자재창고A', warehouseName: '자재창고A', itemId: '8872', itemName: '완제품박스', itemType: '부자재', spec: '30x40x15cm', unit: 'EA', price: 500, quantity: 50, amount: 25000, refDocNo: 'MOV-20240316-001', issuedBy: '이동담당', approvedBy: '박승인', note: '창고이동 (A→B)' }
//     ];
    
//     setInventoryHistory(dummyData);
//   };

//   // 인쇄 버튼 클릭 핸들러
//   const handlePrint = () => {
//     Swal.fire({
//       icon: 'info',
//       title: '인쇄',
//       text: '인쇄 기능이 실행되었습니다.',
//       confirmButtonText: '확인'
//     });
//   };

//   // 내보내기 버튼 클릭 핸들러
//   const handleExport = () => {
//     Swal.fire({
//       icon: 'info',
//       title: '내보내기',
//       text: '데이터가 엑셀 파일로 내보내기 되었습니다.',
//       confirmButtonText: '확인'
//     });
//   };

//   // 컴포넌트 마운트 시 초기 데이터 로드
//   useEffect(() => {
//     // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
//     const timer = setTimeout(() => {
//       handleSearch({});
//       setIsLoading(false);
//     }, 100);
    
//     return () => clearTimeout(timer);
//   }, []);

//   // 재고 이력 그리드 컬럼 정의
//   const historyColumns = [
//     { field: 'transactionDate', headerName: '등록일시', width: 150 },
//     { field: 'transactionType', headerName: '유형', width: 100, 
//       cellClassName: (params) => {
//         if (params.value === '입고') return 'transaction-in';
//         if (params.value === '출고') return 'transaction-out';
//         if (params.value === '조정') return 'transaction-adjust';
//         if (params.value === '이동') return 'transaction-move';
//         return '';
//       }
//     },
//     { field: 'warehouseId', headerName: '창고코드', width: 110 },
//     { field: 'warehouseName', headerName: '창고명', width: 120 },
//     { field: 'itemId', headerName: '자재ID', width: 100 },
//     { field: 'itemName', headerName: '자재명', width: 150, flex: 1 },
//     { field: 'itemType', headerName: '품목유형', width: 100 },
//     { field: 'spec', headerName: '규격', width: 150 },
//     { field: 'unit', headerName: '단위', width: 70 },
//     { field: 'price', headerName: '단가', width: 90, type: 'number' },
//     { field: 'quantity', headerName: '수량', width: 90, type: 'number',
//       cellClassName: (params) => {
//         if (params.value < 0) return 'negative-quantity';
//         return 'positive-quantity';
//       }
//     },
//     { field: 'amount', headerName: '총 금액', width: 110, type: 'number' },
//     { field: 'refDocNo', headerName: '참조문서번호', width: 150 },
//     { field: 'issuedBy', headerName: '제조사', width: 100 },
//     { field: 'approvedBy', headerName: '담당자', width: 100 },
//     { field: 'note', headerName: '비고', width: 150 }
//   ];

//   // 재고 이력 그리드 버튼
//   const historyGridButtons = [
//     { label: '조회', onClick: handleSubmit(handleSearch), icon: <SearchIcon /> },
//     { label: '인쇄', onClick: handlePrint, icon: <PrintIcon /> },
//     { label: '내보내기', onClick: handleExport, icon: <FileDownloadIcon /> }
//   ];

//   return (
//     <Box sx={{ p: 0, minHeight: '100vh' }}>
//       <Box sx={{ 
//         display: 'flex', 
//         alignItems: 'center', 
//         mb: 2,
//         borderBottom: `1px solid ${getBorderColor()}`,
//         pb: 1
//       }}>
//         <Typography 
//           variant="h5" 
//           component="h2" 
//           sx={{ 
//             fontWeight: 600,
//             color: getTextColor()
//           }}
//         >
//           재고이력관리
//         </Typography>
//         <IconButton
//           onClick={() => setIsHelpModalOpen(true)}
//           sx={{
//             ml: 1,
//             color: isDarkMode ? theme.palette.primary.light : theme.palette.primary.main,
//             '&:hover': {
//               backgroundColor: isDarkMode 
//                 ? alpha(theme.palette.primary.light, 0.1)
//                 : alpha(theme.palette.primary.main, 0.05)
//             }
//           }}
//         >
//           <HelpOutlineIcon />
//         </IconButton>
//       </Box>

//       {/* 검색 조건 영역 - 공통 컴포넌트 사용 */}
//       <SearchCondition 
//         onSearch={handleSubmit(handleSearch)}
//         onReset={handleReset}
//       >
//         <Grid item xs={12} sm={6} md={3}>
//           <Controller
//             name="warehouseId"
//             control={control}
//             render={({ field }) => (
//               <FormControl variant="outlined" size="small" fullWidth>
//                 <InputLabel id="warehouseId-label">창고</InputLabel>
//                 <Select
//                   {...field}
//                   labelId="warehouseId-label"
//                   label="창고"
//                 >
//                   <MenuItem value="">전체</MenuItem>
//                   <MenuItem value="자재창고A">자재창고A</MenuItem>
//                   <MenuItem value="자재창고B">자재창고B</MenuItem>
//                   <MenuItem value="자재창고C">자재창고C</MenuItem>
//                   <MenuItem value="완제품창고">완제품창고</MenuItem>
//                 </Select>
//               </FormControl>
//             )}
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Controller
//             name="itemType"
//             control={control}
//             render={({ field }) => (
//               <FormControl variant="outlined" size="small" fullWidth>
//                 <InputLabel id="itemType-label">품목유형</InputLabel>
//                 <Select
//                   {...field}
//                   labelId="itemType-label"
//                   label="품목유형"
//                 >
//                   <MenuItem value="">전체</MenuItem>
//                   <MenuItem value="원자재">원자재</MenuItem>
//                   <MenuItem value="부자재">부자재</MenuItem>
//                   <MenuItem value="반제품">반제품</MenuItem>
//                   <MenuItem value="완제품">완제품</MenuItem>
//                 </Select>
//               </FormControl>
//             )}
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Controller
//             name="transactionType"
//             control={control}
//             render={({ field }) => (
//               <FormControl variant="outlined" size="small" fullWidth>
//                 <InputLabel id="transactionType-label">유형</InputLabel>
//                 <Select
//                   {...field}
//                   labelId="transactionType-label"
//                   label="유형"
//                 >
//                   <MenuItem value="">전체</MenuItem>
//                   <MenuItem value="입고">입고</MenuItem>
//                   <MenuItem value="출고">출고</MenuItem>
//                   <MenuItem value="조정">조정</MenuItem>
//                   <MenuItem value="이동">이동</MenuItem>
//                 </Select>
//               </FormControl>
//             )}
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Controller
//             name="itemId"
//             control={control}
//             render={({ field }) => (
//               <TextField
//                 {...field}
//                 label="자재코드"
//                 variant="outlined"
//                 size="small"
//                 fullWidth
//                 placeholder="자재코드를 입력하세요"
//               />
//             )}
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Controller
//             name="itemName"
//             control={control}
//             render={({ field }) => (
//               <TextField
//                 {...field}
//                 label="자재명"
//                 variant="outlined"
//                 size="small"
//                 fullWidth
//                 placeholder="자재명을 입력하세요"
//               />
//             )}
//           />
//         </Grid>
//         <Grid item xs={12} sm={12} md={6}>
//           <LocalizationProvider dateAdapter={AdapterDateFns}>
//             <Stack direction="row" spacing={1} alignItems="center">
//               <Controller
//                 name="fromDate"
//                 control={control}
//                 render={({ field }) => (
//                   <DatePicker
//                     {...field}
//                     label="시작일"
//                     slotProps={{
//                       textField: {
//                         size: "small",
//                         fullWidth: true
//                       }
//                     }}
//                   />
//                 )}
//               />
//               <Typography variant="body2" sx={{ mx: 1 }}>~</Typography>
//               <Controller
//                 name="toDate"
//                 control={control}
//                 render={({ field }) => (
//                   <DatePicker
//                     {...field}
//                     label="종료일"
//                     slotProps={{
//                       textField: {
//                         size: "small",
//                         fullWidth: true
//                       }
//                     }}
//                   />
//                 )}
//               />
//             </Stack>
//           </LocalizationProvider>
//         </Grid>
//       </SearchCondition>
      
//       {/* 그리드 영역 */}
//       {!isLoading && (
//         <Grid container spacing={2}>
//           <Grid item xs={12}>
//             <MuiDataGridWrapper
//               title="재고 이력"
//               rows={inventoryHistory}
//               columns={historyColumns}
//               buttons={historyGridButtons}
//               height={500}
//             />
//           </Grid>
//         </Grid>
//       )}
      
//       {/* 하단 정보 영역 */}
//       <Box mt={2} p={2} sx={{ 
//         bgcolor: getBgColor(), 
//         borderRadius: 1,
//         border: `1px solid ${getBorderColor()}`
//       }}>
//         <Stack spacing={1}>
//           <Typography variant="body2" color={getTextColor()}>
//             • 재고상세이력에서는 자재 및 제품의 입고, 출고, 조정, 이동 등 모든 재고 변동 이력을 조회할 수 있습니다.
//           </Typography>
//           <Typography variant="body2" color={getTextColor()}>
//             • 참조문서번호를 통해 원본 문서(발주, 작업지시 등)를 추적할 수 있습니다.
//           </Typography>
//           <Typography variant="body2" color={getTextColor()}>
//             • 조회 결과는 인쇄하거나 엑셀로 내보내기가 가능합니다.
//           </Typography>
//         </Stack>
//       </Box>

//     </Box>
//   );
// };

// export default InventoryHistoryManagement; 

import React, { useState, useEffect, useCallback } from 'react';
import './ReceivingManagement.css';
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
import { SearchCondition, EnhancedDataGridWrapper } from '../Common';
import DateRangePicker from '../Common/DateRangePicker';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import HelpModal from '../Common/HelpModal';
import { GRAPHQL_URL } from '../../config';
import Message from '../../utils/message/Message';
import ko from "date-fns/locale/ko";


const InventoryHistoryManagement = (props) => {
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
  const { control, handleSubmit, reset, getValues, setValue } = useForm({
    defaultValues: {
      inOutType: '',
      warehouseName: '',
      supplierName: '',
      manufacturerName: '',
      materialName: '',
      unit: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    }
  });

  // 초기화 함수
  const handleReset = () => {
    reset({
      inOutType: '',
      warehouseName: '',
      supplierName: '',
      manufacturerName: '',
      materialName: '',
      unit: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    });
  };
  

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);

  const [receivingList, setReceivingList] = useState([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  // 추가 코드 
  const [refreshKey, setRefreshKey] = useState(0); // 강제 리렌더링용 키
  const [addRows,setAddRows] = useState([]);
  const [updatedDetailRows, setUpdatedDetailRows] = useState([]); // 수정된 필드만 저장하는 객체

  const GET_INVENTORY_HISTORY_LIST = `
    query getInventoryHistoryList($filter: InventoryHistoryFilter) {
      getInventoryHistoryList(filter: $filter) {
        inOutType
        warehouseName
        supplierName
        manufacturerName
        materialName
        currentQty
        unit
        createDate
      }
    }
  `

  const handleDateRangeChange = (startDate, endDate) => {
    setValue('dateRange', { startDate, endDate });
  };

  // 검색 실행 함수
  const handleSearch = useCallback(async (data) => {
    setUpdatedDetailRows([]);
    setAddRows([]);

    try {

      const filter = {
        inOutType: data.inOutType || null,
        warehouseName: data.warehouseName || null,
        supplierName: data.supplierName || null,
        manufacturerName: data.manufacturerName || null,
        materialName: data.materialName || null,
        startDate: data.dateRange?.startDate ? new Date(data.dateRange.startDate).toISOString().split('T')[0] : null,
        endDate: data.dateRange?.endDate ? new Date(data.dateRange.endDate).toISOString().split('T')[0] : null
      };

      console.log('GraphQL 필터:', filter);

      // 직접 fetch API를 사용하여 요청 (fetchGraphQL 함수 대신)
      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: GET_INVENTORY_HISTORY_LIST,
          variables: { filter }
        })
      });
      
      console.log('응답 상태:', response.status, response.statusText);
      
      const responseText = await response.text();
      console.log('응답 내용:', responseText.substring(0, 200));
      
      if (responseText.trim()) {
        const result = JSON.parse(responseText);
        console.log('파싱된 결과:', result);
        
          if (result.data && result.data.getInventoryHistoryList) {
          // 받아온 데이터로 상태 업데이트
          setReceivingList(result.data.getInventoryHistoryList.map((item, index) => ({
            id: `${index}`,
            inOutType: item.inOutType,
            warehouseName: item.warehouseName,
            supplierName: item.supplierName,
            manufacturerName: item.manufacturerName,
            materialName: item.materialName,
            unit: item.unit,
            currentQty: item.currentQty,
            createDate: item.createDate,
          })));
          
          // 선택 상태 초기화
        } else {
          console.error('응답 데이터가 예상 형식과 다릅니다:', result);
          // 응답 데이터에 문제가 있거나 빈 배열이면 빈 배열로 설정
          setReceivingList([]);
          
          Swal.fire({
            icon: 'info',
            title: '알림',
            text: '데이터를 가져오지 못했습니다. 백엔드 연결을 확인해주세요.' + 
                  (result.errors ? ` 오류: ${result.errors[0]?.message || '알 수 없는 오류'}` : '')
          });
        }
      } else {
        console.error('빈 응답을 받았습니다');
        setReceivingList([]);
        
        Swal.fire({
          icon: 'error',
          title: '오류 발생',
          text: '서버로부터 빈 응답을 받았습니다.'
        });
      }
    } catch (error) {
      console.error('데이터 조회 오류:', error);
      setReceivingList([]); // 오류 발생 시 빈 배열로 설정
      
      Swal.fire({
        icon: 'error',
        title: '데이터 조회 실패',
        text: `오류: ${error.message || '알 수 없는 오류가 발생했습니다.'}`
      });
    }
  }, []);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
    const timer = setTimeout(() => {
      handleSearch({});
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [handleSearch]);

  // 재고 목록 그리드 컬럼 정의
  const receivingColumns = [
    {
      field: 'createDate',
      headerName: '변동일자',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      editable: false,
      renderCell: (params) => {
        const raw = params.row?.createDate;
        if (!raw) return '';
        return raw.replace('T', ' ');
      },
      flex: 1,
    },
    { field: 'inOutType', 
      headerName: '입출고유형', 
      width: 100,
      headerAlign: 'center',
      align: 'center',
      editable: false,
      flex: 1,
     }, 
    { field: 'warehouseName', 
      headerName: '창고이름', 
      width: 100,
      headerAlign: 'center',
      align: 'center',
      editable: false,
      flex: 1,
      },
    { field: 'supplierName', 
      headerName: '공급업체', 
      width: 100,
      headerAlign: 'center',
      align: 'center',
      editable: false,
      flex: 1,
      },
    { field: 'manufacturerName', 
      headerName: '제조사', 
      width: 120,
      headerAlign: 'center',
      align: 'center',
      editable: false,
      type: 'singleSelect',
      flex: 1,
     },
    { field: 'materialName', 
      headerName: '자재명', 
      width: 100,
      headerAlign: 'center',
      align: 'center',
      editable: false,
      flex: 1,
      },
    { field: 'unit', 
      headerName: '단위', 
      width: 100,
      headerAlign: 'center',
      align: 'center',
      editable: false,
     },
    { field: 'currentQty', 
      headerName: '현재수량',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      editable: false,
     },
  ];

  // 재고 목록 그리드 버튼
  const receivingGridButtons = [
    // { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
    // { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    // { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> },
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
          자재 상세 이력
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
            name="warehouseName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="창고이름"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="창고이름을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="inOutType"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="입출고유형"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="입출고유형을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="supplierName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="공급업체"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="공급업체를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="manufacturerName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="제조사"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="제조사를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="materialName"
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
        <Grid item xs={12} sm={6} md={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns}
                                  adapterLocale={ko}>
              <Controller
                  name="dateRange"
                  control={control}
                  render={({field}) => (
                      <DateRangePicker
                          startDate={field.value.startDate}
                          endDate={field.value.endDate}
                          onRangeChange={handleDateRangeChange}
                          startLabel="시작일"
                          endLabel="종료일"
                          label="출고일"
                          size="small"
                      />
                  )}
              />
            </LocalizationProvider>
        </Grid>
      </SearchCondition>
      
      {/* 그리드 영역 */}
      {!isLoading && (
        <Grid container spacing={1}>
          {/* 재고 기본 정보 그리드 */}
          <Grid item xs={12} md={12}>
          <EnhancedDataGridWrapper
              title="재고 상세 이력"
              key={refreshKey}  // refreshKey가 변경되면 전체 그리드가 재마운트됩니다.
              rows={receivingList}
              columns={receivingColumns}
              buttons={receivingGridButtons}
              height={450}
              // onRowClick={handleReceivingSelect}
              tabId={props.tabId + "-factories"}
              gridProps={{
                editMode: 'cell',
                sx: {
                  '& .MuiDataGrid-cell': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }
                }
              }}
              />
          </Grid>
        </Grid>
      )}

      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="재고이력관리 도움말"
      >
        <Typography variant="body2" color={getTextColor()}>
          • 재고이력관리에서는 자재나 제품의 재고 변동 이력을 조회할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 제품 정보, 입출고 수량, 변동일자 등을 조회하여 재고 변동 내역을 확인할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 재고 이력 정보는 재고 관리, 생산 계획 등에서 활용됩니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default InventoryHistoryManagement;  

