import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Collapse, Button, Stack, IconButton, TextField, FormControl, InputLabel, Select, MenuItem, Checkbox } from '@mui/material';
import { EnhancedDataGridWrapper } from '../Common';
import SearchCondition from '../Common/SearchCondition';
import {
  getTransactionStatementHeaders,
  getTransactionStatementDetails,
  deleteTransactionStatement,
  printTransactionStatement
} from '../../api/transactionStatementApi';
import { getVendors } from '../../api/shipmentApi';
import Message from '../../utils/message/Message';
import { format, parse } from 'date-fns';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import koLocale from 'date-fns/locale/ko';

const TransactionStatement = () => {
  
  // 상태 관리
  const [searchParams, setSearchParams] = useState({
    id: null,
    fromDate: null,
    toDate: null,
    orderNo: null,
    customerId: null
  });

  // 거래명세서 ID 입력값을 별도로 관리
  const [transactionStatementIdInput, setTransactionStatementIdInput] = useState('');
  const [orderNoInput, setOrderNoInput] = useState('');

  const [headerRows, setHeaderRows] = useState([]);
  const [selectedHeader, setSelectedHeader] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [detailRows, setDetailRows] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  // 초기 데이터 로딩
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [vendorList, headers] = await Promise.all([
        getVendors(),
        getTransactionStatementHeaders({})
      ]);
      
      setVendors(vendorList || []);
      setHeaderRows(headers || []);
    } catch (error) {
      Message.showError(error);
    } finally {
      setLoading(false);
    }
  };

  // 검색 조건 변경 시 헤더 데이터 조회
  const handleSearch = async (newParams, isButtonClick = false) => {
    try {
      setLoading(true);
      // 빈 문자열을 null로 변환
      const cleanedParams = Object.fromEntries(
        Object.entries(newParams).map(([key, value]) => [
          key,
          value === '' ? null : value
        ])
      );

      // 버튼 클릭이 아닌 경우, 주문번호는 이전 값 유지
      const finalParams = isButtonClick 
        ? { ...cleanedParams, orderNo: orderNoInput || null, id: transactionStatementIdInput || null }
        : { ...cleanedParams, orderNo: searchParams.orderNo, id: searchParams.id };
      
      setSearchParams(finalParams);
      const headers = await getTransactionStatementHeaders(finalParams);
      setHeaderRows(headers || []);
      // 검색 시 선택된 헤더 초기화
      setSelectedHeader(null);
      setSelectedDetails([]);
      setDetailRows([]);
    } catch (error) {
      Message.showError(error);
    } finally {
      setLoading(false);
    }
  };

  // 초기화 핸들러
  const handleReset = () => {
    const initialParams = {
      id: null,
      fromDate: null,
      toDate: null,
      orderNo: null,
      customerId: null
    };
    setTransactionStatementIdInput('');
    setOrderNoInput('');
    handleSearch(initialParams);
  };

  // 헤더 선택 시 상세 데이터 조회
  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedHeader?.orderNo) {
        setDetailRows([]);
        return;
      }
      
      try {
        setLoading(true);
        const details = await getTransactionStatementDetails(selectedHeader.orderNo);
        setDetailRows(details || []);
      } catch (error) {
        Message.showError(error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDetails();
  }, [selectedHeader]);

  // 날짜 포맷 변환 함수
  const formatDate = (date) => {
    if (!date) return '';  // null/undefined 처리
    return format(new Date(date), 'yyyy-MM-dd');
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    return parse(dateStr, 'yyyy-MM-dd', new Date());
  };

  // 날짜 선택 컴포넌트
  const DatePickerCell = ({ value, field, id, api }) => {
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
        <DatePicker
          value={parseDate(value)}
          onChange={(newValue) => {
            api.setEditCellValue({ id, field, value: formatDate(newValue) });
          }}
          slotProps={{
            textField: {
              size: "small",
              fullWidth: true,
              variant: "outlined"
            }
          }}
          format="yyyy-MM-dd"
        />
      </LocalizationProvider>
    );
  };

  // 헤더 그리드 컬럼 정의
  const headerColumns = [
    { 
      field: 'orderNo', 
      headerName: '주문번호', 
      width: 150,
      editable: false
    },
    { 
      field: 'orderDate', 
      headerName: '주문일자', 
      width: 120,
      editable: false,
      renderCell: (params) => params?.value ? formatDate(params.value) : '-'
    },
    { 
      field: 'customerName', 
      headerName: '고객사', 
      width: 150,
      editable: false
    },
    { 
      field: 'orderQuantity', 
      headerName: '주문수량', 
      width: 120,
      type: 'number',
      editable: false,
      renderCell: (params) => params.value?.toLocaleString()
    },
    { 
      field: 'totalAmount', 
      headerName: '주문금액', 
      width: 120,
      type: 'number',
      editable: false,
      renderCell: (params) => params.value?.toLocaleString()
    },
    { 
      field: 'supplyPrice', 
      headerName: '거래명세공급가액', 
      width: 150,
      type: 'number',
      editable: false,
      renderCell: (params) => params.value?.toLocaleString()
    },
    { 
      field: 'vat', 
      headerName: '거래명세VAT', 
      width: 120,
      type: 'number',
      editable: false,
      renderCell: (params) => params.value?.toLocaleString()
    },
    { 
      field: 'flagIssuance', 
      headerName: '발행여부', 
      width: 100,
      type: 'boolean',
      editable: false,
      renderCell: (params) => params.value ? '출력' : '출력 시 자동표기'
    },
    { 
      field: 'issuanceDate', 
      headerName: '발행일자', 
      width: 120,
      editable: false,
      renderCell: (params) => params?.value ? formatDate(params.value) : '출력일자 자동표기'
    }
  ];

  // 상세 그리드 컬럼 정의
  const detailColumns = [
    { 
      field: 'transactionStatementId', 
      headerName: '명세서ID', 
      width: 150,
      editable: false
    },
    { 
      field: 'transactionStatementDate', 
      headerName: '명세서일자', 
      width: 150,
      editable: false,
      renderCell: (params) => params?.value ? formatDate(params.value) : 'LocalDate 날짜 선택'
    },
    { 
      field: 'systemMaterialId', 
      headerName: '품목ID', 
      width: 120,
      editable: false
    },
    { 
      field: 'materialName', 
      headerName: '품목명', 
      width: 200,
      editable: false
    },
    { 
      field: 'materialStandard', 
      headerName: '규격', 
      width: 120,
      editable: false
    },
    { 
      field: 'unit', 
      headerName: '단위', 
      width: 80,
      editable: false
    },
    { 
      field: 'shippedQuantity', 
      headerName: '수량', 
      width: 100,
      type: 'number',
      editable: false,
      renderCell: (params) => params.value?.toLocaleString()
    },
    { 
      field: 'unitPrice', 
      headerName: '단가', 
      width: 120,
      type: 'number',
      editable: false,
      renderCell: (params) => params.value?.toLocaleString()
    },
    { 
      field: 'supplyPrice', 
      headerName: '공급가액', 
      width: 120,
      type: 'number',
      editable: false,
      renderCell: (params) => params.value?.toLocaleString()
    },
    { 
      field: 'vat', 
      headerName: 'VAT', 
      width: 120,
      type: 'number',
      editable: false,
      renderCell: (params) => params.value?.toLocaleString()
    }
  ];

  // 헤더 row 클릭 핸들러
  const handleHeaderRowClick = (params) => {
    setSelectedHeader(params.row);
    setSelectedDetails([]);
  };

  // 상세 row 선택 핸들러 수정
  const handleDetailSelectionChange = (newSelection) => {
    const selectedRows = detailRows.filter(row => newSelection.includes(row.id));
    setSelectedDetails(selectedRows);
  };

  // 상세 row 클릭 핸들러
  const handleDetailRowClick = (params) => {
    setSelectedDetails(prev => {
      const isSelected = prev.some(detail => detail.id === params.row.id);
      if (isSelected) {
        return prev.filter(detail => detail.id !== params.row.id);
      } else {
        return [...prev, params.row];
      }
    });
  };

  // 거래명세서 삭제 핸들러
  const handleDelete = async () => {
    if (!selectedHeader) {
      Message.showWarning('삭제할 거래명세서를 선택해주세요.');
      return;
    }

    if (selectedHeader.flagIssuance) {
      Message.showWarning('이미 발행된 거래명세서는 삭제할 수 없습니다.');
      return;
    }

    Message.showDeleteConfirm(async () => {
      try {
        setLoading(true);
        await deleteTransactionStatement(selectedHeader.orderNo);
        Message.showSuccess('거래명세서 삭제 성공', async () => {
          const headers = await getTransactionStatementHeaders(searchParams);
          setHeaderRows(headers || []);
          setSelectedHeader(null);
          setDetailRows([]);
        });
      } catch (error) {
        Message.showError(error);
      } finally {
        setLoading(false);
      }
    });
  };

  // 거래명세서 출력 핸들러
  const handlePrint = async () => {
    if (!selectedHeader) {
      Message.showWarning('출력할 거래명세서를 선택해주세요.');
      return;
    }

    if (selectedDetails.length === 0) {
      Message.showWarning('출력할 상세 내역을 하나 이상 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      const blob = await printTransactionStatement({
        headerId: selectedHeader.id,
        transactionDate: formatDate(new Date()),
        customerName: selectedHeader.customerName,
        detailIds: selectedDetails.map(detail => detail.id)
      });

      // Blob을 URL로 변환하여 새 창에서 PDF 열기
      const url = window.URL.createObjectURL(blob);
      window.open(url);
      window.URL.revokeObjectURL(url);

      // 출력 후 데이터 갱신
      const [headers, details] = await Promise.all([
        getTransactionStatementHeaders(searchParams),
        getTransactionStatementDetails(selectedHeader.orderNo)
      ]);
      
      setHeaderRows(headers || []);
      const updatedHeader = headers?.find(h => h.id === selectedHeader.id);
      setSelectedHeader(updatedHeader || null);
      setDetailRows(details || []);
      setSelectedDetails([]);
      
    } catch (error) {
      Message.showError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 검색 조건 영역 */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
        <SearchCondition
          title="조회조건"
          onSearch={() => handleSearch(searchParams, true)}
          onReset={handleReset}
        >
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="거래명세서 ID"
              name="id"
              value={transactionStatementIdInput}
              onChange={(e) => setTransactionStatementIdInput(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="거래명세서일 From"
              value={parseDate(searchParams.fromDate)}
              onChange={(newValue) => handleSearch({ ...searchParams, fromDate: formatDate(newValue) })}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="거래명세서일 To"
              value={parseDate(searchParams.toDate)}
              onChange={(newValue) => handleSearch({ ...searchParams, toDate: formatDate(newValue) })}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="주문번호"
              name="orderNo"
              value={orderNoInput}
              onChange={(e) => setOrderNoInput(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>고객사</InputLabel>
              <Select
                value={searchParams.customerId || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : e.target.value;
                  handleSearch({ ...searchParams, customerId: value });
                }}
                label="고객사"
              >
                <MenuItem value="">전체</MenuItem>
                {vendors.map(vendor => (
                  <MenuItem key={vendor.vendorId} value={vendor.vendorId}>
                    {vendor.vendorName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </SearchCondition>
      </LocalizationProvider>

      {/* 거래명세서 헤더 영역 */}
      <Paper sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <Box component="h3" sx={{ m: 0 }}>거래명세서정보 (상단Grid- Header)</Box>
            <Stack direction="row" spacing={1}>
              <Button
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                disabled={!selectedHeader || selectedHeader.flagIssuance}
                color="error"
              >
                삭제
              </Button>
              <Button
                startIcon={<SaveIcon />}
                onClick={handlePrint}
                disabled={!selectedHeader || selectedDetails.length === 0}
              >
                출력
              </Button>
            </Stack>
          </Stack>
        </Box>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <EnhancedDataGridWrapper
            rows={headerRows}
            columns={headerColumns}
            onRowClick={handleHeaderRowClick}
            loading={loading}
            hideToolbar
            gridProps={{
              getRowId: (row) => row.id,
              disableSelectionOnClick: true,
              autoHeight: false
            }}
          />
        </Box>
      </Paper>

      {/* 거래명세서 상세 영역 */}
      <Collapse in={Boolean(selectedHeader)}>
        <Paper sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
              <Box component="h3" sx={{ m: 0 }}>거래명세 상세정보 (하단Grid- Detail)</Box>
            </Stack>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <EnhancedDataGridWrapper
              rows={detailRows}
              columns={detailColumns}
              onRowClick={handleDetailRowClick}
              loading={loading}
              hideToolbar
              gridProps={{
                getRowId: (row) => row.id,
                checkboxSelection: true,
                onSelectionModelChange: handleDetailSelectionChange,
                selectionModel: selectedDetails.map(detail => detail.id),
                disableSelectionOnClick: false,
                autoHeight: false
              }}
            />
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default TransactionStatement; 