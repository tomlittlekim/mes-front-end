import { useState } from 'react';
import { useGridUtils } from '../../../../utils/grid/useGridUtils';
import { useGridDataCall } from '../../../../utils/grid/useGridDataCall';
import { useGridRow } from '../../../../utils/grid/useGridRow';
import { gql } from '@apollo/client';
import {
  HALF_MATERIAL_QUERY,
  MATERIAL_MUTATION,
  DELETE_MUTATION
} from '../../../../graphql-queries/material-master/materialQueries';
import { SEARCH_CONDITIONS } from '../components/SearchForm';
import Message from '../../../../utils/message/Message';

// GraphQL 쿼리 정의
const MATERIAL_GET = gql`${HALF_MATERIAL_QUERY}`;
const MATERIAL_SAVE = gql`${MATERIAL_MUTATION}`;
const MATERIAL_DELETE = gql`${DELETE_MUTATION}`;

/** 신규 행추가 시 생성되는 구조 */
export const NEW_ROW_STRUCTURE = {
  seq: null,
  materialType: 'HALF_PRODUCT',
  materialCategory: '',
  systemMaterialId: '',
  userMaterialId: '',
  materialName: '',
  materialStandard: '',
  unit: '',
  baseQuantity: 0,
  createUser: '자동입력',
  createDate: '자동입력',
  updateUser: '자동입력',
  updateDate: '자동입력'
};

export const useHalfProductData = (executeQuery, executeMutation) => {
  const [materialList, setMaterialList] = useState([]);
  const { generateId, formatDateToYYYYMMDD, formatGridData } = useGridUtils();
  
  // 데이터 포맷팅 함수 정의
  const formatMaterialData = (data) => formatGridData(data, 'getHalfMaterials', material => ({
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
    baseQuantity: row.baseQuantity || 0,
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

  // 저장 처리
  const handleSave = async () => {
    const saveData = formatSaveData(addRows, updatedRows);
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
      newRows: deleteData.newRows
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
    generateId
  };
};

export default useHalfProductData; 