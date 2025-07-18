import React, { useState, useEffect, useCallback } from 'react';
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
  IconButton,
  alpha
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { SearchCondition, EnhancedDataGridWrapper } from '../Common';
import DateRangePicker from '../Common/DateRangePicker';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import HelpModal from '../Common/HelpModal';
import Message from '../../utils/message/Message';
import ko from "date-fns/locale/ko";
import { toKSTISOString } from './InventoryUtils';
import { 
  getInventoryOutManagementList,
  getInventoryOutList,
  saveInventoryOutManagement,
  deleteInventoryOutManagement,
  saveInventoryOut,
  deleteInventoryOut,
  getGridCodes,
  getGridFactory,
  getGridWarehouse,
  getMaterialCode
} from '../../api/standardInfo/inventoryApi';



const OutboundManagement = (props) => {
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
      outManagementId: '',
      outType: '',
      factoryName: '',
      warehouseName: '',
      createUser: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    }
  });

  // 초기화 함수
  const handleReset = () => {
    reset({
      outManagementId: '',
      outType: '',
      factoryName: '',
      warehouseName: '',
      createUser: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    });
  };
  

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDetail, setIsSavingDetail] = useState(false);

  const [outboundList, setOutboundList] = useState([]);
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedDetailOutbound, setSelectedDetailOutbound] = useState(null);
  const [outboundDetail, setOutboundDetail] = useState([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  // 추가 코드
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatedRows, setUpdatedRows] = useState([]);
  const [addRows, setAddRows] = useState([]);
  const [updatedDetailRows, setUpdatedDetailRows] = useState([]);
  const [addDetailRows, setAddDetailRows] = useState([]);

  // 옵션 상태
  const [factoryTypeOptions, setFactoryTypeOptions] = useState([]);
  const [warehouseTypeOptions, setWarehouseTypeOptions] = useState([]);
  const [outTypeOptions, setOutTypeOptions] = useState([]);
  const [materialTypeOptions, setMaterialTypeOptions] = useState([]);

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = (startDate, endDate) => {
    setValue('dateRange', { startDate, endDate });
  };

  // 검색 실행 함수
  const handleSearch = useCallback(async (data) => {
    console.log('현재 옵션:', { outTypeOptions, factoryTypeOptions, warehouseTypeOptions });
    setUpdatedDetailRows([]);
    setAddRows([]);
    setAddDetailRows([]);

    console.log('검색 데이터:', data);

    try {
      const filter = {
        outManagementId: data.outManagementId || null,
        outType: data.outType || null,
        factoryName: data.factoryName || null,
        warehouseName: data.warehouseName || null,
        createUser: data.createUser || null,
        startDate: data.dateRange?.startDate ? toKSTISOString(new Date(data.dateRange.startDate)) : null,
        endDate: data.dateRange?.endDate ? toKSTISOString(new Date(data.dateRange.endDate)) : null
      };

      console.log('GraphQL 필터:', filter);

      const result = await getInventoryOutManagementList(filter);
      
      if (result) {
        console.log('파싱된 결과:', result);
        
        setOutboundList(result.map(item => ({
          id: item.outManagementId,
          outManagementId: item.outManagementId,
          outType: item.outType,
          factoryId: item.factoryId,
          warehouseId: item.warehouseId,
          materialInfo: item.materialInfo,
          totalPrice: item.totalPrice,
          userName: item.userName,
          createDate: item.createDate
        })));
        
        setSelectedOutbound(null);
        setOutboundDetail([]);
      } else {
        console.error('응답 데이터가 예상 형식과 다릅니다:', result);
        setOutboundList([]);
        setSelectedOutbound(null);
        setOutboundDetail([]);
        
        Swal.fire({
          icon: 'info',
          title: '알림',
          text: '데이터를 가져오지 못했습니다. 백엔드 연결을 확인해주세요.'
        });
      }
    } catch (error) {
      console.error('데이터 조회 오류:', error);
      setOutboundList([]);
      setSelectedOutbound(null);
      setOutboundDetail([]);
      
      Swal.fire({
        icon: 'error',
        title: '데이터 조회 실패',
        text: `오류: ${error.message || '알 수 없는 오류가 발생했습니다.'}`
      });
    }
  }, [factoryTypeOptions, warehouseTypeOptions, outTypeOptions]);

  // 출고 선택 핸들러 Row 클릭
  const handleOutboundSelect = async (params) => {
    console.log('선택된 행:', params);
    setSelectedOutbound(params.row);
    setUpdatedDetailRows([]);
    setAddDetailRows([]);
    
    try {
      const filter = {
        outManagementId: params.row?.outManagementId || null,
      };

      const result = await getInventoryOutList(filter);

      if (result) {
        const detailData = result.map((item, index) => {
          // totalPrice가 null인 경우 자동 계산
          const qty = parseFloat(item.qty) || 0;
          const unitPrice = parseFloat(item.unitPrice) || 0;
          const unitVat = parseFloat(item.unitVat) || 0;
          const calculatedTotalPrice = qty * (unitPrice + unitVat);
          
          return {
            id: item.outInventoryId || `detail_${item.outManagementId}_${index}`,
            outManagementId: item.outManagementId,
            outInventoryId: item.outInventoryId,
            supplierName: item.supplierName,
            manufactureName: item.manufacturerName,
            systemMaterialId: item.systemMaterialId,
            materialName: item.materialName,
            materialCategory: item.materialCategory,
            materialStandard: item.materialStandard,
            qty: item.qty,
            unitPrice: item.unitPrice,
            unitVat: item.unitVat,
            totalPrice: item.totalPrice || calculatedTotalPrice,
            createUser: item.createUser,
            createDate: new Date(item.createDate),
            updateUser: item.updateUser,
            updateDate: new Date(item.updateDate)
          };
        });
        
        console.log('상세 데이터 설정:', detailData);
        setOutboundDetail(detailData);
      } else {
        setOutboundDetail([]);
        console.error('상세 응답 데이터가 예상 형식과 다릅니다:', result);
      }
    } catch (error) {
      console.error('상세 데이터 조회 오류:', error);
      setOutboundDetail([]);
    }
  };

  // 상세 출고 선택 핸들러
  const handleDetailOutboundSelect = (params) => {
    setSelectedDetailOutbound(params.row);
    console.log('상세 데이터 선택:', params.row);
  };

  // 상세 등록 버튼 클릭 핸들러
  const handleDetailAdd = () => {
    if (!selectedOutbound) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '출고 목록을 먼저 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    const newDetailedInventory = {
      id: `NEW_${Date.now()}`,
      outManagementId: selectedOutbound.outManagementId,
      outInventoryId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      supplierName: '자동입력',
      manufactureName: '자동입력',
      systemMaterialId: null,
      materialName: '자동입력',
      materialCategory: '자동입력',
      materialStandard: '자동입력',
      qty: 0,
      unitPrice: 0,
      unitVat: 0,
      totalPrice: 0,
      createUser: '시스템',
      createDate: new Date(),
      updateUser: '시스템',
      updateDate: new Date()
    };

    setOutboundDetail(prev => [...prev, newDetailedInventory]);
    setAddDetailRows(prev => [...prev, newDetailedInventory]);
  }

  // 마스터 등록 버튼 클릭 핸들러
  const handleAdd = () => {
    const newInventory = {
      id: `NEW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      outManagementId: '자동',
      outType: null,
      factoryId: null,
      warehouseId: null,
      materialInfo: '자동',
      totalPrice: 0, 
      userName: '자동',
      createDate: new Date().toISOString().split('T')[0]
    };

    setOutboundList(prev => [newInventory, ...prev]);
    setAddRows(prev => [newInventory, ...prev]);
  }

  // 필드 유효성 검사 함수
  const validateRequiredFields = (rows, fieldMapping) => {
    for (const row of rows) {
      for (const [fieldKey, fieldLabel] of Object.entries(fieldMapping)) {
        if (row[fieldKey] === undefined || row[fieldKey] === null || row[fieldKey] === '') {
          Message.showError({ message: `${fieldLabel} 필드는 필수 입력값입니다.` });
          return false;
        }
      }
    }
    return true;
  };

  // 마스터 저장
  const handleSave = () => {
    // 이미 저장 중인 경우 중복 호출 방지
    if (isSaving) {
      console.log('이미 저장 중입니다. 중복 호출을 방지합니다.');
      return;
    }

    const newRows = addRows;
    
    console.log('저장할 새 출고 목록:', newRows);

    if (newRows.length === 0) {
      Swal.fire({ icon: 'info', title: '알림', text: '저장할 변경사항이 없습니다.' });
      return;
    }

    const requiredFields = {
      factoryId: '공장',
      warehouseId: '창고',
      outType: '출고 유형',
    };

    if (!validateRequiredFields(newRows, requiredFields)) {
      return;
    }

    setIsSaving(true); // 저장 시작

    const createdRowsInput = newRows.map(row => ({
      outType: row.outType,
      factoryId: row.factoryId,
      warehouseId: row.warehouseId,
    }));

    saveInventoryOutManagement({ createdRows: createdRowsInput })
      .then(data => {
        if (data.errors) {
          console.error("GraphQL errors:", data.errors);
          Swal.fire({ icon: 'error', title: '저장 실패', text: data.errors[0]?.message || '저장 중 오류 발생' });
        } else {
          Swal.fire({ icon: 'success', title: '성공', text: '저장되었습니다.' });
          setAddRows([]);
          setUpdatedRows([]);
          handleSearch(getValues());
        }
      })
      .catch(error => {
        console.error("Error saving inventory:", error);
        Swal.fire({ icon: 'error', title: '오류', text: '저장 중 예외 발생: ' + error.message });
      })
      .finally(() => {
        setIsSaving(false); // 저장 완료
      });
  }

  // 마스터 삭제
  const handleDelete = () => {
    if (!selectedOutbound) {
      Swal.fire({ icon: 'warning', title: '알림', text: '삭제할 출고목록을 선택해주세요.' });
      return;
    }

    const variables = {
      outManagementId: { outManagementId: selectedOutbound.outManagementId }
    };

    Swal.fire({
      title: '삭제 확인', text: '정말 삭제하시겠습니까?', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33',
      confirmButtonText: '삭제', cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteInventoryOutManagement(variables)
        .then((data) => {
          if (data.errors) {
            console.error("GraphQL errors:", data.errors);
            Swal.fire({ icon: 'error', title: '삭제 실패', text: '삭제 중 오류 발생' });
          } else {
            Swal.fire({ icon: 'success', title: '성공', text: '삭제되었습니다.' });
          }
        })
        .catch((error) => {
          console.error("Error deleting:", error);
          Swal.fire({ icon: 'error', title: '삭제 실패', text: '삭제 중 예외 발생' });
        })
        .finally(() => {
          setOutboundList(prev => prev.filter(item => item.id !== selectedOutbound.id));
          setSelectedOutbound(null);
          setOutboundDetail([]);
          setRefreshKey(prev => prev + 1);
        });
      }
    });
  };

  // 상세 저장
  const handleDetailSave = () => {
    // 이미 저장 중인 경우 중복 호출 방지
    if (isSavingDetail) {
      console.log('이미 상세 저장 중입니다. 중복 호출을 방지합니다.');
      return;
    }

    const newRows = addDetailRows;
    const updatedRowsToSave = updatedDetailRows;
    
    console.log('저장할 새 상세 데이터:', newRows);
    console.log('업데이트할 상세 데이터:', updatedRowsToSave);

    if (newRows.length === 0 && updatedRowsToSave.length === 0) {
      Swal.fire({ icon: 'info', title: '알림', text: '저장할 변경사항이 없습니다.' });
      return;
    }

    const requiredDetailFields = {
      systemMaterialId: '자재',
      qty: '수량'
    };

    if (!validateRequiredFields(newRows, requiredDetailFields)) return;
    if (!validateRequiredFields(updatedRowsToSave, requiredDetailFields)) return;

    setIsSavingDetail(true); // 상세 저장 시작

    const createdInventoryInputs = newRows.map(row => ({
      outManagementId: row.outManagementId,
      systemMaterialId: row.systemMaterialId,
      qty: String(parseFloat(row.qty) || 0),
      unitPrice: String(row.unitPrice || 0),
      unitVat: String(row.unitVat || 0),
      totalPrice: String(row.totalPrice || 0),
    }));

    const updatedInventoryInputs = updatedRowsToSave.map(row => ({
      outInventoryId: row.outInventoryId,
      outManagementId: row.outManagementId,
      systemMaterialId: row.systemMaterialId,
      qty: String(parseFloat(row.qty) || 0),
      unitPrice: String(row.unitPrice || 0),
      unitVat: String(row.unitVat || 0),
      totalPrice: String(row.totalPrice || 0),
    }));

    console.log('백엔드로 전송할 상세 데이터:', { createdInventoryInputs, updatedInventoryInputs });

    saveInventoryOut({
      createdRows: createdInventoryInputs.length > 0 ? createdInventoryInputs : [],
      updatedRows: updatedInventoryInputs.length > 0 ? updatedInventoryInputs : []
    })
    .then(data => {
      if (data.errors) {
        console.error("GraphQL errors:", data.errors);
        Swal.fire({ icon: 'error', title: '저장 실패', text: data.errors[0]?.message || '저장 중 오류 발생' });
      } else {
        Swal.fire({ icon: 'success', title: '성공', text: '상세 정보가 저장되었습니다.' });
        setAddDetailRows([]);
        setUpdatedDetailRows([]);
        if (selectedOutbound) {
          handleOutboundSelect({ row: selectedOutbound });
        }
      }
    })
    .catch(error => {
      console.error("Error saving inventory detail:", error);
      Swal.fire({ icon: 'error', title: '오류', text: '상세 저장 중 예외 발생: ' + error.message });
    })
    .finally(() => {
      setIsSavingDetail(false); // 상세 저장 완료
    });
  };

  // 상세 삭제
  const handleDetailDelete = () => {
    if (!selectedDetailOutbound) {
      Swal.fire({ icon: 'warning', title: '알림', text: '삭제할 상세 항목을 선택해주세요.' });
      return;
    }

    const variables = {
      outInventoryId: { outInventoryId: selectedDetailOutbound.outInventoryId }
    };

    Swal.fire({
      title: '상세 삭제 확인', text: '정말 삭제하시겠습니까?', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33',
      confirmButtonText: '삭제', cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteInventoryOut(variables)
        .then((data) => {
          if (data.errors) {
            console.error("GraphQL errors:", data.errors);
            Swal.fire({ icon: 'error', title: '삭제 실패', text: '삭제 중 오류 발생' });
          } else {
            Swal.fire({ icon: 'success', title: '성공', text: '삭제되었습니다.' });
          }
        })
        .catch((error) => {
          console.error("Error deleting detail:", error);
          Swal.fire({ icon: 'error', title: '삭제 실패', text: '삭제 중 예외 발생' });
        })
        .finally(() => {
          setOutboundDetail(prev => prev.filter(item => item.id !== selectedDetailOutbound.id));
          setSelectedDetailOutbound(null);
          setRefreshKey(prev => prev + 1);
        });
      }
    });
  };

  // 마스터 그리드 행 업데이트 처리
  function handleProcessRowUpdate(newRow, oldRow) {
    const isNewRow = oldRow.id.startsWith('NEW_');

    setOutboundList(prev => prev.map(row => row.id === oldRow.id ? { ...row, ...newRow } : row));

    if (isNewRow) {
      setAddRows(prev => prev.map(row => row.id === newRow.id ? newRow : row));
    } else {
      setUpdatedRows(prev => {
        const existingIndex = prev.findIndex(row => row.outManagementId === newRow.outManagementId);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = newRow;
          return updated;
        } else {
          return [...prev, newRow];
        }
      });
    }
    return { ...oldRow, ...newRow };
  }

  // 상세 그리드 행 업데이트 처리
  function handleDetailProcessRowUpdate(newRow, oldRow) {
    const isNewRow = oldRow.id.startsWith('NEW_');

    // 총 금액 자동 계산
    const qty = parseFloat(newRow.qty) || 0;
    const unitPrice = parseFloat(newRow.unitPrice) || 0;
    const unitVat = parseFloat(newRow.unitVat) || 0;
    const totalPrice = qty * (unitPrice + unitVat);
    
    const updatedRow = { ...newRow, totalPrice };

    setOutboundDetail(prev => prev.map(row => row.id === oldRow.id ? { ...row, ...updatedRow } : row));

    if (isNewRow) {
      setAddDetailRows(prev => prev.map(row => row.id === updatedRow.id ? updatedRow : row));
    } else {
      setUpdatedDetailRows(prev => {
        const existingIndex = prev.findIndex(row => row.outInventoryId === updatedRow.outInventoryId);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = updatedRow;
          return updated;
        } else {
          return [...prev, updatedRow];
        }
      });
    }
    return { ...oldRow, ...updatedRow };
  }

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    const loadCodeData = async () => {
      setIsLoading(true);
      try {
        const [codes, factories, warehouses, materials] = await Promise.all([
          getGridCodes("CD20250410151400958"),
          getGridFactory(),
          getGridWarehouse(),
          getMaterialCode()
        ]);

        setOutTypeOptions(codes.map(c => ({ value: c.codeId, label: c.codeName })));
        setFactoryTypeOptions(factories.map(f => ({ value: f.factoryId, label: f.factoryName })));
        setWarehouseTypeOptions(warehouses.map(w => ({ value: w.warehouseId, label: w.warehouseName })));
        setMaterialTypeOptions(materials.map(m => ({ value: m.systemMaterialId, label: m.materialName })));
        
        handleSearch(getValues()); 

      } catch (error) {
        console.error("코드 데이터 로드 오류:", error);
        Swal.fire({ icon: 'error', title: '코드 로딩 실패', text: '필수 코드 정보를 가져오지 못했습니다.' });
      } finally {
        setIsLoading(false);
      }
    };

    loadCodeData();
  }, []);

  // 마스터 그리드 컬럼 정의 (outboundColumns)
  const outboundColumns = [
    { field: 'outManagementId', headerName: '출고ID', width: 70, headerAlign: 'center', align: 'center', editable: false }, 
    { field: 'outType', headerName: '출고 유형', width: 70, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        const isNewRow = params.row.id?.toString().startsWith('NEW_');
        const showRequired = isNewRow && (!params.value || params.value === '');
        const option = outTypeOptions.find(opt => opt.value === params.value);
        const displayValue = option ? option.label : params.value;
        return (
          <Typography variant="body2" sx={{ color: showRequired ? '#f44336' : 'inherit' }}>
            {showRequired ? '필수 선택' : displayValue || ''}
          </Typography>
        );
      },
      editable: true, type: 'singleSelect', valueOptions: outTypeOptions
    },
    { field: 'warehouseId', headerName: '창고', width: 180, headerAlign: 'center', align: 'center', flex: 1,
      renderCell: (params) => {
        const isNewRow = params.row.id?.toString().startsWith('NEW_');
        const showRequired = isNewRow && (!params.value || params.value === '');
        const option = warehouseTypeOptions.find(opt => opt.value === params.value);
        const displayValue = option ? option.label : params.value;
        return (
          <Typography variant="body2" sx={{ color: showRequired ? '#f44336' : 'inherit' }}>
            {showRequired ? '필수 선택' : displayValue || ''}
          </Typography>
        );
      },
      editable: true, type: 'singleSelect', valueOptions: warehouseTypeOptions
    },
    { field: 'factoryId', headerName: '공장', width: 70, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        const isNewRow = params.row.id?.toString().startsWith('NEW_');
        const showRequired = isNewRow && (!params.value || params.value === '');
        const option = factoryTypeOptions.find(opt => opt.value === params.value);
        const displayValue = option ? option.label : params.value;
        return (
          <Typography variant="body2" sx={{ color: showRequired ? '#f44336' : 'inherit' }}>
            {showRequired ? '필수 선택' : displayValue || ''}
          </Typography>
        );
      },
      editable: true, type: 'singleSelect', valueOptions: factoryTypeOptions
    },
    { field: 'materialInfo', headerName: '자재정보', width: 120, headerAlign: 'center', align: 'center', editable: false },
    { field: 'totalPrice', headerName: '총 금액', width: 70, headerAlign: 'center', align: 'center', editable: false }, // 서버 계산 시 editable: false
    { field: 'userName', headerName: '생성자', width: 100, headerAlign: 'center', align: 'center', editable: false },
    { field: 'createDate', headerName: '생성일', width: 100, headerAlign: 'center', align: 'center', editable: false,
      // valueGetter: (params) => {
      //   return params.value ? new Date(params.value) : null;
      // }
    }
  ];
  
  // 출고 상세 정보 그리드 컬럼 정의
  const detailedOutboundColumns = [
    { field: 'outManagementId', headerName: '출고ID', width: 70, headerAlign: 'center', align: 'center', editable: false },
    { field: 'outInventoryId', headerName: '상세ID', width: 70, editable: false, hide: true }, // 숨김 처리
    { field: 'supplierName', headerName: '공급업체', width: 100, headerAlign: 'center', align: 'center', editable: false },
    { field: 'manufactureName', headerName: '제조사명', width: 100, headerAlign: 'center', align: 'center', editable: false },
    { field: 'systemMaterialId', headerName: '자재', width: 120, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        const isNewRow = params.row.id?.toString().startsWith('NEW_');
        const showRequired = isNewRow && (!params.value || params.value === '');
        const option = materialTypeOptions.find(opt => opt.value === params.value);
        const displayValue = option ? option.label : params.value;
        return (
          <Typography variant="body2" sx={{ color: showRequired ? '#f44336' : 'inherit' }}>
            {showRequired ? '필수 선택' : displayValue || ''}
          </Typography>
        );
      },
      editable: true, type: 'singleSelect', valueOptions: materialTypeOptions
    },
    { field: 'materialCategory', headerName: '자재유형', width: 70, headerAlign: 'center', align: 'center', editable: false },
    { field: 'materialStandard', headerName: '규격', width: 70, headerAlign: 'center', align: 'center', editable: false },
    { field: 'qty', headerName: '수량', width: 30, headerAlign: 'center', align: 'center', type: 'number', editable: true,
      renderCell: (params) => {
        const value = params.value;
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
            <Typography variant="body2">
              {parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
            </Typography>
          </Box>
        );
      }
    },
    { field: 'unitPrice', headerName: '단위 금액', width: 70, headerAlign: 'center', align: 'center', type: 'number', editable: true },
    { field: 'unitVat', headerName: '부가세', width: 70, headerAlign: 'center', align: 'center', type: 'number', editable: true },
    { field: 'totalPrice', headerName: '총금액', width: 70, headerAlign: 'center', align: 'center', type: 'number', editable: false,
      renderCell: (params) => {
        const value = params.value;
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              height: '100%',
              width: '100%',
              pr: 1
            }}
          >
            <Typography variant="body2">
              {parseFloat(value || 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
            </Typography>
          </Box>
        );
      }
    },
    { field: 'createUser', headerName: '등록자', width: 120, headerAlign: 'center', align: 'center', editable: false },
    { field: 'createDate', headerName: '등록일', width: 120, headerAlign: 'center', align: 'center', type: 'dateTime', editable: false },
    { field: 'updateUser', headerName: '수정자', width: 120, headerAlign: 'center', align: 'center', editable: false },
    { field: 'updateDate', headerName: '수정일', width: 120, headerAlign: 'center', align: 'center', type: 'dateTime', editable: false },
  ];

  // 출고 목록 그리드 버튼
  const outboundGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon />, disabled: isSaving },
    { label: isSaving ? '저장 중...' : '저장', onClick: handleSave, icon: <SaveIcon />, disabled: isSaving },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon />, disabled: isSaving },
  ];

  // 출고 상세 그리드 버튼
  const detailedOutboundGridButtons = [
    { label: '등록', onClick: handleDetailAdd, icon: <AddIcon />, disabled: isSavingDetail },
    { label: isSavingDetail ? '저장 중...' : '저장', onClick: handleDetailSave, icon: <SaveIcon />, disabled: isSavingDetail },
    { label: '삭제', onClick: handleDetailDelete, icon: <DeleteIcon />, disabled: isSavingDetail },
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
          출고관리
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

      <SearchCondition 
        onSearch={handleSubmit(handleSearch)}
        onReset={handleReset}
      >
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="outManagementId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="출고관리ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="출고관리ID를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="outType"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="outType-label">출고 유형</InputLabel>
                <Select {...field} labelId="outType-label" label="출고 유형">
                  <MenuItem value="">전체</MenuItem>
                  {outTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="factoryName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="공장이름"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="공장이름을 입력하세요"
              />
            )}
          />
        </Grid>
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
            name="createUser"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="출고자"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="출고자를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
            <Controller
              name="dateRange"
              control={control}
              render={({ field }) => (
                <DateRangePicker startDate={field.value.startDate} endDate={field.value.endDate} onRangeChange={handleDateRangeChange} startLabel="시작일" endLabel="종료일" label="출고일" size="small" />
              )}
            />
          </LocalizationProvider>
        </Grid>
      </SearchCondition>
      
      {!isLoading && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <EnhancedDataGridWrapper
              title="출고 목록"
              key={refreshKey}
              rows={outboundList}
              columns={outboundColumns}
              buttons={outboundGridButtons}
              height={660}
              onRowClick={handleOutboundSelect}
              tabId={props.tabId + "-outbound"}
              gridProps={{
                editMode: 'cell',
                processRowUpdate: handleProcessRowUpdate,
                onProcessRowUpdateError: (error) => console.error("Row update error:", error),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={7}>
            <EnhancedDataGridWrapper
              title="상세 정보"
              key={refreshKey + 1}
              rows={outboundDetail}
              columns={detailedOutboundColumns}
              buttons={detailedOutboundGridButtons}
              height={660}
              onRowClick={handleDetailOutboundSelect}
              tabId={props.tabId + "-outbound-detail"}
              gridProps={{
                editMode: 'cell',
                processRowUpdate: handleDetailProcessRowUpdate,
                onProcessRowUpdateError: (error) => console.error("Detail row update error:", error),
                columnVisibilityModel: { outInventoryId: false }
              }}
            />
          </Grid>
        </Grid>
      )}

      <HelpModal open={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} title="출고관리 도움말">
        <Typography variant="body2" color={getTextColor()}>• 출고관리에서는 자재나 제품의 출고 정보를 등록하고 관리합니다.</Typography>
        <Typography variant="body2" color={getTextColor()}>• 출고번호, 거래처, 제품 정보, 수량 등을 관리합니다.</Typography>
        <Typography variant="body2" color={getTextColor()}>• 출고 정보는 재고 관리, 생산 계획 등에 활용됩니다.</Typography>
      </HelpModal>
    </Box>
  );
};

export default OutboundManagement; 