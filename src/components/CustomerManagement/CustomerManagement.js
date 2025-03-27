import React, { useState, useEffect } from 'react';
import './CustomerManagement.css';
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
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import HelpModal from '../Common/HelpModal';

const CustomerManagement = (props) => {
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
      customerCode: '',
      customerName: '',
      representativeName: '',
      useYn: '',
      business: ''
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [customerList, setCustomerList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // 초기화 함수
  const handleReset = () => {
    reset({
      customerCode: '',
      customerName: '',
      representativeName: '',
      useYn: '',
      business: ''
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: 'C001', name: '(주)에이비씨', code: 'ABC', business: '제조업', representative: '홍길동', phone: '02-1234-5678', address: '서울특별시 강남구', useYn: 'Y' },
      { id: 'C002', name: '우리물산', code: 'WRM', business: '도매업', representative: '김영희', phone: '02-2345-6789', address: '서울특별시 송파구', useYn: 'Y' },
      { id: 'C003', name: '더나은회사', code: 'TNH', business: '서비스업', representative: '이철수', phone: '02-3456-7890', address: '서울특별시 마포구', useYn: 'N' },
      { id: 'C004', name: '세계무역', code: 'SGM', business: '무역업', representative: '박지민', phone: '02-4567-8901', address: '서울특별시 용산구', useYn: 'Y' }
    ];
    
    setCustomerList(dummyData);
    setSelectedCustomer(null);
    setCustomerDetail(null);
  };

  // 거래처 선택 핸들러
  const handleCustomerSelect = (params) => {
    const customer = customerList.find(c => c.id === params.id);
    setSelectedCustomer(customer);
    
    if (customer) {
      // 상세 정보 - API 호출 대신 더미 데이터 사용
      const detailData = {
        ...customer,
        businessNumber: '123-45-67890',
        email: `contact@${customer.code.toLowerCase()}.com`,
        fax: customer.phone.replace('1234', '9876'),
        manager: '김관리',
        managerPhone: '010-1234-5678',
        managerEmail: `manager@${customer.code.toLowerCase()}.com`,
        bankName: '국민은행',
        accountNumber: '123-456-789012',
        accountHolder: customer.representative,
        createDate: '2023-01-15',
        updateDate: '2023-06-20'
      };
      
      setCustomerDetail([detailData]);
    }
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
    if (!selectedCustomer) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 거래처를 선택해주세요.',
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
        const updatedList = customerList.filter(c => c.id !== selectedCustomer.id);
        setCustomerList(updatedList);
        setSelectedCustomer(null);
        setCustomerDetail(null);
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
    const newCustomer = {
      id: `NEW_${Date.now()}`,
      name: '',
      code: '',
      business: '',
      representative: '',
      phone: '',
      address: '',
      useYn: 'Y',
      businessNumber: '',
      email: '',
      fax: '',
      manager: '',
      managerPhone: '',
      managerEmail: '',
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0]
    };
    
    setCustomerList([...customerList, newCustomer]);
    setSelectedCustomer(newCustomer);
    setCustomerDetail([newCustomer]);
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

  // 거래처 목록 그리드 컬럼 정의
  const customerColumns = [
    { field: 'code', headerName: '거래처코드', width: 120 },
    { field: 'name', headerName: '거래처명', width: 200, flex: 1 },
    { field: 'business', headerName: '업종', width: 100 },
    { field: 'representative', headerName: '대표자', width: 100 },
    { field: 'phone', headerName: '전화번호', width: 150 },
    { field: 'address', headerName: '주소', width: 250 },
    { 
      field: 'useYn', 
      headerName: '사용여부', 
      width: 100,
      valueFormatter: (params) => params.value === 'Y' ? '사용' : '미사용'
    }
  ];

  // 거래처 상세 정보 그리드 컬럼 정의
  const detailColumns = [
    { field: 'code', headerName: '거래처코드', width: 120, editable: true },
    { field: 'name', headerName: '거래처명', width: 200, editable: true },
    { field: 'business', headerName: '업종', width: 100, editable: true },
    { field: 'businessNumber', headerName: '사업자번호', width: 150, editable: true },
    { field: 'representative', headerName: '대표자', width: 100, editable: true },
    { field: 'phone', headerName: '전화번호', width: 150, editable: true },
    { field: 'fax', headerName: '팩스', width: 150, editable: true },
    { field: 'email', headerName: '이메일', width: 180, editable: true },
    { field: 'address', headerName: '주소', width: 250, editable: true },
    { field: 'manager', headerName: '담당자', width: 100, editable: true },
    { field: 'managerPhone', headerName: '담당자연락처', width: 150, editable: true },
    { field: 'managerEmail', headerName: '담당자이메일', width: 180, editable: true },
    { field: 'bankName', headerName: '은행명', width: 100, editable: true },
    { field: 'accountNumber', headerName: '계좌번호', width: 150, editable: true },
    { field: 'accountHolder', headerName: '예금주', width: 100, editable: true },
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

  // 거래처 목록 그리드 버튼
  const customerGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
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
          거래처관리
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
        <Grid item xs={12} sm={6} md={2.4}>
          <Controller
            name="customerCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="거래처코드"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="거래처코드를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Controller
            name="customerName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="거래처명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="거래처명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Controller
            name="representativeName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="대표자명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="대표자명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Controller
            name="business"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="업종"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="업종을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Controller
            name="useYn"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="useYn-label">사용여부</InputLabel>
                <Select
                  {...field}
                  labelId="useYn-label"
                  label="사용여부"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="Y">사용</MenuItem>
                  <MenuItem value="N">미사용</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
      </SearchCondition>

      {/* 그리드 영역 */}
      {!isLoading && (
        <Grid container spacing={2}>
          {/* 거래처 목록 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title="거래처 목록"
              rows={customerList}
              columns={customerColumns}
              buttons={customerGridButtons}
              height={450}
              onRowClick={handleCustomerSelect}
            />
          </Grid>
          
          {/* 거래처 상세 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title={`거래처 상세 정보 ${selectedCustomer ? '- ' + selectedCustomer.name : ''}`}
              rows={customerDetail || []}
              columns={detailColumns}
              buttons={[]} // 상세정보는 별도의 버튼 없음
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
            • 고객사관리에서는 거래처 및 고객사의 정보를 등록, 수정, 삭제할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 고객사를 선택하면 해당 거래처의 상세 정보를 확인하고 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 고객사 등록 시 기본정보, 연락처, 주소, 담당자, 거래조건 등의 정보를 입력할 수 있습니다.
          </Typography>
        </Stack>
      </Box>

      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="거래처관리 도움말"
      >
        <Typography variant="body2" color={getTextColor()}>
          • 거래처관리에서는 거래처의 기본 정보를 등록하고 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 거래처코드, 거래처명, 대표자, 연락처 등의 정보를 관리하여 거래처 정보를 체계적으로 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 거래처 정보는 주문 관리, 출하 관리, 매출 관리 등에서 활용됩니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default CustomerManagement;