import React, { useState, useEffect } from 'react';
import './OutboundManagement.css';
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
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const OutboundManagement = () => {
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
      productType: '',
      destination: '',
      fromDate: null,
      toDate: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [outboundList, setOutboundList] = useState([]);
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [outboundDetail, setOutboundDetail] = useState(null);

  // 초기화 함수
  const handleReset = () => {
    reset({
      productId: '',
      productName: '',
      productType: '',
      destination: '',
      fromDate: null,
      toDate: null
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: 'O0001', outboundDate: '2024-04-15', destination: '생산1팀', product: '잉크믹스_보라', type: '원자재', spec: '정품 잉크 믹스', unit: 'L', price: 5000, quantity: 20, totalAmount: 100000, warehouse: '자재창고A', note: '정기출고' },
      { id: 'O0002', outboundDate: '2024-04-16', destination: '생산2팀', product: '모조지 70g', type: '원자재', spec: '91.4cm(폭) 용지', unit: 'M', price: 1000, quantity: 100, totalAmount: 100000, warehouse: '자재창고B', note: '긴급출고' },
      { id: 'O0003', outboundDate: '2024-04-17', destination: '3공장', product: '포장비닐', type: '부자재', spec: '100cm(폭) 롤형태', unit: 'EA', price: 300, quantity: 50, totalAmount: 15000, warehouse: '자재창고A', note: '' },
      { id: 'O0004', outboundDate: '2024-04-18', destination: '포장팀', product: '완제품박스', type: '부자재', spec: '30x40x15cm', unit: 'EA', price: 500, quantity: 200, totalAmount: 100000, warehouse: '자재창고C', note: '출하준비' }
    ];
    
    setOutboundList(dummyData);
    setSelectedOutbound(null);
    setOutboundDetail(null);
  };

  // 출고 선택 핸들러
  const handleOutboundSelect = (params) => {
    const outbound = outboundList.find(r => r.id === params.id);
    setSelectedOutbound(outbound);
    
    if (!outbound) return;
    
    // 출고 상세 정보 (실제로는 API 호출)
    const detailData = {
      ...outbound,
      destinationCode: 'DST' + outbound.id.substring(1),
      destinationContact: '010-9876-5432',
      requestId: 'REQ' + outbound.id.substring(1),
      processId: 'PR' + outbound.id.substring(1),
      approvalStatus: '승인완료',
      approvalUser: '김승인',
      approvalDate: outbound.outboundDate,
      registDate: outbound.outboundDate,
      updateDate: outbound.outboundDate,
      registUser: '시스템',
      updateUser: '시스템'
    };
    
    setOutboundDetail([detailData]);
  };

  // 등록 버튼 클릭 핸들러
  const handleAdd = () => {
    const newOutbound = {
      id: `NEW_${Date.now()}`,
      outboundDate: new Date().toISOString().split('T')[0],
      destination: '',
      product: '',
      type: '',
      spec: '',
      unit: '',
      price: 0,
      quantity: 0,
      totalAmount: 0,
      warehouse: '',
      note: '',
      destinationCode: '',
      destinationContact: '',
      requestId: '',
      processId: '',
      approvalStatus: '대기',
      approvalUser: '',
      approvalDate: '',
      registDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      registUser: '시스템',
      updateUser: '시스템'
    };
    
    setOutboundList([...outboundList, newOutbound]);
    setSelectedOutbound(newOutbound);
    setOutboundDetail([newOutbound]);
  };

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    if (!selectedOutbound) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '저장할 출고정보를 선택해주세요.',
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
    if (!selectedOutbound) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 출고정보를 선택해주세요.',
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
        const updatedList = outboundList.filter(r => r.id !== selectedOutbound.id);
        setOutboundList(updatedList);
        setSelectedOutbound(null);
        setOutboundDetail(null);
        Swal.fire({
          icon: 'success',
          title: '성공',
          text: '삭제되었습니다.',
          confirmButtonText: '확인'
        });
      }
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

  // 출고 목록 그리드 컬럼 정의
  const outboundColumns = [
    { field: 'id', headerName: '출고ID', width: 100 },
    { field: 'outboundDate', headerName: '출고일자', width: 110 },
    { field: 'destination', headerName: '출고처', width: 150 },
    { field: 'product', headerName: '품목명', width: 180, flex: 1 },
    { field: 'type', headerName: '품목유형', width: 100 },
    { field: 'spec', headerName: '규격', width: 120 },
    { field: 'unit', headerName: '단위', width: 70 },
    { field: 'price', headerName: '단가', width: 80, type: 'number' },
    { field: 'quantity', headerName: '수량', width: 80, type: 'number' },
    { field: 'totalAmount', headerName: '총금액', width: 100, type: 'number' },
    { field: 'warehouse', headerName: '출고창고', width: 120 },
    { field: 'note', headerName: '비고', width: 150 }
  ];
  
  // 출고 상세 정보 그리드 컬럼 정의
  const detailColumns = [
    { field: 'id', headerName: '출고ID', width: 100, editable: true },
    { field: 'outboundDate', headerName: '출고일자', width: 110, editable: true },
    { field: 'destination', headerName: '출고처', width: 150, editable: true },
    { field: 'destinationCode', headerName: '출고처코드', width: 100, editable: true },
    { field: 'destinationContact', headerName: '연락처', width: 120, editable: true },
    { field: 'requestId', headerName: '요청번호', width: 120, editable: true },
    { field: 'processId', headerName: '공정번호', width: 120, editable: true },
    { field: 'product', headerName: '품목명', width: 180, editable: true },
    { field: 'type', headerName: '품목유형', width: 100, editable: true, type: 'singleSelect', valueOptions: ['원자재', '부자재', '반제품', '완제품'] },
    { field: 'spec', headerName: '규격', width: 120, editable: true },
    { field: 'unit', headerName: '단위', width: 70, editable: true },
    { field: 'price', headerName: '단가', width: 80, type: 'number', editable: true },
    { field: 'quantity', headerName: '수량', width: 80, type: 'number', editable: true },
    { field: 'totalAmount', headerName: '총금액', width: 100, type: 'number', editable: true },
    { field: 'warehouse', headerName: '출고창고', width: 120, editable: true, type: 'singleSelect', valueOptions: ['자재창고A', '자재창고B', '자재창고C', '완제품창고'] },
    { field: 'approvalStatus', headerName: '승인상태', width: 100, editable: true, type: 'singleSelect', valueOptions: ['대기', '승인완료', '반려', '취소'] },
    { field: 'approvalUser', headerName: '승인자', width: 100, editable: true },
    { field: 'approvalDate', headerName: '승인일자', width: 100, editable: true },
    { field: 'note', headerName: '비고', width: 150, editable: true },
    { field: 'registUser', headerName: '등록자', width: 100 },
    { field: 'registDate', headerName: '등록일', width: 120 },
    { field: 'updateUser', headerName: '수정자', width: 100 },
    { field: 'updateDate', headerName: '수정일', width: 120 }
  ];

  // 출고 목록 그리드 버튼
  const outboundGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: <SearchIcon /> }
  ];

  // 출고 상세 그리드 버튼
  const detailGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> }
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
          출고관리
        </Typography>
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
                label="품목코드"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="품목코드를 입력하세요"
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
                label="품목명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="품목명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="productType"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="productType-label">품목유형</InputLabel>
                <Select
                  {...field}
                  labelId="productType-label"
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
            name="destination"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="출고처"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="출고처를 입력하세요"
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
          {/* 출고 기본 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title="출고목록"
              rows={outboundList}
              columns={outboundColumns}
              buttons={outboundGridButtons}
              height={450}
              onRowClick={handleOutboundSelect}
            />
          </Grid>
          
          {/* 출고 상세 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title={`출고상세정보 ${selectedOutbound ? '- ' + selectedOutbound.id : ''}`}
              rows={outboundDetail || []}
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
            • 출고관리 화면에서는 원자재, 부자재 등의 출고 정보를 효율적으로 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 출고목록에서 특정 출고건을 선택하면 해당 출고의 상세 정보를 확인하고 편집할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 승인 상태 관리 및 출고 창고 지정을 통해 자재의 흐름을 체계적으로 관리할 수 있습니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default OutboundManagement; 