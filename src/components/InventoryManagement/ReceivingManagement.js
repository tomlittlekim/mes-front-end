import React, { useState, useEffect, useCallback } from 'react';
import { GRAPHQL_URL } from '../../config';
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
  Stack
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { MuiDataGridWrapper, SearchCondition , EnhancedDataGridWrapper} from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const ReceivingManagement = (props) => {
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
      supplier: '',
      fromDate: null,
      toDate: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [receivingList, setReceivingList] = useState([]); 
  const [selectedReceiving, setSelectedReceiving] = useState(null);
  const [receivingDetail, setReceivingDetail] = useState([]);  // 빈 배열로 초기화
  const [editRowsModel, setEditRowsModel] = useState({});      // 편집 상태 관리를 위한 상태 추가
  
  // 추가 코드 
  const [refreshKey, setRefreshKey] = useState(0); // 강제 리렌더링용 키
  const [addRows,setAddRows] = useState([]);
  const [updatedDetailRows, setUpdatedDetailRows] = useState([]); // 수정된 필드만 저장하는 객체


  // 초기화 함수
  const handleReset = () => {
    reset({
      productId: '',
      productName: '',
      productType: '',
      supplier: '',
      fromDate: null,
      toDate: null
    });
  };

  // GraphQL 쿼리 정의
  const INVENTORY_QUERIES = {
    GET_INVENTORY_LIST: `
      query getInventoryList($filter: InventoryInMFilter) {
        getInventoryList(filter: $filter) {
          seq
          site
          compCd
          factoryId
          warehouseId
          totalPrice
          hasInvoice
          remarks
          flagActive
          createUser
          createDate
          updateUser
          updateDate
          inManagementId
        }
      }
    `,
    GET_DETAILED_INVENTORY_LIST: `
      query getDetailedInventoryList($filter: InventoryInFilter) {
        getDetailedInventoryList(filter: $filter) {
          inManagementId
          inInventoryId
          supplierName
          manufacturerName
          userMaterialId
          materialName
          materialCategory
          materialStandard
          qty
          unitPrice
          unitVat
          totalPrice
          createUser
          createDate
          updateUser
          updateDate
        }
      }
    `
  }

  // // 천 단위 구분 포맷터 함수
  // const priceFormatter = (params) => {
  //   if (params.value == null) return '';
  //   return params.value.toLocaleString('ko-KR');
  // };

  const fetchGraphQL = async (query, variables) => {
    try {
      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 응답 텍스트 먼저 확인
      const responseText = await response.text();

      // 텍스트가 비어있지 않은 경우에만 JSON 파싱
      if (responseText.trim()) {
        const data = JSON.parse(responseText);
        return data.data;
      } else {
        throw new Error('빈 응답이 반환되었습니다.');
      }
    } catch (error) {
      console.error('GraphQL 요청 오류:', error);
      throw error;
    }
  };

  // 검색 실행 함수
  const handleSearch = async (data) => {

    setUpdatedDetailRows([]);
    setAddRows([]);

    try {
      // 필터 객체 생성
      const filter = {
        site: data.site || null, 
        compCd: data.compCd || null, 
        factoryId: data.factoryId || null,
        warehouseId: data.warehouseId || null,
      };

      // GraphQL 요청 보내기
      const result = await fetchGraphQL(
        INVENTORY_QUERIES.GET_INVENTORY_LIST,
        { filter }
      );
      
      // 응답 처리
      if (result && result.getInventoryList) {
        // 받아온 데이터로 상태 업데이트
        setReceivingList(result.getInventoryList.map(item => ({
          id: item.inManagementId,
          inManagementId: item.inManagementId,
          inType: "",
          factoryId: item.factoryId,
          warehouseId: item.warehouseId,
          materialInfo: "",
          totalPrice: item.totalPrice,
          hasInvoice: item.hasInvoice,
          createDate: item.createDate
        })));
        
        // 선택 상태 초기화
        setSelectedReceiving(null);
        setReceivingDetail([]);
      } else {
        console.error('응답 데이터가 예상 형식과 다릅니다:', result);
      }
    } catch (error) {
      console.error('데이터 조회 오류:', error);
    }
  };

  // 입고 선택 핸들러 Row 클릭
  const handleReceivingSelect = async (params) => {
    console.log('선택된 행:', params);
    
    // 수정: columns가 아닌 row를 저장
    setSelectedReceiving(params.row);
    
    try {
      // 필터 객체 생성
      const filter = {
        site: params.row?.site || null, 
        compCd: params.row?.compCd || null, 
        inManagementId: params.row?.inManagementId || null,
      };

      // GraphQL 요청 보내기
      const result = await fetchGraphQL(
        INVENTORY_QUERIES.GET_DETAILED_INVENTORY_LIST,
        { filter }
      );

      if (result && result.getDetailedInventoryList) {
        // 받아온 데이터로 상태 업데이트
        const detailData = result.getDetailedInventoryList.map((item, index) => ({
          id: item.inInventoryId || `detail_${item.inManagementId}_${index}`,
          inManagementId: item.inManagementId,
          inInventoryId: item.inInventoryId,
          supplierName: item.supplierName,
          manufactureName: item.manufacturerName,
          userMaterialId: item.userMaterialId,
          materialName: item.materialName,
          materialCategory: item.materialCategory,
          materialStandard: item.materialStandard,
          qty: item.qty,
          unitPrice: item.unitPrice,
          unitVat: item.unitVat,
          totalPrice: item.totalPrice,
          createUser: item.createUser,
          createDate: new Date(item.createDate),
          updateUser: item.updateUser,
          updateDate: new Date(item.updateDate)
        }));
        
        console.log('상세 데이터 설정:', detailData);
        setReceivingDetail(detailData);
      } else {
        // 데이터가 없으면 빈 배열로 설정
        setReceivingDetail([]);
        console.error('응답 데이터가 예상 형식과 다릅니다:', result);
      }
    } catch (error) {
      console.error('데이터 조회 오류:', error);
      // 오류 발생시 빈 배열로 설정
      setReceivingDetail([]);
    }
  };

  // 편집 모델 변경 핸들러
  const handleEditRowsModelChange = useCallback((model) => {
    console.log('편집 모델 변경:', model);
    setEditRowsModel(model);
  }, []);

  const handleAdd = () => {
    const newDetailedInventory = {
      id: `NEW_${Date.now()}`,
      inManagementId: selectedReceiving.inManagementId,
      inInventoryId: crypto.randomUUID(),
      supplierName: '',
      manufactureName: '',
      userMaterialId: '',
      materialName: '',
      materialCategory: '',
      materialStandard: '',
      qty: 0,
      unitPrice: 0,
      unitVat: 0,
      totalPrice: 0,
      createUser: '시스템',
      createDate: new Date(),
      updateUser: '시스템',
      updateDate: new Date()
  };

  setReceivingDetail([...receivingDetail, newDetailedInventory]);
  
  // addRows에도 추가
  setAddRows([...addRows, newDetailedInventory]);

  }

  const handleSave = () => {

  }

  // 등록 버튼 클릭 핸들러
  const handleDetailAdd = () => {
    if (!selectedReceiving || !selectedReceiving.inManagementId) {
        Swal.fire({
            icon: 'warning',
            title: '알림',
            text: '입고 항목을 먼저 선택해주세요.',
            confirmButtonText: '확인'
        });
        return;
    }
    
    const newInventory = {
        id: '자동입력',
        inManagementId: '',
        inType: '자동입력', //
        factoryId: selectedReceiving.factoryId,
        warehouseId: selectedReceiving.warehouseId,
        materialInfo: '자동입력',
        totalPrice: 0,
        hasInvoice: false,
        createDate: new Date(),
    };
    
  }

  const transformRowForMutation = (row) => ({
    inManagementId: row.inManagementId,
    supplierName: row.supplierName,
    manufactureName: row.manufactureName,
    userMaterialId: row.userMaterialId,
    materialName: row.materialName,
    materialCategory: row.materialCategory,
    materialStandard: row.materialStandard,
    qty: String(row.qty),
    unitPrice: String(row.unitPrice),
    unitVat: String(row.unitVat),
    totalPrice: String(row.totalPrice),
    createUser: row.createUser,
    createDate: row.createDate,
    updateUser: row.updateUser,
    updateDate: row.updateDate,
  });

  const transformRowForUpdate = (row) => ({
    inManagementId: row.inManagementId,
    inInventoryId: row.inInventoryId,
    supplierName: row.supplierName,
    manufactureName: row.manufactureName,
    userMaterialId: row.userMaterialId,
    materialName: row.materialName,
    materialCategory: row.materialCategory,
    materialStandard: row.materialStandard,
    qty: row.qty,
    unitPrice: row.unitPrice,
    unitVat: row.unitVat,
    totalPrice: row.totalPrice,
    createUser: row.createUser,
    createDate: row.createDate,
    updateUser: row.updateUser,
    updateDate: row.updateDate,
  });

  // 저장 버튼 클릭 핸들러
  const handleDetailSave = () => {
    // const createInventoryMutation = `
    //   mutation saveDetailedInventory($createdRows: [DetailedInventoryInput], $updatedRows: [DetailedInventoryUpdate]) {
    //     saveDetailedInventory(createdRows: $createdRows, updatedRows: $updatedRows)
    //   }
    // `;

    const createInventoryMutation = `
      mutation saveDetailedInventory($createdRows: [DetailedInventoryInput]) {
        saveDetailedInventory(createdRows: $createdRows)
      }
    `;

    const createdInventoryInputs = addRows.map(transformRowForMutation);
    console.log('createdInventoryInputs', createdInventoryInputs)
    // const updatedInventoryInputs = updatedRows.map(transformRowForUpdate);

    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: createInventoryMutation,
        variables: {
          createdRows: createdInventoryInputs,
          // updatedRows: updatedInventoryInputs,
        }
      })
    })
        .then((res) => res.json())
        .then((data) => {
          if (data.errors) {
            console.error("GraphQL errors:", data.errors);
          } else {
            // handleSearch(getValues());
            Swal.fire({
              icon: 'success',
              title: '성공',
              text: '저장되었습니다.',
              confirmButtonText: '확인'
            });
          }
        })
        .catch((error) => {
          console.error("Error save factory:", error);
        });
    
    // if (!selectedReceiving) {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: '알림',
    //     text: '저장할 입고정보를 선택해주세요.',
    //     confirmButtonText: '확인'
    //   });
    //   return;
    // }
    
    // Swal.fire({
    //   icon: 'success',
    //   title: '성공',
    //   text: '저장되었습니다.',
    //   confirmButtonText: '확인'
    // });
  }

  // 삭제 버튼 클릭 핸들러
  const handleDetailDelete = useCallback(() => {
    if (!selectedReceiving) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 입고정보를 선택해주세요.',
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
        const updatedList = receivingList.filter(r => r.id !== selectedReceiving.id);
        setReceivingList(updatedList);
        setSelectedReceiving(null);
        setReceivingDetail([]);
        Swal.fire({
          icon: 'success',
          title: '성공',
          text: '삭제되었습니다.',
          confirmButtonText: '확인'
        });
      }
    });
  }, [selectedReceiving, receivingList]);

  function handleProcessRowUpdate(newRow, oldRow) {
    const isNewRow = oldRow.id.startsWith('NEW_');

    setReceivingDetail((prev) => {
      return prev.map((row) =>
          //기존 행이면 덮어씌우기 새로운행이면 새로운행 추가
          row.id === oldRow.id ? { ...row, ...newRow } : row
      );
    });

    if (isNewRow) {
      // 신규 행인 경우 addRows 상태에 추가 (같은 id가 있으면 덮어씀)
      setAddRows((prevAddRows) => {
        const existingIndex = prevAddRows.findIndex(
            (row) => row.id === newRow.id
        );
        if (existingIndex !== -1) {
          const updated = [...prevAddRows];
          updated[existingIndex] = newRow;
          return updated;
        } else {
          return [...prevAddRows, newRow];
        }
      });
    }else {
      setUpdatedDetailRows(prevUpdatedRows => {
        // 같은 inInventoryId를 가진 기존 행이 있는지 확인
        const existingIndex = prevUpdatedRows.findIndex(row => row.inInventoryId === newRow.inInventoryId);

        if (existingIndex !== -1) {

          // 기존에 같은 inInventoryId가 있다면, 해당 객체를 새 값(newRow)으로 대체
          const updated = [...prevUpdatedRows];
          updated[existingIndex] = newRow;
          return updated;
        } else {

          // 없다면 새로 추가
          return [...prevUpdatedRows, newRow];
        }
      });
    }

    // processRowUpdate에서는 최종적으로 반영할 newRow(또는 updatedRow)를 반환해야 함
    return { ...oldRow, ...newRow };
  }

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch({});
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // 입고 목록 그리드 컬럼 정의
  const receivingColumns = [
    { field: 'inManagementId', headerName: '입고ID', width: 70 }, 
    { field: 'inType', headerName: '입고형태', width: 70 },
    { field: 'factoryId', headerName: '공장번호', width: 70 },
    { field: 'warehouseId', headerName: '창고번호', width: 180, flex: 1 },
    { field: 'materialInfo', headerName: '자재정보', width: 70 },
    { field: 'totalPrice', headerName: '총 금액', width: 70 },
    { field: 'hasInvoice', headerName: '거래명세서', width: 80 },
    { field: 'createDate', headerName: '생성일', width: 100 }
  ];
  
  // 입고 상세 정보 그리드 컬럼 정의
  const detailedReceivingColumns = [
    { field: 'inManagementId', headerName: '입고관리ID', width: 70, editable: false },
    { field: 'inInventoryId', headerName: '입고ID', width: 70, editable: false, hide: true },
    { field: 'supplierName', headerName: '공장명', width: 100, editable: false },
    { field: 'manufactureName', headerName: '제조사명', width: 70, editable: false },
    { field: 'userMaterialId', headerName: '자재ID', width: 70, editable: false },
    { field: 'materialName', headerName: '자재명', width: 70, editable: true },
    { field: 'materialCategory', headerName: '자재유형', width: 70, editable: false },
    { field: 'materialStandard', headerName: '규격', width: 70, editable: false },
    { field: 'qty', headerName: '수량', width: 30, type: 'number', editable: true },
    { field: 'unitPrice', headerName: '단위 금액', width: 70, type: 'number', editable: true },
    { field: 'unitVat', headerName: '부가세', width: 70, type: 'number', editable: true },
    { field: 'totalPrice', headerName: '총금액', width: 70, type: 'number', editable: true },
    { field: 'createUser', headerName: '등록자', width: 120, editable: false },
    { field: 'createDate', headerName: '등록일', width: 120, type: 'date', editable: false },
    { field: 'updateUser', headerName: '수정자', width: 120, editable: false },
    { field: 'updateDate', headerName: '수정일', width: 120, type: 'date', editable: false },
  ];

  // 입고 목록 그리드 버튼
  const receivingGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
  ];

  // 입고 상세 그리드 버튼
  const detailedReceivingGridButtons = [
    { label: '등록', onClick: handleDetailAdd, icon: <AddIcon /> },
    { label: '삭제', onClick: handleDetailDelete, icon: <DeleteIcon /> },
    { label: '저장', onClick: handleDetailSave, icon: <SaveIcon /> },
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
          입고관리
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
            name="supplier"
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
          {/* 입고 기본 정보 그리드 */}
          <Grid item xs={12} md={5}>
          <EnhancedDataGridWrapper
              title="입고 목록"
              key={refreshKey}  // refreshKey가 변경되면 전체 그리드가 재마운트됩니다.
              rows={receivingList}
              columns={receivingColumns}
              buttons={receivingGridButtons}
              height={450}
              onRowClick={handleReceivingSelect}
              tabId={props.tabId + "-factories"}
              gridProps={{
                editMode: 'cell',
                onProcessUpdate: handleProcessRowUpdate,
                columnVisibilityModel: {
                  inInventoryId: false, // 특정 컬럼 숨기기
                },
              }}
              />
            {/* <MuiDataGridWrapper
              title="입고목록"
              rows={receivingList}
              columns={receivingColumns}
              buttons={receivingGridButtons}
              height={500}
              gridProps={{
                pageSize: 10,
                rowsPerPageOptions: [5, 10, 20],
                pagination: true,
                autoHeight: false,
                disableSelectionOnClick: false,
                hideFooterSelectedRowCount: false
              }}
              onRowClick={handleReceivingSelect}
            /> */}
          </Grid>
          
          {/* 입고 상세 정보 그리드 */}
          <Grid item xs={12} md={7}>
          <EnhancedDataGridWrapper
              title="상세 정보"
              key={refreshKey + 1}  // 강제 리렌더링 위해 key 변경
              rows={receivingDetail}
              columns={detailedReceivingColumns.filter(col => col.field !== 'inInventoryId')}
              buttons={detailedReceivingGridButtons}
              height={450}
              // onRowClick={handleReceivingSelect}
              tabId={props.tabId + "-factories"}
              gridProps={{
                editMode: 'cell',
                onProcessUpdate: handleProcessRowUpdate
              }}
              />
            {/* <MuiDataGridWrapper
              title={`입고상세정보 ${selectedReceiving ? '- ' + selectedReceiving.id : ''}`}
              rows={receivingDetail}
              columns={columns}
              buttons={detailGridButtons}
              height={500}
              gridProps={{
                editMode: 'cell',
                getRowId: (row) => row.id,
                pageSize: 10,
                rowsPerPageOptions: [5, 10, 20],
                pagination: true,
                autoHeight: false,
                editRowsModel: editRowsModel,
                onEditRowsModelChange: handleEditRowsModelChange,
                disableSelectionOnClick: true
              }}
            /> */}
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
            • 입고관리 화면에서는 원자재, 부자재 등의 입고 정보를 효율적으로 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 구매발주 정보를 바탕으로 입고 처리하며, 품질검사 결과에 따라 입고 상태가 변경됩니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 입고 처리 후 자동으로 재고가 증가하며, 추적성을 위해 로트 정보도 함께 관리됩니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default ReceivingManagement; 