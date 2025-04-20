import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Collapse, Button, Stack, IconButton, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { EnhancedDataGridWrapper } from '../Common';
import SearchCondition from '../Common/SearchCondition';
import {
  getOrderHeaders, getOrderDetails, getVendors, getProducts, getPaymentMethods,
  upsertOrderHeaders, upsertOrderDetails, deleteOrderHeader, deleteOrderDetail,
  getNewOrderHeader, getNewOrderDetail
} from '../../api/orderApi';
import Message from '../../utils/message/Message';
import { format, parse } from 'date-fns';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import koLocale from 'date-fns/locale/ko';
import UseSystemStatusManager from "../../hook/UseSystemStatusManager";

const OrderRegistration = () => {
  const { userGroup } = UseSystemStatusManager()
  // 상태 관리
  const [searchParams, setSearchParams] = useState({
    orderNo: null,
    fromDate: null,
    toDate: null,
    customerId: null,
    materialId: null
  });

  // 주문번호 입력값을 별도로 관리
  const [orderNoInput, setOrderNoInput] = useState('');

  const [headerRows, setHeaderRows] = useState([]);
  const [selectedHeader, setSelectedHeader] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailRows, setDetailRows] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headerNo, setHeaderNo] = useState(1);
  const [detailNo, setDetailNo] = useState(1);
  const [editedHeaderRows, setEditedHeaderRows] = useState(new Set());
  const [editedDetailRows, setEditedDetailRows] = useState(new Set());
  const [isEditMode, setIsEditMode] = useState(false);

  // 초기 데이터 로딩
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [vendorList, productList, paymentList, headers] = await Promise.all([
        getVendors(),
        getProducts(),
        getPaymentMethods(),
        getOrderHeaders({})
      ]);
      
      setVendors(vendorList || []);
      setProducts(productList || []);
      setPaymentMethods(paymentList || []);
      setHeaderRows(headers || []);
    } catch (error) {
      Message.showError(error);
    } finally {
      setLoading(false);
    }
  };

  // 검색 조건 변경 시 헤더 데이터 조회 (주문번호 제외)
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
        ? { ...cleanedParams, orderNo: orderNoInput || null }
        : { ...cleanedParams, orderNo: searchParams.orderNo };
      
      setSearchParams(finalParams);
      const headers = await getOrderHeaders(finalParams);
      setHeaderRows(headers || []);
      // 검색 시 선택된 헤더 초기화
      setSelectedHeader(null);
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
      orderNo: null,
      fromDate: null,
      toDate: null,
      customerId: null,
      materialId: null
    };
    setOrderNoInput('');
    handleSearch(initialParams);
  };

  // 헤더 선택 시 상세 데이터 조회 및 상세번호 초기화
  useEffect(() => {
    const loadDetails = async () => {
      setDetailNo(1); // 헤더 변경 시 상세번호 초기화
      if (!selectedHeader?.id) {
        setDetailRows([]);
        return;
      }
      
      try {
        setLoading(true);
        const details = await getOrderDetails(selectedHeader.orderNo);
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

  // 행 수정 처리 - 헤더
  const processHeaderRowUpdate = (newRow, oldRow) => {
    const updatedRow = { ...newRow };
    setHeaderRows(prev => prev.map(row => 
      row.orderNo === oldRow.orderNo ? updatedRow : row
    ));
    // 수정된 행 추적
    if (updatedRow.id) {
      setEditedHeaderRows(prev => new Set(prev).add(updatedRow.orderNo));
    }
    return updatedRow;
  };

  // 행 수정 처리 - 상세
  const processDetailRowUpdate = (newRow, oldRow) => {
    const updatedRow = { ...newRow };
    setDetailRows(prev => prev.map(row => 
      row.orderSubNo === oldRow.orderSubNo ? updatedRow : row
    ));
    // 수정된 행 추적
    if (updatedRow.id !== null) {
      setEditedDetailRows(prev => new Set(prev).add(updatedRow.orderSubNo));
    }
    return updatedRow;
  };

  // 저장할 행 필터링 - 헤더
  const getHeaderRowsToSave = () => {
    return headerRows.filter(row => {
      // 신규 행(id가 null)인 경우 필수 필드 체크
      if (row.id === null) {
        return row.orderDate && row.customerId; // 필수 필드가 있는 경우만 포함
      }
      // 수정된 행만 포함
      return editedHeaderRows.has(row.orderNo);
    });
  };

  // 저장할 행 필터링 - 상세
  const getDetailRowsToSave = () => {
    return detailRows.filter(row => {
      // 신규 행(id가 null)인 경우 필수 필드 체크
      if (row.id === null) {
        return row.systemMaterialId && row.quantity && row.unitPrice; // 필수 필드가 있는 경우만 포함
      }
      // 수정된 행만 포함
      return editedDetailRows.has(row.orderSubNo);
    });
  };

  // 편집 버튼 렌더링 컴포넌트 - 헤더용
  const EditButton = ({ params }) => {
    const isEditing = isEditMode && params.row.id;

    const handleClick = (event) => {
      // 이벤트 전파 중지
      event.stopPropagation();
      setIsEditMode(prev => !prev);
      // 편집 모드 시작 시 해당 row 선택
      if (!isEditing) {
        setSelectedHeader(params.row);
        if (params.row.id) {
          loadDetails(params.row.orderNo);
        }
      }
    };

    return (
      <IconButton 
        size="small" 
        onClick={handleClick}
        color={isEditing ? "primary" : "default"}
      >
        <EditIcon />
      </IconButton>
    );
  };

  // 헤더 그리드 컬럼 정의
  const headerColumns = [
    { 
      field: 'orderNo', 
      headerName: '주문번호', 
      width: 150,
      editable: false,
      renderCell: (params) => params.value || '자동생성'
    },
    { 
      field: 'orderDate', 
      headerName: '주문일자', 
      width: 120,
      editable: true,
      required: true,
      renderCell: (params) => renderRequiredCell(params, 'orderDate'),
      renderEditCell: (params) => <DatePickerCell {...params} />,
      valueFormatter: (params) => params?.value ? formatDate(params.value) : ''
    },
    { 
      field: 'customerId', 
      headerName: '고객사', 
      width: 150,
      editable: true,
      required: true,
      type: 'singleSelect',
      valueOptions: vendors.map(v => ({
        value: v.vendorId,
        label: v.vendorName
      })),
      renderCell: (params) => renderRequiredCell(params, 'customerId')
    },
    { 
      field: 'orderer', 
      headerName: '주문자', 
      width: 120,
      editable: true,
      type: 'singleSelect',
      valueOptions: userGroup.map(u => ({
        value: u.loginId,
        label: u.userName
      })),
      renderCell: (params) => renderCell(params, 'orderer')
    },
    { 
      field: 'flagVatAmount', 
      headerName: '부가세여부', 
      width: 100,
      editable: true,
      type: 'boolean',
      renderCell: (params) => params.value ? '예' : '아니오'
    },
    {
      field: 'orderQuantity',
      headerName: '주문수량',
      width: 120,
      editable: false,
      type: 'number',
      renderCell: (params) => params.value || '자동계산'
    },
    { 
      field: 'totalAmount', 
      headerName: '총금액', 
      width: 120,
      type: 'number',
      editable: false,
      renderCell: (params) => params.value?.toLocaleString() || '자동계산'
    },
    { 
      field: 'vatAmount', 
      headerName: '부가세', 
      width: 120,
      type: 'number',
      editable: false,
      renderCell: (params) => params.value?.toLocaleString() || '자동계산'
    },
    { 
      field: 'finalAmount', 
      headerName: '최종금액', 
      width: 120,
      type: 'number',
      editable: false,
      renderCell: (params) => params.value?.toLocaleString() || '자동계산'
    },
    { 
      field: 'deliveryDate', 
      headerName: '납기일', 
      width: 120,
      editable: true,
      renderCell: (params) => renderCell(params, 'deliveryDate'),
      renderEditCell: (params) => <DatePickerCell {...params} />,
      valueFormatter: (params) => params?.value ? formatDate(params.value) : ''
    },
    { 
      field: 'paymentMethod', 
      headerName: '결제방식', 
      width: 120,
      editable: true,
      type: 'singleSelect',
      valueOptions: paymentMethods.map(m => ({
        value: m.codeId,
        label: m.codeName
      })),
      renderCell: (params) => renderCell(params, 'paymentMethod')
    },
    { 
      field: 'deliveryAddr', 
      headerName: '배송주소', 
      width: 200,
      editable: true,
      renderCell: (params) => renderCell(params, 'deliveryAddr')
    },
    { 
      field: 'remark', 
      headerName: '비고사항', 
      width: 200,
      editable: true,
      renderCell: (params) => params.value || '-'
    }
  ];

  // 상세 그리드 컬럼 정의 - 편집 컬럼 제거
  const detailColumns = [
    { 
      field: 'orderSubNo', 
      headerName: '상세번호', 
      width: 120,
      editable: false,
      renderCell: (params) => params.value || '자동생성'
    },
    { 
      field: 'systemMaterialId', 
      headerName: '품목ID', 
      width: 150,
      editable: true,
      required: true,
      type: 'singleSelect',
      valueOptions: products.map(p => ({
        value: p.systemMaterialId,
        label: `${p.materialName} (${p.materialStandard})`
      })),
      renderCell: (params) => renderRequiredCell(params, 'systemMaterialId')
    },
    { 
      field: 'materialName', 
      headerName: '품목명', 
      width: 200,
      editable: false,
      renderCell: (params) => params.value || '자동입력'
    },
    { 
      field: 'materialStandard', 
      headerName: '규격', 
      width: 120,
      editable: false,
      renderCell: (params) => params.value || '자동입력'
    },
    { 
      field: 'unit', 
      headerName: '단위', 
      width: 80,
      editable: false,
      renderCell: (params) => params.value || '자동입력'
    },
    { 
      field: 'deliveryDate', 
      headerName: '납기일', 
      width: 120,
      editable: true,
      renderCell: (params) => renderCell(params, 'deliveryDate'),
      renderEditCell: (params) => <DatePickerCell {...params} />,
      valueFormatter: (params) => params?.value ? formatDate(params.value) : ''
    },
    { 
      field: 'quantity', 
      headerName: '수량', 
      width: 100,
      type: 'number',
      editable: true,
      required: true,
      renderCell: (params) => renderRequiredCell(params, 'quantity')
    },
    { 
      field: 'unitPrice', 
      headerName: '단가', 
      width: 120,
      type: 'number',
      editable: true,
      required: true,
      renderCell: (params) => renderRequiredCell(params, 'unitPrice')
    },
    { 
      field: 'supplyPrice', 
      headerName: '공급가', 
      width: 120,
      type: 'number',
      editable: false,
      renderCell: (params) => params.value?.toLocaleString() || '자동계산'
    },
    { 
      field: 'vatPrice', 
      headerName: '부가세', 
      width: 120,
      type: 'number',
      editable: false,
      renderCell: (params) => params.value?.toLocaleString() || '자동계산'
    },
    { 
      field: 'totalPrice', 
      headerName: '합계금액', 
      width: 120,
      type: 'number',
      editable: false,
      renderCell: (params) => params.value?.toLocaleString() || '자동계산'
    },
    { 
      field: 'remark', 
      headerName: '비고사항', 
      width: 200,
      editable: true,
      renderCell: (params) => params.value || '-'
    }
  ];

  // isCellEditable 로직 수정
  const isHeaderCellEditable = (params) => {
    const nonEditableFields = ['orderNo', 'totalAmount', 'vatAmount', 'finalAmount'];
    // 신규 row이거나 편집 모드일 때 수정 가능
    return (!params.row.id || isEditMode) && !nonEditableFields.includes(params.field);
  };

  const isDetailCellEditable = (params) => {
    const nonEditableFields = ['orderSubNo', 'materialName', 'materialStandard', 'unit', 'supplyPrice', 'vatPrice', 'totalPrice'];
    return !nonEditableFields.includes(params.field);
  };

  // 일반 셀 렌더링 함수
  const renderCell = (params, field) => {
    if (field === 'orderer') {
      const user = userGroup.find(u=>u.loginId === params.value);
      return user?.userName || '-';
    }
    if (field === 'customerId') {
      const vendor = vendors.find(v => v.vendorId === params.value);
      return vendor?.vendorName || '-';
    }
    if (field === 'paymentMethod') {
      const method = paymentMethods.find(m => m.codeId === params.value);
      return method?.codeName || '-';
    }
    if (field === 'systemMaterialId') {
      const product = products.find(p => p.systemMaterialId === params.value);
      return product?.materialName || '-';
    }
    return params.value || '-';
  };

  // 필수 필드 렌더링 함수
  const renderRequiredCell = (params, field) => {
    if (!params.value) {
      return <Box sx={{ color: 'error.main', fontWeight: 'bold' }}>필수</Box>;
    }
    if (field === 'customerId') {
      const vendor = vendors.find(v => v.vendorId === params.value);
      return vendor?.vendorName || params.value;
    }
    if (field === 'paymentMethod') {
      const method = paymentMethods.find(m => m.codeId === params.value);
      return method?.codeName || params.value;
    }
    if (field === 'systemMaterialId') {
      const product = products.find(p => p.systemMaterialId === params.value);
      return product?.materialName || params.value;
    }
    return params.value;
  };

  // 헤더 row 클릭 핸들러
  const handleHeaderRowClick = (params) => {
    // 편집 모드일 때는 detail 조회하지 않음
    if (isEditMode) {
      return;
    }
    setSelectedHeader(params.row);
    if (params.row.id) {
      loadDetails(params.row.orderNo);
    } else {
      setDetailRows([]);
    }
  };

  // 헤더 row 더블클릭 핸들러
  const handleHeaderRowDoubleClick = (params) => {
    // 편집 모드이고 저장된 row인 경우에만 처리
    if (isEditMode && params.row.id) {
      setEditedHeaderRows(prev => new Set(prev).add(params.row.orderNo));
    }
  };

  const loadDetails = async (orderNo) => {
    try {
      setLoading(true);
      const details = await getOrderDetails(orderNo);
      setDetailRows(details || []);
    } catch (error) {
      Message.showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHeader = async () => {
    try {
      setLoading(true);
      const newHeader = await getNewOrderHeader(headerNo);
      if (newHeader) {
        const newRow = { ...newHeader, id: null };
        setHeaderRows([...headerRows, newRow]);
        setHeaderNo(prev => prev + 1);
      }
    } catch (error) {
      Message.showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDetail = async () => {
    if (!selectedHeader?.orderNo) {
      Message.showWarning('주문을 먼저 선택해주세요');
      return;
    }
    
    try {
      setLoading(true);
      const newDetail = await getNewOrderDetail({
        no: detailNo,
        orderNo: selectedHeader.orderNo
      });
      if (newDetail) {
        const newRow = { ...newDetail, id: null };
        setDetailRows([...detailRows, newRow]);
        setDetailNo(prev => prev + 1);
      }
    } catch (error) {
      Message.showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHeader = async (id) => {
    const targetRow = headerRows.find(row => row.id === id);
    
    // 신규 row인 경우 바로 삭제
    if (!targetRow?.id) {
      setHeaderRows(prev => prev.filter(row => row.orderNo !== targetRow.orderNo));
      setSelectedHeader(null);
      setDetailRows([]);
      return;
    }

    Message.showDeleteConfirm(async () => {
      try {
        setLoading(true);
        await deleteOrderHeader(id);
        Message.showSuccess('주문 삭제 성공', () => {
          loadInitialData();
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

  const handleDeleteDetail = async () => {
    if (!selectedDetail) {
      Message.showWarning('삭제할 주문 상세를 선택해주세요.');
      return;
    }

    // 신규 row인 경우 바로 삭제
    if (!selectedDetail.id) {
      setDetailRows(prev => prev.filter(row => row.orderSubNo !== selectedDetail.orderSubNo));
      setSelectedDetail(null);
      return;
    }

    Message.showDeleteConfirm(async () => {
      try {
        setLoading(true);
        await deleteOrderDetail(selectedDetail.id);
        Message.showSuccess('주문 상세 삭제 성공', async () => {
          if (selectedHeader?.orderNo) {
            const details = await getOrderDetails(selectedHeader.orderNo);
            setDetailRows(details || []);
            setSelectedDetail(null);
          }
        });
      } catch (error) {
        Message.showError(error);
      } finally {
        setLoading(false);
      }
    });
  };

  // 상세 row 클릭 핸들러
  const handleDetailRowClick = (params) => {
    setSelectedDetail(params.row);
  };

  // 저장 후 편집 모드 해제
  const handleSaveHeader = async () => {
    try {
      setLoading(true);
      const rowsToSave = getHeaderRowsToSave();
      if (rowsToSave.length === 0) {
        Message.showWarning('저장할 데이터가 없습니다.');
        return;
      }

      // 백엔드에 필요한 필드만 추려냄
      const payload = rowsToSave.map(row => ({
        id: row.id,
        site: row.site,
        compCd: row.compCd,
        orderNo: row.orderNo,
        orderDate: row.orderDate,
        customerId: row.customerId,
        orderer: row.orderer,
        flagVatAmount: row.flagVatAmount,
        deliveryDate: row.deliveryDate,
        paymentMethod: row.paymentMethod,
        deliveryAddr: row.deliveryAddr,
        remark: row.remark
      }));

      await upsertOrderHeaders(payload);  // ✅ 올바른 요청 형식
      setIsEditMode(false);
      setEditedHeaderRows(new Set());
      Message.showSuccess('주문 정보 저장 성공', loadInitialData);
    } catch (error) {
      Message.showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDetail = async () => {
    try {
      setLoading(true);
      const rowsToSave = getDetailRowsToSave();
      if (rowsToSave.length === 0) {
        Message.showWarning('저장할 데이터가 없습니다.');
        return;
      }

      const payload = rowsToSave.map(row => ({
        id: row.id,
        site: row.site,
        compCd: row.compCd,
        orderNo: row.orderNo,
        orderSubNo: row.orderSubNo,
        systemMaterialId: row.systemMaterialId,
        deliveryDate: row.deliveryDate,
        quantity: row.quantity,
        unitPrice: row.unitPrice,
        discountedAmount: row.discountedAmount,
        remark: row.remark,
        flagVatAmount: selectedHeader.flagVatAmount
      }));

      await upsertOrderDetails(payload);
      setIsEditMode(false);
      setEditedDetailRows(new Set());
      Message.showSuccess('주문 상세 저장 성공', async () => {
        // 헤더 재조회 후 상세 데이터 조회
        const headers = await getOrderHeaders(searchParams);
        setHeaderRows(headers || []);
        if (selectedHeader?.orderNo) {
          loadDetails(selectedHeader.orderNo);
        }
      });
    } catch (error) {
      Message.showError(error);
    } finally {
      setLoading(false);
    }
  };

  // 편집 모드 토글 핸들러
  const handleToggleEditMode = () => {
    setIsEditMode(prev => !prev);
    // 편집 모드 해제 시 수정 row 초기화
    if (isEditMode) {
      setEditedHeaderRows(new Set());
    }
  };

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 검색 조건 영역 */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
        <SearchCondition
          title="주문 검색"
          onSearch={() => handleSearch(searchParams, true)}
          onReset={handleReset}
        >
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
            <DatePicker
              label="From"
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
              label="To"
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
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>제품</InputLabel>
              <Select
                value={searchParams.materialId || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : e.target.value;
                  handleSearch({ ...searchParams, materialId: value });
                }}
                label="제품"
              >
                <MenuItem value="">전체</MenuItem>
                {products.map(product => (
                  <MenuItem key={product.systemMaterialId} value={product.systemMaterialId}>
                    {`${product.materialName} (${product.materialStandard})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </SearchCondition>
      </LocalizationProvider>

      {/* 기본 주문정보 영역 */}
      <Paper sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <Box component="h3" sx={{ m: 0 }}>기본 주문정보</Box>
            <Stack direction="row" spacing={1}>
              {headerRows.some(row => row.id) ? (
                <Button 
                  startIcon={<EditIcon />} 
                  onClick={handleToggleEditMode}
                  color={isEditMode ? "primary" : "default"}
                >
                  {isEditMode ? '편집 중' : '편집'}
                </Button>
              ) : null}
              <Button startIcon={<AddIcon />} onClick={handleAddHeader}>
                등록
              </Button>
              <Button 
                startIcon={<SaveIcon />} 
                onClick={handleSaveHeader}
                disabled={!isEditMode && !headerRows.some(row => !row.id)}
              >
                저장
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => selectedHeader && handleDeleteHeader(selectedHeader.id)}
                color='error'
                disabled={!selectedHeader}
              >
                삭제
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
              editMode: 'cell',
              getRowId: (row) => row.orderNo,
              processRowUpdate: processHeaderRowUpdate,
              isCellEditable: isHeaderCellEditable,
              disableSelectionOnClick: true,
              autoHeight: false
            }}
          />
        </Box>
      </Paper>

      {/* 주문 상세정보 영역 */}
      <Collapse in={Boolean(selectedHeader)}>
        <Paper sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
              <Box component="h3" sx={{ m: 0 }}>주문 상세정보</Box>
              <Stack direction="row" spacing={1}>
                <Button 
                  startIcon={<AddIcon />} 
                  onClick={handleAddDetail}
                  disabled={!selectedHeader?.id}
                >
                  등록
                </Button>
                <Button 
                  startIcon={<SaveIcon />} 
                  onClick={handleSaveDetail}
                  disabled={!selectedHeader?.id}
                >
                  저장
                </Button>
                <Button
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteDetail}
                  disabled={!selectedDetail}
                  color="error"
                >
                  삭제
                </Button>
              </Stack>
            </Stack>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <EnhancedDataGridWrapper
              rows={detailRows}
              columns={detailColumns}
              loading={loading}
              hideToolbar
              onRowClick={handleDetailRowClick}
              gridProps={{
                editMode: 'cell',
                getRowId: (row) => row.orderSubNo,
                processRowUpdate: processDetailRowUpdate,
                isCellEditable: isDetailCellEditable,
                disableSelectionOnClick: false,
                autoHeight: false,
                selectionModel: selectedDetail ? [selectedDetail.orderSubNo] : []
              }}
            />
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default OrderRegistration; 