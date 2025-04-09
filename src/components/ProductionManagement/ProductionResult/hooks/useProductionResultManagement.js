import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { gql } from '@apollo/client';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import { useGridUtils } from '../../../../utils/grid/useGridUtils';
import Message from '../../../../utils/message/Message';
import { useDefectInfo } from './useDefectInfo';
import { useWorkOrder } from './useWorkOrder';
import { useProductionResult } from './useProductionResult';

// GraphQL 쿼리 정의
const WORK_ORDERS_QUERY = gql`
    query getWorkOrders($filter: WorkOrderFilter) {
        workOrders(filter: $filter) {
            site
            compCd
            workOrderId
            prodPlanId
            productId
            orderQty
            shiftType
            state
            flagActive
            createUser
            createDate
            updateUser
            updateDate
        }
    }
`;

const PRODUCTION_RESULTS_BY_WORK_ORDER_QUERY = gql`
    query getProductionResultsByWorkOrderId($workOrderId: String!) {
        productionResultsByWorkOrderId(workOrderId: $workOrderId) {
            id
            workOrderId
            prodResultId
            goodQty
            defectQty
            progressRate
            defectRate
            equipmentId
            resultInfo
            defectCause
            createUser
            createDate
            updateUser
            updateDate
            flagActive
        }
    }
`;

const GET_DEFECT_INFO_BY_PROD_RESULT_QUERY = gql`
    query getDefectInfoByProdResultId($prodResultId: String!) {
        defectInfoByProdResultId(prodResultId: $prodResultId) {
            defectId
            workOrderId
            prodResultId
            productId
            defectQty
            defectType
            defectReason
            resultInfo
            state
            defectCause
            createDate
            createUser
        }
    }
`;

/**
 * 생산실적관리 컴포넌트의 로직을 처리하는 커스텀 훅
 *
 * @param {string} tabId - 탭 ID
 * @returns {Object} 생산실적관리 관련 상태와 핸들러
 */
