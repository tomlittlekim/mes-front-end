import { useState, useEffect, useCallback, useMemo } from 'react';
import Message from "../../../utils/message/Message";
import { useMaterialData } from '../../MaterialManagement/hooks/useMaterialData';

/**
 * BOM 상세 모달 데이터 관리를 위한 커스텀 훅
 * 
 * @param {Object} params - 훅 파라미터
 * @param {boolean} params.open - 모달이 열려있는지 여부
 * @param {Function} params.executeQuery - GraphQL 쿼리 실행 함수
 * @param {Function} params.generateId - ID 생성 함수
 * @param {Object} params.rowData - 선택된 행 데이터
 * @param {Function} params.setBomDetailList - BOM 상세 목록 상태 설정 함수
 * @param {Object} params.apiRef - DataGrid API 참조
 * @returns {Object} 모달 관련 상태 및 함수
 */
export const useBomDetailModalData = ({ 
  open, 
  executeQuery, 
  generateId, 
  rowData, 
  setBomDetailList,
  apiRef
}) => {
  // Material 데이터 훅
  const { materials, getMaterialById, loadMaterials } = useMaterialData(executeQuery);

  // 모달 상태 관리
  const [modalState, setModalState] = useState({
    materialType: '',
    materialCategory: '',
    materials: [],
    filteredMaterials: [],
    selectedMaterial: null,
    parentMaterialType: '',
    parentMaterialCategory: '',
    parentMaterials: [],
    parentFilteredMaterials: [],
    selectedParentMaterial: null
  });

  // 유효성 검사 상태 관리
  const [validation, setValidation] = useState({
    materialType: true,
    materialCategory: true,
    selectedMaterial: true,
    parentMaterialType: true,
    parentMaterialCategory: true,
    selectedParentMaterial: true
  });

  // 필드에 값이 있는지 확인하는 함수
  const checkFieldsValidity = useCallback(() => {
    return {
      materialType: !!modalState.materialType,
      materialCategory: !!modalState.materialCategory,
      selectedMaterial: !!modalState.selectedMaterial,
      parentMaterialType: !!modalState.parentMaterialType,
      parentMaterialCategory: !!modalState.parentMaterialCategory,
      selectedParentMaterial: !!modalState.selectedParentMaterial
    };
  }, [
    modalState.materialType,
    modalState.materialCategory,
    modalState.selectedMaterial,
    modalState.parentMaterialType,
    modalState.parentMaterialCategory,
    modalState.selectedParentMaterial
  ]);

  // 모든 필드가 유효한지 확인
  const isAllValid = useMemo(() => {
    const fieldValidity = checkFieldsValidity();
    return Object.values(fieldValidity).every(Boolean);
  }, [checkFieldsValidity]);

  // 제품 매핑 함수
  const findMaterialById = useCallback((systemMaterialId) => {
    if (!materials || !systemMaterialId) return null;
    return materials.find(m => m.systemMaterialId === systemMaterialId);
  }, [materials]);

  // 타입별 자료 필터링
  const filterMaterialsByType = useCallback((type) => {
    if (!materials || !type) return [];
    return materials.filter(m => m.materialType === type);
  }, [materials]);

  // 카테고리별 추가 필터링
  const filterByCategory = useCallback((materialList, category) => {
    if (!category) return materialList;
    return materialList.filter(m => m.materialCategory === category);
  }, []);

  // 모달이 열릴 때 데이터 초기화 및 설정
  useEffect(() => {
    if (!open) return;

    // 초기 validation 상태 설정
    setValidation({
      materialType: true,
      materialCategory: true,
      selectedMaterial: true,
      parentMaterialType: true,
      parentMaterialCategory: true,
      selectedParentMaterial: true
    });

    // 신규 행인지 확인 (rowData가 없거나 id가 'NEW'로 시작하면 신규 행)
    const isNewRow = !rowData || (rowData.id && rowData.id.toString().startsWith('NEW'));
    
    if (!isNewRow && rowData && materials && materials.length > 0) {
      // 자식 제품 찾기
      const childMaterial = findMaterialById(rowData.systemMaterialId);
      
      // 부모 제품 찾기
      const parentMaterial = findMaterialById(rowData.parentItemCd);
      
      const newState = {
        materialType: '',
        materialCategory: '',
        materials: [],
        filteredMaterials: [],
        selectedMaterial: null,
        parentMaterialType: '',
        parentMaterialCategory: '',
        parentMaterials: [],
        parentFilteredMaterials: [],
        selectedParentMaterial: null
      };
      
      // 1. 자식 제품 정보 설정
      if (childMaterial) {
        const filteredByType = filterMaterialsByType(childMaterial.materialType);
        
        newState.materialType = childMaterial.materialType;
        newState.materialCategory = childMaterial.materialCategory;
        newState.materials = filteredByType;
        newState.filteredMaterials = filterByCategory(filteredByType, childMaterial.materialCategory);
        newState.selectedMaterial = childMaterial;
      }
      
      // 2. 부모 제품 정보 설정
      if (parentMaterial) {
        const filteredParentByType = filterMaterialsByType(parentMaterial.materialType);
        
        newState.parentMaterialType = parentMaterial.materialType;
        newState.parentMaterialCategory = parentMaterial.materialCategory;
        newState.parentMaterials = filteredParentByType;
        newState.parentFilteredMaterials = filterByCategory(
          filteredParentByType, 
          parentMaterial.materialCategory
        );
        newState.selectedParentMaterial = parentMaterial;
      }
      
      // 상태 업데이트
      setModalState(newState);
    } else {
      // 신규 행 추가 시 완전 초기화
      setModalState({
        materialType: '',
        materialCategory: '',
        materials: [],
        filteredMaterials: [],
        selectedMaterial: null,
        parentMaterialType: '',
        parentMaterialCategory: '',
        parentMaterials: [],
        parentFilteredMaterials: [],
        selectedParentMaterial: null
      });
    }
  }, [open, rowData, materials, findMaterialById, filterMaterialsByType, filterByCategory]);

  // 필드 값 변경 시 validation 상태 업데이트
  useEffect(() => {
    const fieldValidity = checkFieldsValidity();
    
    setValidation(prev => {
      // 필드 값이 있으면 에러 표시 안 함(true), 없으면 에러 표시(false)
      const newValidation = {
        materialType: fieldValidity.materialType,
        materialCategory: fieldValidity.materialCategory,
        selectedMaterial: fieldValidity.selectedMaterial,
        parentMaterialType: fieldValidity.parentMaterialType,
        parentMaterialCategory: fieldValidity.parentMaterialCategory,
        selectedParentMaterial: fieldValidity.selectedParentMaterial
      };
      
      // 상태가 같으면 불필요한 리렌더링 방지
      if (JSON.stringify(prev) === JSON.stringify(newValidation)) {
        return prev;
      }
      return newValidation;
    });
  }, [
    modalState.materialType,
    modalState.materialCategory,
    modalState.selectedMaterial,
    modalState.parentMaterialType,
    modalState.parentMaterialCategory,
    modalState.selectedParentMaterial,
    checkFieldsValidity
  ]);

  // 자재 타입 변경 핸들러
  const handleTypeChange = (materialType) => {
    if (!materials) return;

    const filteredMaterials = filterMaterialsByType(materialType);

    setModalState(prev => ({
      ...prev,
      materialType,
      materials: filteredMaterials,
      filteredMaterials,
      materialCategory: '',
      selectedMaterial: null
    }));
  };

  // 부모 자재 타입 변경 핸들러
  const handleParentTypeChange = (parentMaterialType) => {
    if (!materials) return;

    const filteredParentMaterials = filterMaterialsByType(parentMaterialType);

    setModalState(prev => ({
      ...prev,
      parentMaterialType,
      parentMaterials: filteredParentMaterials,
      parentFilteredMaterials: filteredParentMaterials,
      parentMaterialCategory: '',
      selectedParentMaterial: null
    }));
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (materialCategory) => {
    const filteredMaterials = filterByCategory(modalState.materials, materialCategory);

    setModalState(prev => ({
      ...prev,
      materialCategory,
      filteredMaterials,
      selectedMaterial: null
    }));
  };

  // 부모 카테고리 변경 핸들러
  const handleParentCategoryChange = (parentMaterialCategory) => {
    const parentFilteredMaterials = filterByCategory(modalState.parentMaterials, parentMaterialCategory);

    setModalState(prev => ({
      ...prev,
      parentMaterialCategory,
      parentFilteredMaterials,
      selectedParentMaterial: null
    }));
  };

  // 자재 선택 핸들러
  const handleSelect = (materialId) => {
    const selectedMaterial = findMaterialById(materialId);

    setModalState(prev => ({
      ...prev,
      selectedMaterial
    }));
  };

  // 부모 자재 선택 핸들러
  const handleParentSelect = (materialId) => {
    const selectedParentMaterial = findMaterialById(materialId);

    setModalState(prev => ({
      ...prev,
      selectedParentMaterial
    }));
  };

  // 선택 완료 핸들러
  const handleComplete = (onClose) => {
    // 모든 필드 유효성 체크
    if (!isAllValid) {
      // 유효성 검사 실패 시 에러 표시 후 종료
      setValidation({
        materialType: !!modalState.materialType,
        materialCategory: !!modalState.materialCategory,
        selectedMaterial: !!modalState.selectedMaterial,
        parentMaterialType: !!modalState.parentMaterialType,
        parentMaterialCategory: !!modalState.parentMaterialCategory,
        selectedParentMaterial: !!modalState.selectedParentMaterial
      });
      return;
    }

    const { selectedMaterial, selectedParentMaterial } = modalState;
    const {
      systemMaterialId,
      userMaterialId,
      materialName,
      materialStandard,
      unit,
      materialType,
      materialCategory
    } = selectedMaterial;
    const {
      systemMaterialId: parentSystemMaterialId,
      userMaterialId: parentUserMaterialId,
      materialName: parentMaterialName,
      materialType: parentMaterialType,
      materialCategory: parentMaterialCategory
    } = selectedParentMaterial;

    // rowData가 있으면 수정, 없으면 새 행 추가
    if (rowData) {
      // 기존 행 수정
      setBomDetailList(prev => prev.map(row => {
        if (row.id === rowData.id) {
          return {
            ...row,
            systemMaterialId,
            userMaterialId,
            materialName,
            materialStandard,
            unit,
            materialType,
            materialCategory,
            parentItemCd: parentSystemMaterialId,
            parentMaterialName,
            userParentItemCd: parentUserMaterialId,
            parentMaterialType,
            parentMaterialCategory
          };
        }
        return row;
      }));
    } else {
      // 새 행 추가
      setBomDetailList(prev => [...prev, {
        id: generateId('NEW'),
        systemMaterialId,
        userMaterialId,
        materialName,
        materialStandard,
        unit,
        materialType,
        materialCategory,
        parentItemCd: parentSystemMaterialId,
        parentMaterialName,
        userParentItemCd: parentUserMaterialId,
        parentMaterialType,
        parentMaterialCategory,
        bomLevel: 1,
        itemQty: 0,
        remark: ''
      }]);
    }

    if (apiRef && apiRef.current && rowData) {
      apiRef.current.startCellEditMode({
        id: rowData.id,
        field: 'bomLevel',
      });
    }

    Message.showSuccess('BOM 자재 정보가 입력되었습니다. 수정 중인 행에서 BOM 레벨과 필요 자재 수량을 입력한 뒤 반드시 저장 버튼을 눌러 저장해주세요.');
    onClose && onClose();
  };

  return {
    modalState,
    validation,
    isAllValid,
    loadMaterials,
    handleTypeChange,
    handleParentTypeChange,
    handleCategoryChange,
    handleParentCategoryChange,
    handleSelect,
    handleParentSelect,
    handleComplete
  };
};

export default useBomDetailModalData;
