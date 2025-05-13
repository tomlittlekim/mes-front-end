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
import { graphFetch } from "../../api/fetchConfig";
import { toKSTISOString } from './InventoryUtils';



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

  // GraphQL 쿼리 정의
  const INVENTORY_OUT_QUERIES = {
    GET_INVENTORY_OUT_MANAGEMENT_LIST: `
      query getInventoryOutManagementList($filter: InventoryOutManagementFilter) {
        getInventoryOutManagementList(filter: $filter) {
          outManagementId
          outType
          factoryId
          warehouseId
          materialInfo
          totalPrice
          userName
          createDate
        }
      }
    `,
    GET_INVENTORY_OUT_LIST: `
      query getInventoryOutList($filter: InventoryOutFilter) {
        getInventoryOutList(filter: $filter) {
          outManagementId
          outInventoryId
          supplierName
          manufacturerName
          systemMaterialId
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

  // fetchGraphQL 함수 (ReceivingManagement와 동일하게 유지 또는 공통 유틸리티로 분리)
  const fetchGraphQL = async (query, variables) => {
    try {
      console.log('GraphQL 요청 보냄:', { query, variables });
      
      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      console.log('GraphQL 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('GraphQL 응답 원본:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));

      if (responseText.trim()) {
        const data = JSON.parse(responseText);
        console.log('GraphQL 응답 파싱됨:', data);
        
        if (data.errors) {
          console.error('GraphQL 에러:', data.errors);
          throw new Error(data.errors[0].message || 'GraphQL 에러 발생');
        }
        
        return data.data;
      } else {
        console.error('GraphQL 응답이 비어있습니다');
        throw new Error('빈 응답이 반환되었습니다.');
      }
    } catch (error) {
      console.error('GraphQL 요청 오류:', error);
      throw error;
    }
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

      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: INVENTORY_OUT_QUERIES.GET_INVENTORY_OUT_MANAGEMENT_LIST,
          variables: { filter }
        })
      });
      
      console.log('응답 상태:', response.status, response.statusText);
      
      const responseText = await response.text();
      console.log('응답 내용:', responseText.substring(0, 200));
      
      if (responseText.trim()) {
        const result = JSON.parse(responseText);
        console.log('파싱된 결과:', result);
        
        if (result.data && result.data.getInventoryOutManagementList) {
          setOutboundList(result.data.getInventoryOutManagementList.map(item => ({
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
            text: '데이터를 가져오지 못했습니다. 백엔드 연결을 확인해주세요.' + 
                  (result.errors ? ` 오류: ${result.errors[0]?.message || '알 수 없는 오류'}` : '')
          });
        }
      } else {
        console.error('빈 응답을 받았습니다');
        setOutboundList([]);
        setSelectedOutbound(null);
        setOutboundDetail([]);
        
        Swal.fire({
          icon: 'error',
          title: '오류 발생',
          text: '서버로부터 빈 응답을 받았습니다.'
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
  }, []);

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

      const result = await fetchGraphQL(
        INVENTORY_OUT_QUERIES.GET_INVENTORY_OUT_LIST,
        { filter }
      );

      if (result && result.getInventoryOutList) {
        const detailData = result.getInventoryOutList.map((item, index) => ({
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
          totalPrice: item.totalPrice,
          createUser: item.createUser,
          createDate: new Date(item.createDate),
          updateUser: item.updateUser,
          updateDate: new Date(item.updateDate)
        }));
        
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
    const newRows = addRows;
    // const updatedRowsToSave = updatedRows;
    
    console.log('저장할 새 출고 목록:', newRows);
    // console.log('수정할 출고 목록:', updatedRowsToSave);

    // if (newRows.length === 0 && updatedRowsToSave.length === 0) {
    //   Swal.fire({ icon: 'info', title: '알림', text: '저장할 변경사항이 없습니다.' });
    //   return;
    // }
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
    // if (!validateRequiredFields(updatedRowsToSave, requiredFields)) {
    //   return;
    // }

    const createdRowsInput = newRows.map(row => ({
      outType: row.outType,
      factoryId: row.factoryId,
      warehouseId: row.warehouseId,
    }));

    // const updatedRowsInput = updatedRowsToSave.map(row => ({
    //   outManagementId: row.outManagementId,
    //   outType: row.outType,
    //   factoryId: row.factoryId,
    //   warehouseId: row.warehouseId,
    // }));

    // console.log('백엔드로 전송할 데이터:', { createdRowsInput, updatedRowsInput });

    fetch(GRAPHQL_URL, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation saveInventoryOutManagement($createdRows: [InventoryOutManagementSaveInput]) {
            saveInventoryOutManagement(createdRows: $createdRows)
          }
        `,
        variables: {
          createdRows: createdRowsInput.length > 0 ? createdRowsInput : null,
          // updatedRows: updatedRowsInput.length > 0 ? updatedRowsInput : null
        }
      })
    })
    .then(res => res.json())
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
    });
  }

  // 마스터 삭제
  const handleDelete = () => {
    if (!selectedOutbound) {
      Swal.fire({ icon: 'warning', title: '알림', text: '삭제할 출고목록을 선택해주세요.' });
      return;
    }

    const deleteInventoryMutation = `
      mutation DeleteInventoryOutManagement($outManagementId: InventoryOutManagementDeleteInput!) {
        deleteInventoryOutManagement(outManagementId: $outManagementId)
      }
    `;

    const variables = {
      outManagementId: { outManagementId: selectedOutbound.outManagementId }
    };

    Swal.fire({
      title: '삭제 확인', text: '정말 삭제하시겠습니까?', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33',
      confirmButtonText: '삭제', cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(GRAPHQL_URL, {
          method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: deleteInventoryMutation, variables })
        })
        .then((res) => res.json())
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

    const createdInventoryInputs = newRows.map(row => ({
      outManagementId: row.outManagementId,
      systemMaterialId: row.systemMaterialId,
      qty: String(parseFloat(row.qty) || 0),
      unitPrice: String(row.unitPrice || 0),
      unitVat: String(row.unitVat || 0),
    }));

    const updatedInventoryInputs = updatedRowsToSave.map(row => ({
      outInventoryId: row.outInventoryId,
      outManagementId: row.outManagementId,
      systemMaterialId: row.systemMaterialId,
      qty: String(parseFloat(row.qty) || 0),
      unitPrice: String(row.unitPrice || 0),
      unitVat: String(row.unitVat || 0),
    }));

    console.log('백엔드로 전송할 상세 데이터:', { createdInventoryInputs, updatedInventoryInputs });

    fetch(GRAPHQL_URL, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation saveInventoryOut($createdRows: [InventoryOutSaveInput], $updatedRows: [InventoryOutUpdateInput]) {
            saveInventoryOut(createdRows: $createdRows, updatedRows: $updatedRows)
          }
        `,
        variables: {
          createdRows: createdInventoryInputs.length > 0 ? createdInventoryInputs : [],
          updatedRows: updatedInventoryInputs.length > 0 ? updatedInventoryInputs : []
        }
      })
    })
    .then(res => res.json())
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
    });
  };

  // 상세 삭제
  const handleDetailDelete = () => {
    if (!selectedDetailOutbound) {
      Swal.fire({ icon: 'warning', title: '알림', text: '삭제할 상세 항목을 선택해주세요.' });
      return;
    }

    const deleteDetailInventoryMutation = `
      mutation DeleteInventoryOut($outInventoryId: InventoryOutDeleteInput!) {
        deleteInventoryOut(outInventoryId: $outInventoryId)
      }
    `;

    const variables = {
      outInventoryId: { outInventoryId: selectedDetailOutbound.outInventoryId }
    };

    Swal.fire({
      title: '상세 삭제 확인', text: '정말 삭제하시겠습니까?', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33',
      confirmButtonText: '삭제', cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(GRAPHQL_URL, {
          method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: deleteDetailInventoryMutation, variables })
        })
        .then((res) => res.json())
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

    setOutboundDetail(prev => prev.map(row => row.id === oldRow.id ? { ...row, ...newRow } : row));

    if (isNewRow) {
      setAddDetailRows(prev => prev.map(row => row.id === newRow.id ? newRow : row));
    } else {
      setUpdatedDetailRows(prev => {
        const existingIndex = prev.findIndex(row => row.outInventoryId === newRow.outInventoryId);
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

  // 코드 데이터 로딩 함수들 (Promise 반환)
  function fetchGridCodesByCodeClassId(codeClassId, setOptions) {
    const query = `query getGridCodes($codeClassId: String!) { getGridCodes(codeClassId: $codeClassId) { codeId codeName } }`;
    return new Promise((resolve, reject) => {
      graphFetch(query, { codeClassId })
        .then((data) => {
          if (data.errors) { console.error(data.errors); reject(data.errors); }
          else { const options = data.getGridCodes.map(row => ({ value: row.codeId, label: row.codeName })); setOptions(options); resolve(options); }
        })
        .catch(err => { console.error(err); reject(err); });
    });
  }

  function fetchGridFactory() {
    const query = `query getGridFactory { getGridFactory { factoryId factoryName factoryCode } }`;
    return new Promise((resolve, reject) => {
      fetch(GRAPHQL_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ query }) })
        .then(response => { if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`); return response.json(); })
        .then(data => {
          if (data.errors) { console.error(data.errors); reject(data.errors); }
          else { const options = data.data.getGridFactory.map(row => ({ value: row.factoryId, label: row.factoryName })); setFactoryTypeOptions(options); resolve(options); }
        })
        .catch(err => { console.error(err); reject(err); });
    });
  }

  function fetchGridWarehouse() {
    const query = `query getGridWarehouse { getGridWarehouse { warehouseId warehouseName warehouseType } }`;
    return new Promise((resolve, reject) => {
      fetch(GRAPHQL_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ query }) })
        .then(response => { if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`); return response.json(); })
        .then(data => {
          if (data.errors) { console.error(data.errors); reject(data.errors); }
          else { const options = data.data.getGridWarehouse.map(row => ({ value: row.warehouseId, label: row.warehouseName })); setWarehouseTypeOptions(options); resolve(options); }
        })
        .catch(err => { console.error(err); reject(err); });
    });
  }

  function fetchGridMaterial() {
    const query = `query getMaterialCode { getMaterialCode { supplierId manufacturerName systemMaterialId materialName materialCategory unit } }`;
    return new Promise((resolve, reject) => {
      fetch(GRAPHQL_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ query }) })
        .then(response => { if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`); return response.json(); })
        .then(data => {
          if (data.errors) { console.error(data.errors); reject(data.errors); }
          else { const options = data.data.getMaterialCode.map(row => ({ value: row.systemMaterialId, label: row.materialName })); setMaterialTypeOptions(options); resolve(options); }
        })
        .catch(err => { console.error(err); reject(err); });
    });
  }

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    const loadCodeData = async () => {
      setIsLoading(true);
      try {
        await fetchGridCodesByCodeClassId("CD20250410151400958", setOutTypeOptions); // 출고 유형 코드 로드
        await fetchGridFactory();
        await fetchGridWarehouse();
        await fetchGridMaterial();

        console.log("코드 데이터 로드 완료:", { outTypeOptions, factoryTypeOptions, warehouseTypeOptions, materialTypeOptions });

        // 코드 로드 후 검색 실행 (딜레이 없이)
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
            <Typography>
              {parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
            </Typography>
          </Box>
        );
      },
    },
    { field: 'unitPrice', headerName: '단위 금액', width: 70, headerAlign: 'center', align: 'center', type: 'number', editable: true },
    { field: 'unitVat', headerName: '부가세', width: 70, headerAlign: 'center', align: 'center', type: 'number', editable: true },
    { field: 'totalPrice', headerName: '총금액', width: 70, headerAlign: 'center', align: 'center', type: 'number', editable: true }, // 클라이언트 계산 시 editable: true
    { field: 'createUser', headerName: '등록자', width: 120, headerAlign: 'center', align: 'center', editable: false },
    { field: 'createDate', headerName: '등록일', width: 120, headerAlign: 'center', align: 'center', type: 'dateTime', editable: false },
    { field: 'updateUser', headerName: '수정자', width: 120, headerAlign: 'center', align: 'center', editable: false },
    { field: 'updateDate', headerName: '수정일', width: 120, headerAlign: 'center', align: 'center', type: 'dateTime', editable: false },
  ];

  // 출고 목록 그리드 버튼
  const outboundGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> },
  ];

  // 출고 상세 그리드 버튼
  const detailedOutboundGridButtons = [
    { label: '등록', onClick: handleDetailAdd, icon: <AddIcon /> },
    { label: '저장', onClick: handleDetailSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDetailDelete, icon: <DeleteIcon /> },
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