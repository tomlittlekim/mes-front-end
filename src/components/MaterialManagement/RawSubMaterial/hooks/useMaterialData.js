import {useEffect, useState} from 'react';
import { useGridUtils } from '../../../../utils/grid/useGridUtils';
import { useGridDataCall } from '../../../../utils/grid/useGridDataCall';
import { useGridRow } from '../../../../utils/grid/useGridRow';
import { useGridValidation } from '../../../../utils/grid/useGridValidation';
import { gql } from '@apollo/client';
import {
  RAW_SUB_MATERIAL_QUERY,
  MATERIAL_MUTATION,
  DELETE_MUTATION, VENDOR_LIST_BY_TYPE_QUERY
} from '../../../../graphql-queries/material-master/materialQueries';
import { SEARCH_CONDITIONS } from '../components/SearchForm';
import Message from '../../../../utils/message/Message';
import {getDefaultGridCodeList, getGridCodeList} from "../../../../api/standardInfo/commonCodeApi";
import { getColumns } from '../components/MaterialGrid';

// GraphQL 쿼리 정의
const MATERIAL_GET = gql`${RAW_SUB_MATERIAL_QUERY}`;
const MATERIAL_SAVE = gql`${MATERIAL_MUTATION}`;
const MATERIAL_DELETE = gql`${DELETE_MUTATION}`;

// 거래처 정보 쿼리 정의
const VENDOR_CODE_LIST_GET_BY_TYPE = gql`${VENDOR_LIST_BY_TYPE_QUERY}`;

/** 신규 행추가 시 생성되는 구조 */
export const NEW_ROW_STRUCTURE = {
  seq: null,
  materialType: '',
  materialCategory: '',
  systemMaterialId: '',
  userMaterialId: '',
  materialName: '',
  materialStandard: '',
  unit: '',
  minQuantity: 0,
  maxQuantity: 0,
  manufacturerName: '',
  supplierId: '',
  createUser: '자동입력',
  createDate: '자동입력',
  updateUser: '자동입력',
  updateDate: '자동입력'
};

