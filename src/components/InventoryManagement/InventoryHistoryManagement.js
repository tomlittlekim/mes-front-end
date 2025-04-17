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
import { SearchCondition, EnhancedDataGridWrapper } from '../Common';
import DateRangePicker from '../Common/DateRangePicker';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import HelpModal from '../Common/HelpModal';
import { GRAPHQL_URL } from '../../config';
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
        changeQty
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
      // 자재명 필드 디버깅 로그 추가
      console.log('검색 조건 자재명:', data.materialName);

      const filter = {
        inOutType: data.inOutType || null,
        warehouseName: data.warehouseName || null,
        supplierName: data.supplierName || null,
        manufacturerName: data.manufacturerName || null,
        // 필드명을 백엔드 DTO와 일치시킴
      };

      // 자재명이 있는 경우에만 materialNames 필드 추가
      if (data.materialName && data.materialName.trim() !== '') {
        filter.materialNames = [data.materialName.trim()];
      }
      
      // 날짜 필드 추가
      if (data.dateRange?.startDate) {
        filter.startDate = new Date(data.dateRange.startDate).toISOString().split('T')[0];
      }
      
      if (data.dateRange?.endDate) {
        filter.endDate = new Date(data.dateRange.endDate).toISOString().split('T')[0];
      }

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
            changeQty: item.changeQty,
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
      renderCell: (params) => {
        const raw = params.row?.inOutType;
        let text = '';
        let color = '';
      
        if (raw === 'IN') {
          text = '입고';
          color = '#4caf50';
        } else if (raw === 'OUT') {
          text = '출고';
          color = '#f44336';
        }
      
        return (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%', 
              width: '100%' 
            }}
          >
            <Typography sx={{ color, fontWeight: '', fontSize: '14px' }}>
              {text}
            </Typography>
          </Box>
        );
      },
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
    { field: 'changeQty', 
      headerName: '변동수량',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      editable: false,
      renderCell: (params) => {
        const value = params.value;
        const color = value > 0 ? '#4caf50' : value < 0 ? '#f44336' : 'inherit';
    
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <Typography sx={{ color, fontWeight: '' }}>
              {value}
            </Typography>
          </Box>
        );
      },
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
              <FormControl variant="outlined" size="small" placeholder="입출고유형을 입력하세요" fullWidth>
                <InputLabel id="inOutType-label">입출고유형</InputLabel>
                <Select
                  {...field}
                  labelId="inOutType-label"
                  label="입출고유형"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="IN">입고</MenuItem>
                  <MenuItem value="OUT">출고</MenuItem>
                </Select>
              </FormControl>
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
              height={660}
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

