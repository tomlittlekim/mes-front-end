import {useCallback, useEffect, useState} from 'react';
import {useProductionWorkOrder} from './useProductionWorkOrder';
import {useProductionResultOperations} from './useProductionResultOperations';
import {useProductionFormHandling} from './useProductionFormHandling';
import {useGraphQL} from '../../../../apollo/useGraphQL';
import {PRODUCTS_QUERY, EQUIPMENTS_QUERY} from './graphql-queries';
import {enrichProductWithDisplayValues} from '../utils/materialTypeUtils';

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
  const [productOptions, setProductOptions] = useState([]);
  const [isProductMaterialsLoaded, setIsProductMaterialsLoaded] = useState(false);
  const { executeQuery } = useGraphQL();

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
    loadProductionResultsByFilter,
    saveResult,
    deleteResult,
    createResult,
    createIndependentResult,
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

  // 제품 정보 로드 함수
  const loadProductMaterials = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await executeQuery({ query: PRODUCTS_QUERY });

      if (response?.data?.productMaterials) {
        console.log("제품 정보 로드 성공:", response.data.productMaterials.length);

        // 제품 정보에 표시값 추가
        const enrichedProducts = response.data.productMaterials.map(
            product => enrichProductWithDisplayValues(product)
        );

        setProductOptions(enrichedProducts);
        setIsProductMaterialsLoaded(true);
      }
    } catch (error) {
      console.error("제품 정보 로드 오류:", error);
      alert('제품 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [executeQuery]);

  // 설비 정보 로드 함수
  const loadEquipments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await executeQuery({
        query: EQUIPMENTS_QUERY,
        variables: {
          filter: {
            factoryId: '',
            factoryName: '',
            lineId: '',
            lineName: '',
            equipmentId: '',
            equipmentName: '',
            equipmentSn: '',
            equipmentType: ''
          }
        }
      });

      if (response?.data?.getEquipments) {
        // 설비 정보를 드롭박스 옵션 형식으로 변환
        const formattedEquipments = response.data.getEquipments.map(equipment => ({
          value: equipment.equipmentId,
          label: `${equipment.equipmentName || ''} (${equipment.equipmentId})`,
          factoryName: equipment.factoryName,
          lineName: equipment.lineName,
          equipmentType: equipment.equipmentType
        }));

        setEquipmentOptions(formattedEquipments);
      }
    } catch (error) {
      console.error("설비 정보 로드 오류:", error);
    } finally {
      setIsLoading(false);
    }
  }, [executeQuery]);

  // 작업지시 선택 핸들러
  const handleWorkOrderSelect = useCallback((params) => {
    const workOrder = workOrderList.find(w => w.id === params.id);
    if (workOrder) {
      setSelectedWorkOrder(workOrder);

      // 선택한 작업지시의 생산실적 목록 조회
      loadProductionResults(workOrder, setProductionResultList, setProductionResult);
    }
  }, [workOrderList, loadProductionResults]);

  // 생산실적 생성 핸들러 (작업지시 기반)
  const handleCreateResult = useCallback(() => {
    if (!selectedWorkOrder) {
      // 작업지시가 선택되지 않았을 때 안내 메시지
      alert('작업지시를 선택한 후 등록해주세요.');
      return;
    }
    createResult(setProductionResultList, setProductionResult, productionResultList);
  }, [createResult, productionResultList, selectedWorkOrder]);

  // 생산실적 생성 핸들러 (독립형, 작업지시 없이) - 신규
  const handleCreateIndependentResult = useCallback(() => {
    createIndependentResult(setProductionResultList, setProductionResult);
  }, [createIndependentResult]);

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

  // 컴포넌트 마운트 시 초기 데이터 로드 useEffect 내에서 호출
  useEffect(() => {
    const loadData = () => {
      // 작업지시 목록 로드
      loadWorkOrders({
        state: ['IN_PROGRESS'],
        flagActive: true
      });

      // 제품 목록 로드
      loadProductMaterials();

      // 설비 목록 로드 (추가)
      loadEquipments();
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
    handleCreateIndependentResult, // 새로 추가된 독립형 생산실적 생성 함수
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
    productOptions, // 제품 옵션 목록

    // 리프레시 키
    refreshKey
  };
};

export default useProductionResultManagement;