export const useMaterialData = (executeQuery, executeMutation) => {
  const [materialList, setMaterialList] = useState([]);
  const { generateId, formatDateToYYYYMMDD, formatGridData } = useGridUtils();
  const [commonCodes, setCommonCodes] = useState({});
  const [vendorOptions, setVendorOptions] = useState([]);

  // 공통코드 로드
  useEffect(() => {
    const loadCommonCodes = async () => {
      // site, comp cd 따라 다르게 호출되는 부분
      const normalCodes = [
        'CD20250402131435416', // 단위
        'CD20250428144831625', // 자재유형
      ];

      // site, comp cd = default 호출
      const defaultCodes = [
        'CD20250428145908166', // 원부자재
      ];

      try {
        // 각 API 호출에 대해 별도로 try-catch 처리
        let codes1 = {}, codes2 = {};
          codes1 = await getGridCodeList(normalCodes);
          codes2 = await getDefaultGridCodeList(defaultCodes);

        const mergedCodes = {
          ...codes1,
          ...codes2
        };
        
        setCommonCodes(mergedCodes);
      } catch (error) {
        console.error('공통코드 로드 실패:', error);
        setCommonCodes({}); // 에러 발생 시 빈 객체로 설정
      }
    };

    loadCommonCodes();
  }, []);

  // 거래처 정보 로드
  useEffect(() => {
    const loadInitialVendorOptions = async () => {
      await loadVendorOptions(['C20250331110117958']); // 구매처로 codeclassID 설정
    };

    loadInitialVendorOptions();
  }, []);

  // 거래처 정보 로드 함수
  const loadVendorOptions = async (vendorTypes) => {
    const response = await executeQuery({
      query: VENDOR_CODE_LIST_GET_BY_TYPE,
      variables: { vendorType: vendorTypes }
    });

    const options = response?.data?.getVendorsByType?.map(vendor => ({
      value: vendor.vendorId,
      label: vendor.vendorName
    })) || [];

    setVendorOptions(options);
  };
  
  // 데이터 포맷팅 함수 정의
  const formatMaterialData = (data) => formatGridData(data, 'getRawSubMaterials', material => ({
    ...material,
    id: material.systemMaterialId || generateId('TEMP')
  }));
  
  // 새로운 행 생성 함수 정의
  const createNewMaterial = () => ({
    id: generateId('NEW'),
    ...NEW_ROW_STRUCTURE,
    createDate: formatDateToYYYYMMDD(new Date()),
    updateDate: formatDateToYYYYMMDD(new Date())
  });
  
  /** Input 타입으로 변환 */
  const transformRowForMutation = (row) => ({
    materialType: row.materialType || '',
    materialCategory: row.materialCategory || '',
    userMaterialId: row.userMaterialId || '',
    materialName: row.materialName || '',
    materialStandard: row.materialStandard || '',
    unit: row.unit || '',
    minQuantity: row.minQuantity || 0,
    maxQuantity: row.maxQuantity || 0,
    manufacturerName: row.manufacturerName || '',
    supplierId: row.supplierId || '',
  });
  
  /** Update 타입으로 변환 - 여기서는 Input + systemMaterialId */
  const transformRowForUpdate = (row) => ({
    systemMaterialId: row.systemMaterialId,
    ...transformRowForMutation(row)
  });
  
  /** Delete 타입으로 변환 - 여기서는 systemMaterialId를 가지고 삭제 */
  const transformRowForDelete = (row) => ({
    systemMaterialId: row.systemMaterialId
  });

  /** 그리드 행 관리 훅 (useGridRow) - 그리드의 행 추가/수정/삭제/선택 관리 */
  const {
    selectedRows,
    addRows,
    updatedRows,
    setAddRows,
    setUpdatedRows,
    handleRowSelect,
    handleRowUpdate,
    handleRowAdd,
    formatSaveData,
    formatDeleteData
  } = useGridRow({
    createNewRow: createNewMaterial,
    formatNewRow: transformRowForMutation,
    formatUpdatedRow: transformRowForUpdate,
    formatExistingRow: transformRowForDelete
  });

  /** 그리드 데이터 호출 훅 (useGridDataCall) - API 호출과 데이터 관리 담당 */
  const {
    loading: isLoading,
    refresh,
    handleGridSearch,
    handleGridSave,
    handleGridDelete
  } = useGridDataCall({
    executeQuery,
    executeMutation,
    query: MATERIAL_GET,
    mutation: MATERIAL_SAVE,
    deleteMutation: MATERIAL_DELETE,
    formatData: formatMaterialData,
    defaultFilter: SEARCH_CONDITIONS,
    onSuccess: async () => {
      const result = await refresh({ filter: SEARCH_CONDITIONS });
      setMaterialList(result);
    },
    clearAddRows: () => setAddRows([]),
    clearUpdatedRows: () => setUpdatedRows([])
  });

  // 행 선택 시 이벤트 핸들러
  const handleSelectionModelChange = (newSelection) => {
    handleRowSelect(newSelection, materialList);
  };

  // 행 업데이트 시 이벤트 핸들러
  const handleProcessRowUpdate = (newRow, oldRow) => {
    return handleRowUpdate(newRow, oldRow, setMaterialList);
  };

  // 초기 데이터 로드
  const loadInitialData = async () => {
    const result = await refresh({ filter: SEARCH_CONDITIONS });
    setMaterialList(result);
    return result;
  };

  // 검색 처리
  const handleSearch = async (searchParams) => {
    const result = await handleGridSearch({ filter: searchParams });
    setMaterialList(result);
    return result;
  };

  // 커스텀 validation 함수
  const customValidation = (row) => {
    const errors = {};
    
    // 수량 validation
    if (row.minQuantity && row.maxQuantity && Number(row.minQuantity) > Number(row.maxQuantity)) {
      errors.minQuantity = '최소수량은 최대수량보다 작아야 합니다';
    }

    return errors;
  };

  // 드롭다운 옵션들
  const unitOptions = commonCodes['CD20250402131435416'] || [];
  const materialCategoryOptions = commonCodes['CD20250428144831625'] || [];
  const rawSubTypeOptions = commonCodes['CD20250428145908166'] || [];

  const { validateRows, validationErrors, clearValidationErrors } = useGridValidation({
    columns: getColumns({
      unitOptions,
      materialCategoryOptions,
      rawSubTypeOptions,
      vendorOptions
    }),
    customValidation
  });

  // 저장 처리
  const handleSave = async () => {
    const addRowQty = addRows.length;
    const updateRowQty = updatedRows.length;

    if(addRowQty + updateRowQty === 0 ){
      Message.showWarning('변경사항이 존재하지 않습니다.');
      return;
    }

    const saveData = formatSaveData(addRows, updatedRows);
    
    // validation 체크
    const { isValid } = validateRows([...addRows, ...updatedRows]);
    
    if (!isValid) {
      return;
    }

    await handleGridSave(saveData);
  };

  // 삭제 처리
  const handleDelete = async () => {
    const deleteData = formatDeleteData(selectedRows);

    if (!deleteData.newRows.length && !deleteData.existingRows.length) {
      Message.showWarning(Message.DELETE_SELECT_REQUIRED);
      return;
    }

    await handleGridDelete({
      mutationData: deleteData.existingRows.length > 0 ? {
        systemMaterialIds: deleteData.existingRows.map(row => row.systemMaterialId)
      } : null,
      setDataList: setMaterialList,
      newRows: deleteData.newRows,
      refreshFilter: { filter: SEARCH_CONDITIONS }
    });
  };

  return {
    materialList,
    setMaterialList,
    isLoading,
    refresh,
    selectedRows,
    addRows,
    updatedRows,
    handleSelectionModelChange,
    handleProcessRowUpdate,
    handleRowAdd,
    loadInitialData,
    handleSearch,
    handleSave,
    handleDelete,
    generateId,
    //드랍다운 옵션들
    unitOptions,
    materialCategoryOptions,
    rawSubTypeOptions,
    // 거래처 옵션 관련
    vendorOptions: vendorOptions || [],
    validationErrors,
    clearValidationErrors
  };
};

export default useMaterialData; 