export const useProductionResultManagement = (tabId) => {
  // API 연동 및 유틸리티
  const { executeQuery, executeMutation } = useGraphQL();
  const { formatDateToYYYYMMDD } = useGridUtils();

  // 작업지시 관련 훅
  const {
    workOrderList,
    setWorkOrderList,
    formatWorkOrderGridData
  } = useWorkOrder();

  // 생산실적 관련 훅
  const {
    saveProductionResult,
    deleteProductionResult
  } = useProductionResult();

  // 불량정보 관련 훅
  const {
    defectList,
    setDefectList,
    saveDefectInfo,
    handleOpenDefectModal,
    handleEditDefect,
    handleDeleteDefect,
    handleQtyChange
  } = useDefectInfo();

  // React Hook Form 설정
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      workOrderId: '',
      productId: '',
      equipmentId: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [productionResult, setProductionResult] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [productionResultList, setProductionResultList] = useState([]);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [defectTypeOptions, setDefectTypeOptions] = useState([]);

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = useCallback((startDate, endDate) => {
    setValue('dateRange', { startDate, endDate });
  }, [setValue]);

  // 초기화 함수
  const handleReset = useCallback(() => {
    reset({
      workOrderId: '',
      productId: '',
      equipmentId: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    });
  }, [reset]);

  // API 통신 시 Date 객체를 문자열로 변환하는 함수
  const formatDateToString = useCallback((dateObj) => {
    if (!dateObj) {
      return null;
    }

    // 이미 적절한 형식의 문자열인 경우
    if (typeof dateObj === 'string') {
      if (/^\d{4}-\d{2}-\d{2}/.test(dateObj)) {
        return dateObj;
      }

      try {
        return format(new Date(dateObj), 'yyyy-MM-dd');
      } catch (error) {
        console.error("Invalid date string:", dateObj);
        return null;
      }
    }

    // Date 객체 처리
    try {
      return format(dateObj, 'yyyy-MM-dd');
    } catch (error) {
      console.error("Error formatting date:", dateObj);
      return null;
    }
  }, []);

  // 검색 실행 함수
  const handleSearch = useCallback((data) => {
    setIsLoading(true);
    setSelectedWorkOrder(null);
    setProductionResult(null);
    setDefectList([]);

    // 날짜 형식 변환과 필터 객체 생성
    const filter = {};

    // workOrderId가 있으면 추가
    if (data.workOrderId) {
      filter.workOrderId = data.workOrderId;
    }

    // productId가 있으면 추가
    if (data.productId) {
      filter.productId = data.productId;
    }

    // equipmentId가 있으면 추가
    if (data.equipmentId) {
      filter.equipmentId = data.equipmentId;
    }

    // dateRange 객체에서 시작일/종료일을 추출하여 필터 데이터로 변환
    if (data.dateRange) {
      if (data.dateRange.startDate) {
        try {
          filter.planStartDateFrom = format(data.dateRange.startDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid startDate:", error);
        }
      }

      if (data.dateRange.endDate) {
        try {
          filter.planStartDateTo = format(data.dateRange.endDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid endDate:", error);
        }
      }
    }

    // 상태 필터 - 생산 가능한 상태의 작업지시만 조회 ('COMPLETED', 'CANCELED' 제외)
    filter.state = ['PLANNED', 'IN_PROGRESS']; // 배열로 전달하면 서버에서 처리

    // flagActive는 항상 true로 설정 (활성화된 데이터만 조회)
    filter.flagActive = true;

    // 작업지시 검색
    executeQuery({
      query: WORK_ORDERS_QUERY,
      variables: { filter }
    })
    .then(response => {
      if (response.data) {
        const formattedData = formatWorkOrderGridData(response.data);
        setWorkOrderList(formattedData);
        setRefreshKey(prev => prev + 1);
      }
      setIsLoading(false);
    })
    .catch(error => {
      console.error("Error fetching work orders:", error);
      Message.showError({ message: '데이터를 불러오는데 실패했습니다.' });
      setIsLoading(false);
      setWorkOrderList([]);
    });
  }, [executeQuery, formatWorkOrderGridData, setWorkOrderList, setDefectList]);

  // 작업지시 선택 핸들러
  const handleWorkOrderSelect = useCallback((params) => {
    const workOrder = workOrderList.find(w => w.id === params.id);
    setSelectedWorkOrder(workOrder);
    setProductionResult(null); // 선택 초기화

    if (workOrder && workOrder.workOrderId) {
      // 선택한 작업지시의 생산실적 목록 조회
      executeQuery({
        query: PRODUCTION_RESULTS_BY_WORK_ORDER_QUERY,
        variables: { workOrderId: workOrder.workOrderId }
      })
      .then(response => {
        if (response.data && response.data.productionResultsByWorkOrderId) {
          setProductionResultList(response.data.productionResultsByWorkOrderId.map(result => ({
            ...result,
            id: result.prodResultId
          })));
        } else {
          setProductionResultList([]);
        }
      })
      .catch(error => {
        console.error("Error fetching production results:", error);
        setProductionResultList([]);
      });
    } else {
      setProductionResultList([]);
    }
  }, [workOrderList, executeQuery]);

  // 불량정보 조회
  const loadDefectInfo = useCallback((prodResultId) => {
    if (!prodResultId) {
      setDefectList([]);
      return;
    }

    executeQuery({
      query: GET_DEFECT_INFO_BY_PROD_RESULT_QUERY,
      variables: { prodResultId }
    })
    .then(response => {
      if (response.data && response.data.defectInfoByProdResultId) {
        const defects = response.data.defectInfoByProdResultId.map(defect => ({
          ...defect,
          defectName: defect.defectType // UI에서 표시용
        }));
        setDefectList(defects);
      } else {
        setDefectList([]);
      }
    })
    .catch(error => {
      console.error("Error fetching defect info:", error);
      setDefectList([]);
    });
  }, [executeQuery, setDefectList]);

  // 새 생산실적 생성 핸들러
  const handleCreateResult = useCallback(() => {
    if (!selectedWorkOrder) {
      Message.showWarning('작업지시를 선택해주세요.');
      return;
    }

    // 새 생산실적 객체 생성
    const newResult = {
      id: null,
      workOrderId: selectedWorkOrder.workOrderId,
      prodResultId: null, // 서버에서 생성될 ID
      goodQty: 0,
      defectQty: 0,
      progressRate: "0.0",
      defectRate: "0.0",
      equipmentId: "",
      resultInfo: "",
      defectCause: "",
      flagActive: true
    };

    setProductionResult(newResult);
    setDefectList([]);
  }, [selectedWorkOrder, setDefectList]);

  // 저장 버튼 클릭 핸들러
  const handleSave = useCallback(() => {
    if (!selectedWorkOrder) {
      Message.showWarning('작업지시를 선택해주세요.');
      return;
    }

    if (!productionResult) {
      Message.showWarning('저장할 생산실적이 없습니다.');
      return;
    }

    // 필수 필드 검증
    if (!productionResult.equipmentId) {
      Message.showError({ message: '설비를 선택해주세요.' });
      return;
    }

    // 생산실적 데이터 준비
    const isNewResult = !productionResult.prodResultId;

    // 신규 또는 기존 생산실적 저장
    saveProductionResult(
        isNewResult,
        productionResult,
        selectedWorkOrder,
        defectList,
        () => {
          // 저장 후 새로고침
          if (selectedWorkOrder) {
            handleWorkOrderSelect({ id: selectedWorkOrder.id });
          }
        }
    );
  }, [selectedWorkOrder, productionResult, defectList, saveProductionResult, handleWorkOrderSelect]);

  // 삭제 버튼 클릭 핸들러
  const handleDelete = useCallback(() => {
    if (!selectedWorkOrder || !productionResult || !productionResult.prodResultId) {
      Message.showWarning('삭제할 생산실적을 선택해주세요.');
      return;
    }

    deleteProductionResult(
        productionResult.prodResultId,
        () => {
          // 삭제 후 초기화
          setProductionResult(null);
          setDefectList([]);

          // 작업지시는 유지하고 생산실적 목록 새로고침
          if (selectedWorkOrder) {
            handleWorkOrderSelect({ id: selectedWorkOrder.id });
          }
        }
    );
  }, [selectedWorkOrder, productionResult, deleteProductionResult, setDefectList, handleWorkOrderSelect]);

  // 생산실적 선택 핸들러
  const handleProductionResultSelect = useCallback((params) => {
    const result = productionResultList.find(r => r.id === params.id);

    if (result) {
      setProductionResult(result);

      // 선택한 생산실적의 불량정보 로드
      if (result.prodResultId) {
        loadDefectInfo(result.prodResultId);
      } else {
        setDefectList([]);
      }
    }
  }, [productionResultList, loadDefectInfo, setDefectList]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        // 직접 API 호출 로직 구현 (handleSearch 대신)
        setIsLoading(true);
        const fetchInitialData = async () => {
          try {
            const response = await executeQuery({
              query: WORK_ORDERS_QUERY,
              variables: {
                filter: {
                  state: ['PLANNED', 'IN_PROGRESS']
                }
              }
            });

            if (response.data && isMounted) {
              const formattedData = formatWorkOrderGridData(response.data);
              setWorkOrderList(formattedData);
              setRefreshKey(prev => prev + 1);
            }
            if (isMounted) {
              setIsLoading(false);
            }
          } catch (error) {
            console.error("Error fetching initial data:", error);
            if (isMounted) {
              Message.showError({ message: '데이터를 불러오는데 실패했습니다.' });
              setIsLoading(false);
              setWorkOrderList([]);
            }
          }
        };

        fetchInitialData();
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []); // 빈 의존성 배열

  // 설비 목록 로드
  useEffect(() => {
    // 실제 API를 통해 설비 목록을 가져오는 로직 구현
    // 예: 설비 조회 API 호출

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

  // 불량유형 목록 로드
  useEffect(() => {
    // 실제 API를 통해 불량유형 목록을 가져오는 로직 구현
    // 예: 불량유형 조회 API 호출

    // 임시 데이터 (실제 구현에서는 API 호출로 대체)
    const defectTypes = [
      { value: 'DF001', label: '치수불량' },
      { value: 'DF002', label: '표면불량' },
      { value: 'DF003', label: '기능불량' },
      { value: 'DF004', label: '조립불량' },
      { value: 'DF005', label: '기타불량' }
    ];

    setDefectTypeOptions(defectTypes);
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
    productionResult,
    setProductionResult,
    handleCreateResult,
    handleSave,
    handleDelete,
    handleProductionResultSelect,
    handleQtyChange,

    // 불량정보 관련
    defectList,
    setDefectList,
    handleOpenDefectModal,
    handleEditDefect,
    handleDeleteDefect,

    // 옵션 데이터
    equipmentOptions,
    defectTypeOptions,

    // 리프레시 키
    refreshKey
  };
};