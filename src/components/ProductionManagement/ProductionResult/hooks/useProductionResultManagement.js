import { useCallback, useEffect, useState, useRef } from 'react';
import { useProductionWorkOrder } from './useProductionWorkOrder';
import { useProductionResultOperations } from './useProductionResultOperations';
import { useProductionFormHandling } from './useProductionFormHandling';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import { PRODUCTS_QUERY, EQUIPMENTS_QUERY } from './graphql-queries';
import { enrichProductWithDisplayValues } from '../utils/materialTypeUtils';
import Message from '../../../../utils/message/Message'

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

  // 작업지시 관련 상태 초기화 여부 추적
  const isInitialDataLoaded = useRef(false);

  // API 호출 중복 방지를 위한 ref
  const isLoadingRef = useRef(false);

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

  // 제품 정보 로드 함수 - 메모이제이션 추가 및 중복 호출 방지
  const loadProductMaterials = useCallback(async (forceLoad = false) => { // forceLoad 파라미터 추가
    if (forceLoad || (!isProductMaterialsLoaded && !isLoadingRef.current)) {
      isLoadingRef.current = true;

      try {
        setIsLoading(true);
        const response = await executeQuery({ query: PRODUCTS_QUERY });

        if (response?.data?.productMaterials) {
          // 제품 정보에 표시값 추가
          const enrichedProducts = response.data.productMaterials.map(
              product => enrichProductWithDisplayValues(product)
          );

          // 반드시 상태 업데이트
          setProductOptions(enrichedProducts);
          setIsProductMaterialsLoaded(true);

          return enrichedProducts; // 로드된 제품 정보 반환
        } else {
          console.log("제품 정보가 없거나 형식이 맞지 않습니다.");
          return [];
        }
      } catch (error) {
        console.error("제품 정보 로드 오류:", error);
        alert('제품 정보를 불러오는데 실패했습니다.');
        return [];
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    }

    // 이미 로드된 경우 제품 옵션 반환
    return productOptions;
  }, [executeQuery, isProductMaterialsLoaded, productOptions, setIsLoading]);

  // 설비 정보 로드 함수 - 중복 호출 방지
  const loadEquipments = useCallback(async () => {
    // 이미 설비 정보가 있거나 로딩 중인 경우 중복 호출 방지
    if (equipmentOptions.length > 0 || isLoadingRef.current) {
      return equipmentOptions;
    }

    isLoadingRef.current = true;

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
        return formattedEquipments;
      }
      return [];
    } catch (error) {
      console.error("설비 정보 로드 오류:", error);
      return [];
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [executeQuery, equipmentOptions, setIsLoading]);

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

  // 작업지시 선택 핸들러 - 중복 선택 방지
  const handleWorkOrderSelect = useCallback((params) => {
    const workOrder = workOrderList.find(w => w.id === params.id);
    if (workOrder) {
      // 이미 선택된 작업지시인 경우 스킵
      if (selectedWorkOrder && selectedWorkOrder.id === workOrder.id) {
        return;
      }

      setSelectedWorkOrder(workOrder);

      // 선택한 작업지시의 생산실적 목록 조회
      loadProductionResults(workOrder, setProductionResultList, setProductionResult);
    }
  }, [workOrderList, loadProductionResults, selectedWorkOrder]);

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

  // 초기 데이터 로드를 위한 useEffect - 중복 호출 방지 로직 추가
  useEffect(() => {
    const loadInitialData = async () => {
      // 이미 초기화되어 있으면 중복 로드하지 않음
      if (isInitialDataLoaded.current) {

        // 제품 정보가 없는 경우 다시 로드 시도
        if (productOptions.length === 0) {
          await loadProductMaterials(true);
        }

        return;
      }

      // 로딩 중복 방지
      if (isLoadingRef.current) {
        return;
      }

      isLoadingRef.current = true;

      try {
        setIsLoading(true);

        // 먼저 제품 목록 강제 로드 (forceLoad = true)
        await loadProductMaterials(true);

        // 설비 목록 로드
        await loadEquipments();

        // 제품 및 설비 로드 완료 후에 작업지시 목록 로드
        await loadWorkOrders({
          state: ['IN_PROGRESS'],
          flagActive: true
        });

        isInitialDataLoaded.current = true;
      } catch (error) {
        console.error("초기 데이터 로드 중 오류:", error);
        Message.showError({ message: '데이터 로드 중 오류가 발생했습니다.' });
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    };

    // 초기 데이터 로드
    loadInitialData();
  }, [loadProductMaterials, loadEquipments, loadWorkOrders, setIsLoading, productOptions]);;

  // 작업지시 목록 자동 갱신을 위한 useEffect - 별도로 분리하여 중복 호출 방지
  useEffect(() => {
    let intervalId = null;

    // 초기 데이터가 로드되었고 로딩 중이 아닐 때만 인터벌 시작
    if (isInitialDataLoaded.current && !isLoading && !isLoadingRef.current) {
      intervalId = setInterval(() => {
        // 로딩 중이 아닐 때만 갱신
        if (!isLoadingRef.current) {
          refreshWorkOrderList();
        }
      }, 60000); // 1분마다 갱신
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoading, refreshWorkOrderList]);

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