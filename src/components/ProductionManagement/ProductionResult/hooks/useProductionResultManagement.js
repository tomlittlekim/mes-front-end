import { useCallback, useEffect, useState } from 'react';
import { useProductionWorkOrder } from './useProductionWorkOrder';
import { useProductionResultOperations } from './useProductionResultOperations';
import { useProductionFormHandling } from './useProductionFormHandling';

/**
 * 생산실적관리 컴포넌트의 로직을 처리하는 커스텀 훅
 *
 * @param {string} tabId - 탭 ID
 * @returns {Object} 생산실적관리 관련 상태와 핸들러
 */
export const useProductionResultManagement = (tabId) => {
  // 상태 관리
  const [refreshKey, setRefreshKey] = useState(0);
  const [productionResultList, setProductionResultList] = useState([]);
  const [productionResult, setProductionResult] = useState(null);
  const [equipmentOptions, setEquipmentOptions] = useState([]);

  // 작업지시 관련 훅
  const {
    workOrderList,
    selectedWorkOrder,
    setSelectedWorkOrder,
    isLoading,
    setIsLoading,
    refreshWorkOrderList,
    loadWorkOrders
  } = useProductionWorkOrder();

  // 생산실적 관련 훅
  const {
    loadProductionResults,
    saveResult,
    deleteResult,
    createResult,
    // 불량정보 모달 관련 상태 및 핸들러
    isDefectInfoModalOpen,
    openDefectInfoModal,
    closeDefectInfoModal,
    handleSaveDefectInfos,
    currentProductionResult,
    defectInfos,
    handleProductionResultEdit
  } = useProductionResultOperations(
      selectedWorkOrder,
      setSelectedWorkOrder,
      workOrderList,
      refreshWorkOrderList
  );

  // 폼 핸들링 훅
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    handleDateRangeChange,
    handleReset,
    handleSearch
  } = useProductionFormHandling(
      loadWorkOrders,
      setSelectedWorkOrder,
      setProductionResult,
      setProductionResultList
  );

  // 작업지시 선택 핸들러
  const handleWorkOrderSelect = useCallback((params) => {
    const workOrder = workOrderList.find(w => w.id === params.id);
    if (workOrder) {
      setSelectedWorkOrder(workOrder);

      // 선택한 작업지시의 생산실적 목록 조회
      loadProductionResults(workOrder, setProductionResultList, setProductionResult);
    }
  }, [workOrderList, loadProductionResults]);

  // 생산실적 생성 핸들러
  const handleCreateResult = useCallback(() => {
    createResult(setProductionResultList, setProductionResult, productionResultList);
  }, [createResult, productionResultList]);

  // 저장 핸들러
  const handleSave = useCallback(() => {
    saveResult(productionResult, productionResultList, setProductionResult, setProductionResultList);
  }, [saveResult, productionResult, productionResultList]);

  // 삭제 핸들러
  const handleDelete = useCallback(() => {
    deleteResult(productionResult, setProductionResult, setProductionResultList);
  }, [deleteResult, productionResult]);

  // 생산실적 선택 핸들러
  const handleProductionResultSelect = useCallback((params) => {
    const result = productionResultList.find(r => r.id === params.id);
    if (result) {
      setProductionResult(result);
    }
  }, [productionResultList]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    const loadData = () => {
      loadWorkOrders({
        state: ['IN_PROGRESS'],
        flagActive: true
      });
    };

    // 초기 데이터 로드
    loadData();

    // 주기적으로 작업지시 목록 갱신
    const interval = setInterval(() => {
      if (!isLoading) {
        refreshWorkOrderList();
      }
    }, 60000); // 1분마다 갱신

    return () => {
      clearInterval(interval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 설비 목록 로드
  useEffect(() => {
    // 임시 데이터 (실제 구현에서는 API 호출로 대체)
    const equipments = [
      { value: 'EQ001', label: '생산라인 1호기' },
      { value: 'EQ002', label: '생산라인 2호기' },
      { value: 'EQ003', label: '생산라인 3호기' },
      { value: 'EQ004', label: '조립라인 1호기' },
      { value: 'EQ005', label: '조립라인 2호기' }
    ];

    setEquipmentOptions(equipments);
  }, []);

  return {
    // 검색폼 관련
    control,
    handleSubmit,
    reset,
    setValue,
    handleDateRangeChange,
    handleReset,
    handleSearch,

    // 작업지시 관련
    isLoading,
    workOrderList,
    selectedWorkOrder,
    handleWorkOrderSelect,

    // 생산실적 관련
    productionResultList,
    setProductionResultList,
    productionResult,
    setProductionResult,
    handleCreateResult,
    handleSave,
    handleDelete,
    handleProductionResultSelect,

    // 불량정보 모달 관련
    isDefectInfoModalOpen,
    openDefectInfoModal,
    closeDefectInfoModal,
    handleSaveDefectInfos,
    currentProductionResult,
    defectInfos,
    handleProductionResultEdit,

    // 옵션 데이터
    equipmentOptions,

    // 리프레시 키
    refreshKey
  };
};

export default useProductionResultManagement;