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
import {graphFetch} from "../../api/fetchConfig";

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
  const { control, handleSubmit, reset, getValues, setValue } = useForm({
    defaultValues: {
      inManagementId: '',
      inType: '',
      factoryName: '',
      warehouseName: '',
      createUser: '',
      hasInvoice: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    }
  });

  // 초기화 함수
  const handleReset = () => {
    reset({
      inManagementId: '',
      inType: '',
      factoryName: '',
      warehouseName: '',
      createUser: '',
      hasInvoice: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    });
  };
  

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);

  const [receivingList, setReceivingList] = useState([]);
  const [newReceivingList, setNewReceivingList] = useState([]);
  
  const [selectedReceiving, setSelectedReceiving] = useState(null);
  const [selectedDetailReceiving, setSelectedDetailReceiving] = useState(null);
  const [receivingDetail, setReceivingDetail] = useState([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  // 추가 코드 
  const [refreshKey, setRefreshKey] = useState(0); // 강제 리렌더링용 키
  const [updatedRows, setUpdatedRows] = useState([]); // 수정된 필드만 저장하는 객체
  const [addRows,setAddRows] = useState([]);
  const [updatedDetailRows, setUpdatedDetailRows] = useState([]); // 수정된 필드만 저장하는 객체
  const [addDetailRows,setAddDetailRows] = useState([]);

  // 공장 타입 옵션
  const [factoryTypeOptions, setFactoryTypeOptions] = useState([]);
  // 창고 타입 옵션
  const [warehouseTypeOptions, setWarehouseTypeOptions] = useState([]);
  // 입고 타입 옵션
  const [inTypeOptions, setInTypeOptions] = useState([]);
  // 자재 타입 옵션
  const [materialTypeOptions, setMaterialTypeOptions] = useState([]);

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = (startDate, endDate) => {
    setValue('dateRange', { startDate, endDate });
  };

  // GraphQL 쿼리 정의
  const INVENTORY_IN_QUERIES = {
    GET_INVENTORY_IN_MANAGEMENT_LIST: `
      query getInventoryInManagementList($filter: InventoryInManagementFilter) {
        getInventoryInManagementList(filter: $filter) {
          inManagementId
          inType
          factoryId
          warehouseId
          materialInfo
          totalPrice
          hasInvoice
          userName
          createDate
        }
      }
    `,
    GET_INVENTORY_IN_LIST: `
      query getInventoryInList($filter: InventoryInFilter) {
        getInventoryInList(filter: $filter) {
          inManagementId
          inInventoryId
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

  // // 천 단위 구분 포맷터 함수
  // const priceFormatter = (params) => {
  //   if (params.value == null) return '';
  //   return params.value.toLocaleString('ko-KR');
  // };

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

      // 응답 텍스트 먼저 확인
      const responseText = await response.text();
      console.log('GraphQL 응답 원본:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));

      // 텍스트가 비어있지 않은 경우에만 JSON 파싱
      if (responseText.trim()) {
        const data = JSON.parse(responseText);
        console.log('GraphQL 응답 파싱됨:', data);
        
        // GraphQL 에러 확인
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
    console.log(inTypeOptions);
    setUpdatedDetailRows([]);
    setAddRows([]);

    console.log('검색 데이터:', data);

    try {
      // 필터 객체 생성 - 백엔드의 InventoryInManagementFilter와 일치
      const filter = {
        inManagementId: data.inManagementId || null,
        inType: data.inType || null,
        factoryName: data.factoryName || null,
        warehouseName: data.warehouseName || null,
        createUser: data.createUser || null,
        hasInvoice: data.hasInvoice || null,
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
          query: INVENTORY_IN_QUERIES.GET_INVENTORY_IN_MANAGEMENT_LIST,
          variables: { filter }
        })
      });
      
      console.log('응답 상태:', response.status, response.statusText);
      
      const responseText = await response.text();
      console.log('응답 내용:', responseText.substring(0, 200));
      
      if (responseText.trim()) {
        const result = JSON.parse(responseText);
        console.log('파싱된 결과:', result);
        
        if (result.data && result.data.getInventoryInManagementList) {
          // 받아온 데이터로 상태 업데이트 - ID 필드를 그대로 사용
          setReceivingList(result.data.getInventoryInManagementList.map(item => ({
            id: item.inManagementId,
            inManagementId: item.inManagementId,
            inType: item.inType,
            factoryId: item.factoryId, // factoryName 대신 factoryId 사용
            warehouseId: item.warehouseId, // warehouseName 대신 warehouseId 사용
            materialInfo: item.materialInfo,
            totalPrice: item.totalPrice,
            hasInvoice: item.hasInvoice ? 'Y' : 'N', // 미리 Y/N 문자열로 변환
            userName: item.userName,
            createDate: item.createDate
          })));
          
          // 선택 상태 초기화
          setSelectedReceiving(null);
          setReceivingDetail([]);
        } else {
          console.error('응답 데이터가 예상 형식과 다릅니다:', result);
          // 응답 데이터에 문제가 있거나 빈 배열이면 빈 배열로 설정
          setReceivingList([]);
          setSelectedReceiving(null);
          setReceivingDetail([]);
          
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
        setSelectedReceiving(null);
        setReceivingDetail([]);
        
        Swal.fire({
          icon: 'error',
          title: '오류 발생',
          text: '서버로부터 빈 응답을 받았습니다.'
        });
      }
    } catch (error) {
      console.error('데이터 조회 오류:', error);
      setReceivingList([]); // 오류 발생 시 빈 배열로 설정
      setSelectedReceiving(null);
      setReceivingDetail([]);
      
      Swal.fire({
        icon: 'error',
        title: '데이터 조회 실패',
        text: `오류: ${error.message || '알 수 없는 오류가 발생했습니다.'}`
      });
    }
  }, []);

  // 입고 선택 핸들러 Row 클릭
  const handleReceivingSelect = async (params) => {
    console.log('선택된 행:', params);
    
    // 수정: columns가 아닌 row를 저장
    setSelectedReceiving(params.row);
    
    try {
      // 필터 객체 생성
      const filter = {
        inManagementId: params.row?.inManagementId || null,
      };

      // GraphQL 요청 보내기
      const result = await fetchGraphQL(
        INVENTORY_IN_QUERIES.GET_INVENTORY_IN_LIST,
        { filter }
      );

      if (result && result.getInventoryInList) {
        // 받아온 데이터로 상태 업데이트
        const detailData = result.getInventoryInList.map((item, index) => ({
          id: item.inInventoryId || `detail_${item.inManagementId}_${index}`,
          inManagementId: item.inManagementId,
          inInventoryId: item.inInventoryId,
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

  const handleDetailReceivingSelect = (params) => {
    setSelectedDetailReceiving(params.row);
    console.log('상세 데이터 선택:', params.row);
  };

  const handleDetailAdd = () => {
    if(selectedReceiving == null) {
      Swal.fire({
        icon: 'info',
        title: '알림',
        text: '입고항목을 선택하세요',
        confirmButtonText: '확인'
      });
      return;
    }

    const newDetailedInventory = {
      id: `NEW_${Date.now()}`,
      inManagementId: selectedReceiving.inManagementId,
      inInventoryId: crypto.randomUUID(),
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

  setReceivingDetail([...receivingDetail, newDetailedInventory]);
  
  // addRows에도 추가
  setAddRows([...addRows, newDetailedInventory]);

  }

  // 등록 버튼 클릭 핸들러
  const handleAdd = () => {
    const newInventory = {
      id: `NEW_${Date.now()}`,
      inManagementId: '자동',
      inType: null,
      warehouseId: null,
      factoryId: null,
      materialInfo: '자동',
      totalPrice: 0,
      hasInvoice: null,
      userName: '자동',
      createDate: new Date().toISOString().split('T')[0]
    };
    
    setReceivingList((prevList) => [newInventory, ...prevList]);
    setAddRows((prevAddRows) => [...prevAddRows, newInventory]);
  };

  const handleSave = () => {
    // 그리드에 있는 새 행 데이터 필터링 (NEW_로 시작하는 ID)
    const newRows = receivingList.filter(row => row.id.toString().startsWith('NEW_'));
    
    if (newRows.length === 0) {
      Swal.fire({
        icon: 'info',
        title: '알림',
        text: '저장할 새 데이터가 없습니다.',
        confirmButtonText: '확인'
      });
      return;
    }

    console.log(newRows);

    const createdRows = newRows.map(row => ({
      inType: row.inType,
      factoryId: row.factoryId,
      warehouseId: row.warehouseId || row.warehouseName, // 둘 중 하나가 있을 수 있음
      hasInvoice: row.hasInvoice,
      totalPrice: String(row.totalPrice || '0')
    }));

    console.log('백엔드로 전송할 데이터:', createdRows);

    const validateRequiredFields = (rows, fieldMapping) => {
      for (const row of rows) {
        for (const field of Object.keys(fieldMapping)) {
          if (row[field] === undefined || row[field] === null || row[field] === '') {
            Message.showError({ message: `${fieldMapping[field]} 필드는 필수 입력값입니다.` });
            return false;
          }
        }
      }
      return true;
    };

    // 필수 필드 검증
    const requiredFields = {
      factoryId: '공장명',
      warehouseId: '창고명',
      inType: '입고타입',
    };

    if (!validateRequiredFields(addRows, requiredFields)) {
      return;
    }

    // 기존 API 호출 코드
    fetch(GRAPHQL_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          mutation saveInventoryInManagement($createdRows: [InventoryInManagementSaveInput]) {
            saveInventoryInManagement(createdRows: $createdRows)
          }
        `,
        variables: {
          createdRows: createdRows
        }
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.errors) {
        console.error("GraphQL errors:", data.errors);
        Swal.fire({
          icon: 'error',
          title: '저장 실패',
          text: data.errors[0]?.message || '저장 중 오류가 발생했습니다.',
          confirmButtonText: '확인'
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: '성공',
          text: '저장되었습니다.',
          confirmButtonText: '확인'
        });
        // 상태 초기화 및 데이터 새로고침
        setNewReceivingList([]);
        handleSearch({});
      }
    })
    .catch(error => {
      console.error("Error saving inventory:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '저장 중 예외가 발생했습니다: ' + error.message,
        confirmButtonText: '확인'
      });
    });
  }

  const handleDelete = () => {
    if (!selectedReceiving) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 입고목록을 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    const deleteInventoryMutation = `
      mutation DeleteInventoryInManagement($inManagementId: InventoryInManagementDeleteInput!) {
        deleteInventoryInManagement(inManagementId: $inManagementId)
      }
    `;

    const variables = {
      inManagementId: {
        inManagementId: selectedReceiving.inManagementId,
      }
    };

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
        fetch(GRAPHQL_URL, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: deleteInventoryMutation,
            variables: variables
          })
        })
            .then((res) => res.json())
            .then((data) => {
              if (data.errors) {
                console.error("GraphQL errors:", data.errors);
                Swal.fire({
                  icon: 'error',
                  title: '삭제 실패',
                  text: '삭제 중 오류가 발생했습니다.'
                });
              } else {
                Swal.fire({
                  icon: 'success',
                  title: '성공',
                  text: '삭제되었습니다.',
                  confirmButtonText: '확인'
                });
              }
            })
            .catch((error) => {
              console.error("Error deleting factory:", error);
              Swal.fire({
                icon: 'error',
                title: '삭제 실패',
                text: '삭제 중 예외가 발생했습니다.'
              });
            })
            .finally(() => {
              // 로컬 상태에서 삭제된 항목 제거
              setReceivingList(prevList => prevList.filter(item => item.inManagementId !== selectedReceiving.inManagementId));
              setSelectedReceiving(null);
              setReceivingDetail([]);
              // 컴포넌트 강제 리렌더링
              setRefreshKey(prevKey => prevKey + 1);
            });
      }
    });
  };

  const handleDetailSave = () => {
    // 새로 추가된 행 필터링 (addRows 대신 receivingDetail에서 직접 가져옴)
    const newRows = receivingDetail.filter(row => row.id.toString().startsWith('NEW_'));
    
    // 수정된 기존 행 필터링 (id가 NEW_로 시작하지 않고, 원래 데이터와 다른 행)
    const updatedRows = receivingDetail.filter(row => 
      !row.id.toString().startsWith('NEW_') && 
      updatedDetailRows.some(updatedRow => updatedRow.inInventoryId === row.inInventoryId)
    );
    
    console.log('저장할 새 상세 데이터:', newRows);
    console.log('업데이트할 상세 데이터:', updatedRows);

    if (newRows.length === 0 && updatedRows.length === 0) {
      Swal.fire({
        icon: 'info',
        title: '알림',
        text: '저장할 새 데이터나 수정된 데이터가 없습니다.',
        confirmButtonText: '확인'
      });
      return;
    }

    // 필수 필드 확인
    const requiredFields = [
      { value: 'systemMaterialId', label: '자재코드' },
    ];
    
    // 새 행 필수 필드 검증
    for (const row of newRows) {
      for (const field of requiredFields) {
        if (!row[field.value] || row[field.value] === '' || row[field.value] === 0) {
          Swal.fire({
            icon: 'error',
            title: '입력 오류',
            text: `${field.label} 필드는 필수 입력 항목입니다.`,
            confirmButtonText: '확인'
          });
          return;
        }
      }
    }
    
    // 수정된 행 필수 필드 검증
    for (const row of updatedRows) {
      for (const field of requiredFields) {
        if (!row[field.value] || row[field.value] === '' || row[field.value] === 0) {
          Swal.fire({
            icon: 'error',
            title: '입력 오류',
            text: `${field.label} 필드는 필수 입력 항목입니다.`,
            confirmButtonText: '확인'
          });
          return;
        }
      }
    }

    // 백엔드에 맞게 데이터 변환
    const createdInventoryInputs = newRows.map(row => ({
      inManagementId: row.inManagementId,
      supplierName: row.supplierName || '',
      manufactureName: row.manufactureName || '',
      systemMaterialId: row.systemMaterialId || '',
      materialName: row.materialName || '',
      materialCategory: row.materialCategory || '',
      materialStandard: row.materialStandard || '',
      qty: String(row.qty || 0),
      unitPrice: String(row.unitPrice || 0),
      unitVat: String(row.unitVat || 0),
      totalPrice: String(row.totalPrice || 0),
      createUser: row.createUser || 'system',
      createDate: row.createDate ? new Date(row.createDate).toISOString() : new Date().toISOString(),
      updateUser: row.updateUser || 'system',
      updateDate: row.updateDate ? new Date(row.updateDate).toISOString() : new Date().toISOString()
    }));

    const updatedInventoryInputs = updatedRows.map(row => ({
      inManagementId: row.inManagementId,
      inInventoryId: row.inInventoryId,
      supplierName: row.supplierName || '',
      manufactureName: row.manufactureName || '',
      systemMaterialId: row.systemMaterialId || '',
      materialName: row.materialName || '',
      materialCategory: row.materialCategory || '',
      materialStandard: row.materialStandard || '',
      qty: String(row.qty || 0),
      unitPrice: String(row.unitPrice || 0),
      unitVat: String(row.unitVat || 0),
      totalPrice: String(row.totalPrice || 0),
      createUser: row.createUser || 'system',
      createDate: row.createDate ? new Date(row.createDate).toISOString() : new Date().toISOString(),
      updateUser: row.updateUser || 'system',
      updateDate: row.updateDate ? new Date(row.updateDate).toISOString() : new Date().toISOString()
    }));

    console.log('백엔드로 전송할 새 데이터:', createdInventoryInputs);
    console.log('백엔드로 전송할 수정 데이터:', updatedInventoryInputs);

    // API 호출
    fetch(GRAPHQL_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          mutation saveInventoryIn($createdRows: [InventoryInSaveInput], $updatedRows: [InventoryInUpdateInput]) {
            saveInventoryIn(createdRows: $createdRows, updatedRows: $updatedRows)
          }
        `,
        variables: {
          createdRows: createdInventoryInputs,
          updatedRows: updatedInventoryInputs
        }
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.errors) {
        console.error("GraphQL errors:", data.errors);
        Swal.fire({
          icon: 'error',
          title: '저장 실패',
          text: data.errors[0]?.message || '저장 중 오류가 발생했습니다.',
          confirmButtonText: '확인'
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: '성공',
          text: '저장되었습니다.',
          confirmButtonText: '확인'
        });
        // 상태 초기화
        setAddRows([]);
        setUpdatedDetailRows([]);
        // 상세 데이터 새로고침 - 선택된 로우가 있는 경우만
        if (selectedReceiving) {
          const filter = {
            inManagementId: selectedReceiving.inManagementId || null
          };
          
          fetchGraphQL(
            INVENTORY_IN_QUERIES.GET_INVENTORY_IN_LIST,
            { filter }
          ).then(result => {
            if (result && result.getInventoryInList) {
              const detailData = result.getInventoryInList.map((item, index) => ({
                id: item.inInventoryId || `detail_${item.inManagementId}_${index}`,
                inManagementId: item.inManagementId,
                inInventoryId: item.inInventoryId,
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
              
              setReceivingDetail(detailData);
            }
          }).catch(error => {
            console.error('상세 데이터 새로고침 오류:', error);
          });
        }
      }
    })
    .catch(error => {
      console.error("Error saving inventory detail:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '저장 중 예외가 발생했습니다: ' + error.message,
        confirmButtonText: '확인'
      });
    });
  };

  // 삭제 버튼 클릭 핸들러
  const handleDetailDelete = () => {
    if (!selectedDetailReceiving) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 입고목록을 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    const deleteDetailInventoryMutation = `
      mutation DeleteInventoryIn($inInventoryId: InventoryInDeleteInput!) {
        deleteInventoryIn(inInventoryId: $inInventoryId)
      }
    `;

    const variables = {
      inInventoryId: {
        inInventoryId: selectedDetailReceiving.inInventoryId,
      }
    };

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
        fetch(GRAPHQL_URL, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: deleteDetailInventoryMutation,
            variables: variables
          })
        })
            .then((res) => res.json())
            .then((data) => {
              if (data.errors) {
                console.error("GraphQL errors:", data.errors);
                Swal.fire({
                  icon: 'error',
                  title: '삭제 실패',
                  text: '삭제 중 오류가 발생했습니다.'
                });
              } else {
                Swal.fire({
                  icon: 'success',
                  title: '성공',
                  text: '삭제되었습니다.',
                  confirmButtonText: '확인'
                });
              }
            })
            .catch((error) => {
              console.error("Error deleting factory:", error);
              Swal.fire({
                icon: 'error',
                title: '삭제 실패',
                text: '삭제 중 예외가 발생했습니다.'
              });
            })
            .finally(() => {
              // 로컬 상태에서 삭제된 항목 제거
              setReceivingDetail(prevDetail => prevDetail.filter(item => item.inInventoryId !== selectedDetailReceiving.inInventoryId));
              setSelectedDetailReceiving(null);
              // 컴포넌트 강제 리렌더링
              setRefreshKey(prevKey => prevKey + 1);
            });
      }
    });
  };

  function handleProcessRowUpdate(newRow, oldRow) {
    const isNewRow = oldRow.id.startsWith('NEW_');

    setReceivingList((prev) => {
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
      setUpdatedRows(prevUpdatedRows => {
        // 같은 factoryId를 가진 기존 행이 있는지 확인
        const existingIndex = prevUpdatedRows.findIndex(row => row.inManagementId === newRow.inManagementId);

        if (existingIndex !== -1) {

          // 기존에 같은 factoryId가 있다면, 해당 객체를 새 값(newRow)으로 대체
          const updated = [...prevUpdatedRows];
          updated[existingIndex] = newRow;
          return updated;
        } else {

          // 없다면 새로 추가
          return [...prevUpdatedRows, newRow];
        }
      });
    }

    return { ...oldRow, ...newRow };
  }

  function handleDetailProcessRowUpdate(newRow, oldRow) {
    const isNewRow = oldRow.id.startsWith('NEW_');

    setReceivingDetail((prev) => {
      return prev.map((row) =>
          //기존 행이면 덮어씌우기 새로운행이면 새로운행 추가
          row.id === oldRow.id ? { ...row, ...newRow } : row
      );
    });

    if (isNewRow) {
      // 신규 행인 경우 addRows 상태에 추가 (같은 id가 있으면 덮어씀)
      setAddDetailRows((prevAddRows) => {
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
        // 같은 factoryId를 가진 기존 행이 있는지 확인
        const existingIndex = prevUpdatedRows.findIndex(row => row.inInventoryId === newRow.inInventoryId);

        if (existingIndex !== -1) {

          // 기존에 같은 factoryId가 있다면, 해당 객체를 새 값(newRow)으로 대체
          const updated = [...prevUpdatedRows];
          updated[existingIndex] = newRow;
          return updated;
        } else {

          // 없다면 새로 추가
          return [...prevUpdatedRows, newRow];
        }
      });
    }

    return { ...oldRow, ...newRow };
  }

  function fetchGridCodesByCodeClassId(codeClassId, setOptions) {
    const query = `
    query getGridCodes($codeClassId: String!) {
      getGridCodes(codeClassId: $codeClassId) {
        codeId
        codeName
      }
    }
  `;

    return new Promise((resolve, reject) => {
      graphFetch(
          query,
          {codeClassId:codeClassId})
      .then((data) => {
            if (data.errors) {
              console.error(data.errors);
              reject(data.errors);
            } else {
              const options = data.getGridCodes.map((row) => ({
                value: row.codeId,
                label: row.codeName,
              }));
              setOptions(options);
              resolve(options);
            }
          })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
    });
  }

  function fetchGridFactory() {
    const query = `
    query getGridFactory {
      getGridFactory {
        factoryId
        factoryName
        factoryCode
      }
    }
  `;

  return new Promise((resolve, reject) => {
    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 쿠키 자동 전송 설정
      body: JSON.stringify({
        query
      })
    }).then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        }).then((data) => {
          if (data.errors) {
            console.error(data.errors);
            reject(data.errors);
          } else {
            // API에서 받은 데이터를 select 옵션 배열로 가공합니다.
            const options = data.data.getGridFactory.map((row) => ({
              value: row.factoryId,
              label: row.factoryName
            }));
            setFactoryTypeOptions(options);
            resolve(options);
          }
        }).catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  }

  function fetchGridWarehouse() {
    const query = `
    query getGridWarehouse {
      getGridWarehouse {
        warehouseId
        warehouseName
        warehouseType
      }
    }
  `;

  return new Promise((resolve, reject) => {
    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 쿠키 자동 전송 설정
      body: JSON.stringify({
        query
      })
    }).then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        }).then((data) => {
          if (data.errors) {
            console.error(data.errors);
            reject(data.errors);
          } else {
            // API에서 받은 데이터를 select 옵션 배열로 가공합니다.
            const options = data.data.getGridWarehouse.map((row) => ({
              value: row.warehouseId,
              label: row.warehouseName
            }));
            setWarehouseTypeOptions(options);
            resolve(options);
          }
        }).catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  }

  function fetchGridMaterial() {
    const query = `
    query getMaterialCode {
      getMaterialCode {
        supplierId
        manufacturerName
        systemMaterialId
        materialName
        materialCategory
        unit
      }
    }
  `;

  return new Promise((resolve, reject) => {
    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 쿠키 자동 전송 설정
      body: JSON.stringify({
        query
      })
    }).then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        }).then((data) => {
          if (data.errors) {
            console.error(data.errors);
            reject(data.errors);
          } else {
            // API에서 받은 데이터를 select 옵션 배열로 가공합니다.
            const options = data.data.getMaterialCode.map((row) => ({
              value: row.systemMaterialId,
              label: row.materialName
            }));
            setMaterialTypeOptions(options);
            resolve(options);
          }
        }).catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  }

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 먼저 코드 데이터를 로드
    const loadCodeData = async () => {
      try {
        // 입고 유형 코드 로드
        await fetchGridCodesByCodeClassId("CD20250409164927041", setInTypeOptions);
        // 공장 데이터 로드
        await fetchGridFactory();
        // 창고 데이터 로드
        await fetchGridWarehouse();
        // 자재 타입 코드 로드
        await fetchGridMaterial();

        console.log("코드 데이터 로드 완료:", { 
          inTypeOptions, 
          factoryTypeOptions, 
          warehouseTypeOptions 
        });

        // 모든 코드 데이터가 로드된 후 검색 실행
        setTimeout(() => {
          handleSearch({});
          setIsLoading(false);
        }, 300);
      } catch (error) {
        console.error("코드 데이터 로드 오류:", error);
        setIsLoading(false);
      }
    };

    loadCodeData();
    
    return () => {}; // 클린업 함수
  }, [handleSearch]);

  // 입고 목록 그리드 컬럼 정의
  const receivingColumns = [
    { field: 'inManagementId', 
      headerName: '입고관리ID', 
      width: 70,
      headerAlign: 'center',
      align: 'center',
      editable: false,
     }, 
    { field: 'inType', 
      headerName: '입고 유형', 
      width: 70,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // 새로 추가된 행인지 확인 (id가 NEW_로 시작하는지)
        const isNewRow = params.row.id?.toString().startsWith('NEW_');
        // 새로 추가된 행이고 값이 없는 경우에만 '필수 입력' 표시
        const showRequired = isNewRow && (!params.value || params.value === '');
        
        // inType 코드에 해당하는 표시 이름 찾기
        const option = inTypeOptions.find(opt => opt.value === params.value);
        const displayValue = option ? option.label : params.value;

        return (
          <Typography variant="body2" sx={{ color: showRequired ? '#f44336' : 'inherit' }}>
            {showRequired ? '필수 선택' : displayValue || ''}
          </Typography>
      );
      },
      editable: true,
      type: 'singleSelect',
      valueOptions: inTypeOptions
      },
    { field: 'warehouseId', 
      headerName: '창고', 
      width: 180,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // 새로 추가된 행인지 확인 (id가 NEW_로 시작하는지)
        const isNewRow = params.row.id?.toString().startsWith('NEW_');
        // 새로 추가된 행이고 값이 없는 경우에만 '필수 선택' 표시
        const showRequired = isNewRow && (!params.value || params.value === '');
        
        // warehouseId 코드에 해당하는 표시 이름 찾기
        const option = warehouseTypeOptions.find(opt => opt.value === params.value);
        const displayValue = option ? option.label : params.value;

        return (
            <Typography variant="body2" sx={{color: showRequired ? '#f44336' : 'inherit'}}>
              {showRequired ? '필수 선택' : displayValue || ''}
            </Typography>
        );
      },
      editable: true,
      type: 'singleSelect',
      valueOptions: warehouseTypeOptions,
      flex: 1 },
    { field: 'factoryId', 
      headerName: '공장', 
      width: 70,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // 새로 추가된 행인지 확인 (id가 NEW_로 시작하는지)
        const isNewRow = params.row.id?.toString().startsWith('NEW_');
        // 새로 추가된 행이고 값이 없는 경우에만 '필수 선택' 표시
        const showRequired = isNewRow && (!params.value || params.value === '');
        
        // factoryId 코드에 해당하는 표시 이름 찾기
        const option = factoryTypeOptions.find(opt => opt.value === params.value);
        const displayValue = option ? option.label : params.value;

        return (
            <Typography variant="body2" sx={{color: showRequired ? '#f44336' : 'inherit'}}>
              {showRequired ? '필수 선택' : displayValue || ''}
            </Typography>
        );
      },
      editable: true,
      type: 'singleSelect',
      valueOptions: factoryTypeOptions
     },
    { field: 'materialInfo', 
      headerName: '자재정보', 
      width: 120,
      headerAlign: 'center',
      align: 'center',
      editable: false,
     },
    { field: 'totalPrice', 
      headerName: '총 금액',
      width: 70,
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      editable: false,
     },
    { field: 'hasInvoice', 
      headerName: '거래명세서', 
      width: 50,
      headerAlign: 'center',
      align: 'center',
      editable: false,
     },
    { field: 'userName', 
      headerName: '생성자', 
      width: 100,
      headerAlign: 'center',
      align: 'center',
      editable: false,
     },
    { field: 'createDate', 
      headerName: '생성일', 
      width: 100,
      headerAlign: 'center',
      align: 'center',
      editable: false,
     }
  ];
  
  // 입고 상세 정보 그리드 컬럼 정의
  const detailedReceivingColumns = [
    { field: 'inManagementId', 
      headerName: '입고관리ID', 
      width: 70, 
      headerAlign: 'center',
      align: 'center',
      editable: false },
    { field: 'inInventoryId', 
      headerName: '입고ID', 
      width: 70, 
      headerAlign: 'center',
      align: 'center',
      editable: false, hide: true },
    { field: 'supplierName', 
      headerName: '공급업체', 
      width: 100, 
      headerAlign: 'center',
      align: 'center',
      editable: false },
    { field: 'manufactureName', 
      headerName: '제조사명', 
      width: 100, 
      headerAlign: 'center',
      align: 'center',
      editable: false },
    { field: 'systemMaterialId', 
      headerName: '자재', 
      width: 120, 
      headerAlign: 'center',
      align: 'center',
      editable: true,
      type: 'singleSelect',
      valueOptions: materialTypeOptions,
      renderCell: (params) => {
        // 새로 추가된 행인지 확인 (id가 NEW_로 시작하는지)
        const isNewRow = params.row.id?.toString().startsWith('NEW_');
        // 새로 추가된 행이고 값이 없는 경우에만 '필수 입력' 표시
        const showRequired = isNewRow && (!params.value || params.value === '');
        
        // inType 코드에 해당하는 표시 이름 찾기
        const option = materialTypeOptions.find(opt => opt.value === params.value);
        const displayValue = option ? option.label : params.value;

        return (
          <Typography variant="body2" sx={{ color: showRequired ? '#f44336' : 'inherit' }}>
            {showRequired ? '필수 선택' : displayValue || ''}
          </Typography>
      );
     }
    },
    { field: 'materialCategory', 
      headerName: '자재유형', 
      width: 70, 
      headerAlign: 'center',
      align: 'center',
      editable: false },
    { field: 'materialStandard', 
      headerName: '규격', 
      width: 70, 
      headerAlign: 'center',
      align: 'center',
      editable: false },
    { field: 'qty', 
      headerName: '수량', 
      width: 30, 
      headerAlign: 'center',
      align: 'center',
      type: 'number', editable: true },
    { field: 'unitPrice', 
      headerName: '단위 금액', 
      width: 70, 
      headerAlign: 'center',
      align: 'center',
      type: 'number', editable: true },
    { field: 'unitVat', 
      headerName: '부가세', 
      width: 70, 
      headerAlign: 'center',
      align: 'center',
      type: 'number', editable: true },
    { field: 'totalPrice', 
      headerName: '총금액', 
      width: 70, 
      headerAlign: 'center',
      align: 'center',
      type: 'number', editable: true },
    { field: 'createUser', 
      headerName: '등록자', 
      width: 120, 
      headerAlign: 'center',
      align: 'center',
      editable: false },
    { field: 'createDate', 
      headerName: '등록일', 
      width: 120, 
      headerAlign: 'center',
      align: 'center',
      type: 'dateTime', 
      editable: false },
    { field: 'updateUser', 
      headerName: '수정자', 
      width: 120, 
      headerAlign: 'center',
      align: 'center',
      editable: false },
    { field: 'updateDate', 
      headerName: '수정일', 
      width: 120, 
      headerAlign: 'center',
      align: 'center',
      type: 'dateTime',
      editable: false },
  ];

  // 입고 목록 그리드 버튼
  const receivingGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> },
  ];

  // 입고 상세 그리드 버튼
  const detailedReceivingGridButtons = [
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
          입고관리
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
            name="inManagementId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="입고관리ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="입고관리ID를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="inType"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="productType-label">입고 유형</InputLabel>
                <Select
                  {...field}
                  labelId="productType-label"
                  label="입고 유형"
                >
                  <MenuItem value="">전체</MenuItem>
                  {inTypeOptions.map((option) => (
                    <MenuItem value={option.value}>
                      {option.label}
                    </MenuItem>
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
                label="입고자"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="입고자를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="hasInvoice"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="hasInvoice-label">거래명세서</InputLabel>
                <Select
                  {...field}
                  labelId="hasInvoice-label"
                  label="거래명세서"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="Y">있음</MenuItem>
                  <MenuItem value="N">없음</MenuItem>
                </Select>
              </FormControl>
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
                          label="입고일"
                          size="small"
                      />
                  )}
              />
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
              height={660}
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
          </Grid>
          
          {/* 입고 상세 정보 그리드 */}
          <Grid item xs={12} md={7}>
          <EnhancedDataGridWrapper
              title="상세 정보"
              key={refreshKey + 1}  // 강제 리렌더링 위해 key 변경
              rows={receivingDetail}
              columns={detailedReceivingColumns.filter(col => col.field !== 'inInventoryId')}
              buttons={detailedReceivingGridButtons}
              height={660}
              onRowClick={handleDetailReceivingSelect}
              tabId={props.tabId + "-factories"}
              gridProps={{
                editMode: 'cell',
                onProcessUpdate: handleDetailProcessRowUpdate
              }}
              />
          </Grid>
        </Grid>
      )}

      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="입고관리 도움말"
      >
        <Typography variant="body2" color={getTextColor()}>
          • 입고관리에서는 자재나 제품의 입고 정보를 등록하고 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 입고번호, 거래처 정보, 제품 정보, 입고수량 등을 관리하여 입고를 체계적으로 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 입고 정보는 재고 관리, 생산 계획 등에서 활용됩니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default ReceivingManagement;