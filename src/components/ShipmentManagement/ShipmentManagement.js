import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Collapse, Button, Stack, IconButton, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { EnhancedDataGridWrapper } from '../Common';
import SearchCondition from '../Common/SearchCondition';
import {
  getShipmentHeaders,
  getShipmentDetails,
  prepareShipmentDetailsForEntry,
  upsertShipmentDetails,
  softDeleteShipment,
  getVendors,
  getShipmentStatus,
  getMaterialByOrderNo,
  getWarehouseByMaterialId
} from '../../api/shipmentApi';
import Message from '../../utils/message/Message';
import { format, parse } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import koLocale from 'date-fns/locale/ko';
import UseSystemStatusManager from "../../hook/UseSystemStatusManager";

const ShipmentManagement = () => {
  const { userGroup } = UseSystemStatusManager();
  
  // 상태 관리
  const [searchParams, setSearchParams] = useState({
    orderNo: null,
    fromDate: null,
    toDate: null,
    customerId: null,
    shipmentStatus: null
  });

  const [orderNoInput, setOrderNoInput] = useState('');
  const [headerRows, setHeaderRows] = useState([]);
  const [selectedHeader, setSelectedHeader] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailRows, setDetailRows] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [shipmentStatus, setShipmentStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewDetailRow, setIsNewDetailRow] = useState(false);
  const [preparedDetails, setPreparedDetails] = useState([]);
  const [modifiedRows, setModifiedRows] = useState(new Set());
  const [warehouses, setWarehouses] = useState([]);
  const [materials, setMaterials] = useState([]);

  // 초기 데이터 로딩
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [vendorList, status, headers] = await Promise.all([
        getVendors(),
        getShipmentStatus(),
        getShipmentHeaders({})
      ]);
      
      setVendors(vendorList || []);
      setShipmentStatus(status || []);
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
      const cleanedParams = Object.fromEntries(
        Object.entries(newParams).map(([key, value]) => [
          key,
          value === '' ? null : value
        ])
      );

      const finalParams = isButtonClick 
        ? { ...cleanedParams, orderNo: orderNoInput || null }
        : { ...cleanedParams, orderNo: searchParams.orderNo };
      
      setSearchParams(finalParams);
      const headers = await getShipmentHeaders(finalParams);
      setHeaderRows(headers || []);
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
      shipmentStatus: null
    };
    setOrderNoInput('');
    handleSearch(initialParams);
  };

  // 날짜 포맷 변환 함수
  const formatDate = (date) => {
    if (!date) return '';
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
      field: 'customerId', 
      headerName: '고객사', 
      width: 150,
      editable: false,
      renderCell: (params) => {
        const vendor = vendors.find(v => v.vendorId === params.value);
        return vendor?.vendorName || params.value;
      }
    },
    { 
      field: 'orderer', 
      headerName: '주문자', 
      width: 120,
      editable: false,
      valueOptions: userGroup.map(u => ({
        value: u.loginId,
        label: u.userName
      })),
      renderCell: (params) => {
        const user = userGroup.find(u => u.loginId === params.value);
        return user?.userName || params.value;
      }
    },
    {
      field: 'orderQuantity',
      headerName: '주문수량',
      width: 120,
      editable: false,
      type: 'number'
    },
    { 
      field: 'totalAmount', 
      headerName: '총금액', 
      width: 120,
      type: 'number',
      editable: false,
      renderCell: (params) => params.value?.toLocaleString()
    },
    { 
      field: 'shipmentStatus', 
      headerName: '출하상태', 
      width: 120,
      editable: false,
      valueOptions: shipmentStatus.map(u => ({
        value: u.codeId,
        label: u.codeName,
      })),
      renderCell: (params) => {
        const user = shipmentStatus.find(u => u.codeId === params.value);
        return user?.codeName || params.value;
      }
    },
    { 
      field: 'shippedQuantity', 
      headerName: '출하수량', 
      width: 120,
      type: 'number',
      editable: false
    },
    { 
      field: 'unshippedQuantity', 
      headerName: '미출하수량', 
      width: 120,
      type: 'number',
      editable: false
    },
    { 
      field: 'remark', 
      headerName: '비고사항', 
      width: 200,
      editable: false,
      renderCell: (params) => params?.value ? formatDate(params.value) : '-'
    }
  ];

  // 상세 그리드 컬럼 정의
  const detailColumns = [
    {
      field: 'systemMaterialId', 
      headerName: '품목ID(*)', 
      width: 150,
      editable: true,
      required: true,
      type: 'singleSelect',
      valueOptions: materials.map(material => ({
        value: material.systemMaterialId,
        label: material.materialName
      })),
      renderCell: (params) => renderRequiredCell(params, 'systemMaterialId')
    },
    {
      field: 'shipmentWarehouse',
      headerName: '출하창고(*)',
      width: 120,
      editable: true,
      required: true,
      type: 'singleSelect',
      valueOptions: warehouses.map(warehouse => ({
        value: warehouse.warehouseId,
        label: warehouse.warehouseName
      })),
      renderCell: (params) => renderRequiredCell(params, 'shipmentWarehouse')
    },
    { 
      field: 'shipmentDate', 
      headerName: '출하일자(*)', 
      width: 120,
      editable: true,
      required: true,
      renderCell: (params) => renderRequiredCell(params, 'shipmentDate'),
      renderEditCell: (params) => <DatePickerCell {...params} />,
      valueFormatter: (params) => params?.value ? formatDate(params.value) : ''
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
      field: 'quantity', 
      headerName: '주문수량', 
      width: 100,
      type: 'number',
      editable: false
    },
    { 
      field: 'stockQuantity', 
      headerName: '재고수량', 
      width: 100,
      type: 'number',
      editable: false
    },
    { 
      field: 'shippedQuantity', 
      headerName: '출하수량', 
      width: 100,
      type: 'number',
      editable: false
    },
    { 
      field: 'unshippedQuantity', 
      headerName: '미출하수량', 
      width: 100,
      type: 'number',
      editable: false
    },
    { 
      field: 'cumulativeShipmentQuantity', 
      headerName: '금회출하수량(*)', 
      width: 120,
      type: 'number',
      editable: true,
      required: true,
      renderCell: (params) => renderRequiredCell(params, 'cumulativeShipmentQuantity'),
      preProcessEditCellProps: (params) => {
        const hasError = params.props.value > params.row.stockQuantity;
        return { ...params.props, error: hasError };
      }
    },
    { 
      field: 'shipmentHandler', 
      headerName: '출하처리자(*)', 
      width: 120,
      editable: true,
      required: true,
      type: 'singleSelect',
      valueOptions: userGroup.map(u => ({
        value: u.loginId,
        label: u.userName
      })),
      renderCell: (params) => renderRequiredCell(params, 'shipmentHandler')
    },
    { 
      field: 'remark', 
      headerName: '비고사항', 
      width: 200,
      editable: true
    }
  ];

  // 필수 필드 렌더링 함수
  const renderRequiredCell = (params, field) => {
    if (!params.value) {
      switch (field) {
        case 'systemMaterialId':
          return <Box sx={{ color: 'primary.main', fontWeight: 'bold' }}>우선선택</Box>;
        case 'shipmentWarehouse':
          if (params.row.systemMaterialId) {
            return <Box sx={{ color: 'primary.main', fontWeight: 'bold' }}>우선선택</Box>;
          } else {
            return <Box sx={{ color: 'text.secondary', fontWeight: 'bold' }}>품목ID 선택 필요</Box>;
          }
        case 'shipmentDate':
        case 'cumulativeShipmentQuantity':
        case 'shipmentHandler':
      return <Box sx={{ color: 'error.main', fontWeight: 'bold' }}>필수</Box>;
        default:
          return null;
      }
    }
    
    switch (field) {
      case 'systemMaterialId':
        const material = materials.find(m => m.systemMaterialId === params.value);
        return material?.materialName || params.value;
      case 'shipmentWarehouse':
        const warehouse = warehouses.find(w => w.warehouseId === params.value);
        return warehouse?.warehouseName || params.value;
      case 'shipmentHandler':
        const user = userGroup.find(u => u.loginId === params.value);
        return user?.userName || params.value;
      default:
        return params.value;
    }
  };

  // 헤더 row 클릭 핸들러
  const handleHeaderRowClick = async (params) => {
    setSelectedHeader(params.row);
    if (params.row.id) {
      try {
        setLoading(true);
        const [details, materialInfo] = await Promise.all([
          getShipmentDetails(params.row.id),
          getMaterialByOrderNo(params.row.orderNo)
        ]);
        setDetailRows(details || []);
        setMaterials(materialInfo || []);
        
        // 기존 상세 데이터가 있는 경우 해당 품목의 창고 정보 로드
        if (details && details.length > 0) {
          const warehouseInfo = await getWarehouseByMaterialId(details[0].systemMaterialId);
          setWarehouses(warehouseInfo || []);
        }
      } catch (error) {
        Message.showError(error);
      } finally {
        setLoading(false);
      }
    } else {
      setMaterials([]);
      setDetailRows([]);
      setMaterials([]);
      setWarehouses([]);
    }
  };

  // 상세 row 클릭 핸들러
  const handleDetailRowClick = (params) => {
    setSelectedDetail(params.row);
  };

  // 행 수정 처리 - 상세
  const processDetailRowUpdate = async (newRow, oldRow) => {
    try {
      // 기본 업데이트된 row 생성
      let updatedRow = { ...newRow };

      // 품목ID가 변경된 경우
      if (newRow.systemMaterialId !== oldRow.systemMaterialId) {
        const materialInfo = await getMaterialByOrderNo(selectedHeader.orderNo);
        setMaterials(materialInfo || []);
        const selectedMaterial = materialInfo.find(m => m.systemMaterialId === newRow.systemMaterialId);
        
        if (selectedMaterial) {
          try {
            const warehouseInfo = await getWarehouseByMaterialId(newRow.systemMaterialId);
            if (!warehouseInfo || warehouseInfo.length === 0) {
              Message.showWarning('선택한 품목의 재고가 없습니다. 다른 품목을 선택해주세요.');
              return oldRow;
            }
            setWarehouses(warehouseInfo || []);

            if (newRow.shipmentWarehouse) {
              const prepared = await prepareShipmentDetailsForEntry(selectedHeader.orderNo, selectedMaterial.orderSubNo, newRow.shipmentWarehouse);
              if (prepared) {
                const selectedDetail = prepared.find(d => d.systemMaterialId === newRow.systemMaterialId);
                if (selectedDetail) {
                  updatedRow = {
                    ...updatedRow,
                    ...selectedDetail,
                    id: newRow.id
                  };
                }
              }
            }
          } catch (error) {
            Message.showError('창고 정보 조회 중 오류가 발생했습니다.');
            return oldRow;
          }
        }
      }

      // 출하창고가 변경된 경우
      if (newRow.shipmentWarehouse !== oldRow.shipmentWarehouse && newRow.systemMaterialId) {
        const selectedMaterial = materials.find(m => m.systemMaterialId === newRow.systemMaterialId);

        if (selectedMaterial) {
          try {
            const warehouseInfo = await getWarehouseByMaterialId(newRow.systemMaterialId);
            if (!warehouseInfo || warehouseInfo.length === 0) {
              Message.showWarning('선택한 품목의 재고가 없습니다. 다른 품목을 선택해주세요.');
              return oldRow;
            }
            setWarehouses(warehouseInfo || []);

            const prepared = await prepareShipmentDetailsForEntry(selectedHeader.orderNo, selectedMaterial.orderSubNo, newRow.shipmentWarehouse);
            if (prepared) {
              updatedRow = {
                ...updatedRow,
                ...prepared,
                id: newRow.id,
                shipmentWarehouse: newRow.shipmentWarehouse
              };
            }
          } catch (error) {
            Message.showError('창고 정보 조회 중 오류가 발생했습니다.');
            return oldRow;
          }
        }
      }

      // 금회출하수량 검증
      if (newRow.cumulativeShipmentQuantity) {
        if (newRow.cumulativeShipmentQuantity > newRow.stockQuantity) {
          Message.showWarning('금회출하수량은 재고수량을 초과할 수 없습니다.');
          return oldRow;
        }

        if (newRow.cumulativeShipmentQuantity > newRow.unshippedQuantity) {
          Message.showWarning('금회출하수량은 미출하수량을 초과할 수 없습니다.');
          return oldRow;
        }
      }

      // 수정된 row 추적
      setModifiedRows(prev => new Set([...prev, updatedRow.id]));
      
      // detailRows 상태 업데이트
      setDetailRows(prevRows => 
        prevRows.map(row => 
          row.id === updatedRow.id ? updatedRow : row
        )
      );

      return updatedRow;
    } catch (error) {
      Message.showError(error);
      return oldRow;
    }
  };

  // 상세 추가 핸들러
  const handleAddDetail = () => {
    if (!selectedHeader?.orderNo) {
      Message.showWarning('주문을 먼저 선택해주세요.');
      return;
    }

    if (isNewDetailRow) {
      Message.showWarning('이미 추가된 신규 행이 있습니다.');
      return;
    }

    // 음수 ID 생성 (현재 시간의 음수값 사용)
    const newId = -Date.now();
    
    const newRow = {
      id: newId,
      orderNo: selectedHeader.orderNo,
      shipmentDate: null,
      systemMaterialId: null,
      shipmentHandler: null,
      cumulativeShipmentQuantity: null
    };

    setDetailRows([...detailRows, newRow]);
    setIsNewDetailRow(true);
  };

  // 상세 삭제 핸들러
  const handleDeleteDetail = async () => {
    if (!selectedDetail) {
      Message.showWarning('삭제할 출하 상세를 선택해주세요.');
      return;
    }

    // 신규 row인 경우 바로 삭제 (음수 ID 체크)
    if (selectedDetail.id < 0) {
      setDetailRows(prev => prev.filter(row => row.id !== selectedDetail.id));
      setSelectedDetail(null);
      setIsNewDetailRow(false);
      return;
    }

    // 최신 데이터가 아니거나 flagPrint가 true인 경우 삭제 불가
    if (selectedDetail.flagPrint) {
      Message.showWarning('이미 출력된 출하정보는 삭제할 수 없습니다.');
      return;
    }

    Message.showDeleteConfirm(async () => {
      try {
        setLoading(true);
        await softDeleteShipment(selectedDetail.id);
        Message.showSuccess('출하 상세 삭제 성공', async () => {
          // 헤더 데이터 재조회
          const headers = await getShipmentHeaders(searchParams);
          setHeaderRows(headers || []);
          
          // 현재 선택된 헤더 정보 업데이트
          const updatedHeader = headers?.find(h => h.id === selectedHeader.id);
          setSelectedHeader(updatedHeader || null);
          
          // 상세 데이터 재조회
          if (updatedHeader) {
            const details = await getShipmentDetails(updatedHeader.id);
            setDetailRows(details || []);
          } else {
            setDetailRows([]);
            setPreparedDetails([]);
          }
          setSelectedDetail(null);
        });
      } catch (error) {
        Message.showError(error);
      } finally {
        setLoading(false);
      }
    });
  };

  // 상세 저장 핸들러
  const handleSaveDetail = async () => {
    try {
      setLoading(true);
      // 수정된 row와 신규 row만 필터링
      const rowsToSave = detailRows.filter(row => 
        row.id < 0 || modifiedRows.has(row.id)
      );

      if (rowsToSave.length === 0) {
        Message.showWarning('저장할 데이터가 없습니다.');
        return;
      }

      // 필수 필드 체크
      const invalidRows = rowsToSave.filter(row => {
        return !row.shipmentDate || !row.systemMaterialId || 
               !row.cumulativeShipmentQuantity || !row.shipmentHandler;
      });

      if (invalidRows.length > 0) {
        Message.showWarning('필수 입력 항목을 모두 입력해주세요.');
        return;
      }

      // 금회출하수량 체크
      const invalidQuantityRows = rowsToSave.filter(row => {
        const isOverStock = row.cumulativeShipmentQuantity > row.stockQuantity;
        return isOverStock;
      });

      if (invalidQuantityRows.length > 0) {
        Message.showWarning('금회출하수량은 재고수량을 초과할 수 없습니다.');
        return;
      }

      // 저장할 데이터 준비
      const dataToSave = rowsToSave.map(row => ({
        ...row,
        shipmentId: selectedHeader.id,
        id: row.id < 0 ? null : row.id
      }));

      await upsertShipmentDetails(dataToSave);
      
      // 저장 성공 후 데이터 리로드
      const [headers, details] = await Promise.all([
        getShipmentHeaders(searchParams),
        getShipmentDetails(selectedHeader.id)
      ]);

      // 헤더 데이터 업데이트
      setHeaderRows(headers || []);
      
      // 현재 선택된 헤더 정보 업데이트
      const updatedHeader = headers?.find(h => h.id === selectedHeader.id);
      setSelectedHeader(updatedHeader || null);
      
      // 상세 데이터 업데이트
      setDetailRows(details || []);
      setIsNewDetailRow(false);
      // 수정된 row 추적 초기화
      setModifiedRows(new Set());
      Message.showSuccess('출하 정보 저장 성공');
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
          title="출하 검색"
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
              <InputLabel>출하상태</InputLabel>
              <Select
                value={searchParams.shipmentStatus || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : e.target.value;
                  handleSearch({ ...searchParams, shipmentStatus: value });
                }}
                label="출하상태"
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="not">미출하</MenuItem>
                <MenuItem value="partial">부분출하</MenuItem>
                <MenuItem value="complete">출하완료</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </SearchCondition>
      </LocalizationProvider>

      {/* 주문정보 영역 */}
      <Paper sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <Box component="h3" sx={{ m: 0 }}>주문정보</Box>
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

      {/* 출하등록 영역 */}
      <Collapse in={Boolean(selectedHeader)}>
        <Paper sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
              <Box component="h3" sx={{ m: 0 }}>출하등록</Box>
              <Stack direction="row" spacing={1}>
                <Button 
                  startIcon={<AddIcon />} 
                  onClick={handleAddDetail}
                  disabled={isNewDetailRow}
                >
                  등록
                </Button>
                <Button 
                  startIcon={<SaveIcon />} 
                  onClick={handleSaveDetail}
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
                getRowId: (row) => row.id,
                processRowUpdate: processDetailRowUpdate,
                isCellEditable: (params) => {
                  const editableFields = ['shipmentDate', 'systemMaterialId', 'cumulativeShipmentQuantity', 'shipmentWarehouse', 'shipmentHandler', 'remark'];
                  return editableFields.includes(params.field) && (params.row.id < 0 || !params.row.flagPrint);
                },
                disableSelectionOnClick: false,
                autoHeight: false,
                selectionModel: selectedDetail ? [selectedDetail.id] : []
              }}
            />
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default ShipmentManagement; 