import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { useDomain, DOMAINS } from '../../../../contexts/DomainContext';
import { useTheme } from '@mui/material';
import { useGridUtils } from '../../../../utils/grid/useGridUtils';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import useLocalStorageVO from '../../../Common/UseLocalStorageVO';
import Message from '../../../../utils/message/Message';
import { printProductionResult, exportProductionResultToCSV } from '../utils/printUtils';
import { formatWorkOrderData, formatProductionResultData } from '../utils/gridDataUtils';
import { WORK_ORDERS_QUERY, PRODUCTION_RESULTS_BY_WORK_ORDER_QUERY } from '../utils/graphqlQueries';

/**
 * 생산실적조회 기능 제공 커스텀 훅
 *
 * @param {string} tabId - 탭 ID
 * @returns {Object} 생산실적조회에 필요한 상태 및 함수들
 */
export const useProductionResultInquiry = (tabId) => {
  // 테마, 도메인 및 시스템 설정
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const { loginUser } = useLocalStorageVO();

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
  const [workOrderList, setWorkOrderList] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [productionResultList, setProductionResultList] = useState([]);
  const [currentFilter, setCurrentFilter] = useState({
    state: ['COMPLETED'],
    flagActive: true
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [equipmentOptions, setEquipmentOptions] = useState([
    { value: 'EQ001', label: '생산라인 1호기' },
    { value: 'EQ002', label: '생산라인 2호기' },
    { value: 'EQ003', label: '생산라인 3호기' },
    { value: 'EQ004', label: '조립라인 1호기' },
    { value: 'EQ005', label: '조립라인 2호기' }
  ]);

  // GraphQL 기능 사용
  const { executeQuery } = useGraphQL();

  // 그리드 유틸리티 훅 사용
  const { formatDateToYYYYMMDD } = useGridUtils();

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

    // 초기화 시 작업지시 목록과 생산실적 목록도 초기화
    setSelectedWorkOrder(null);
    setProductionResultList([]);

    // 기본 검색 조건으로 데이터 로드 (완료된 작업지시만)
    loadWorkOrders({
      state: ['COMPLETED'],
      flagActive: true
    });
  }, [reset, setValue]);

  // 작업지시 데이터 포맷 함수 (외부 유틸리티로 이동)
  /* formatWorkOrderData 함수가 gridDataUtils.js로 이동 */

  // 생산실적 데이터 포맷 함수 (외부 유틸리티로 이동)
  /* formatProductionResultData 함수가 gridDataUtils.js로 이동 */

  // 작업지시 목록 로드 함수
  const loadWorkOrders = useCallback((filter = {}) => {
    setIsLoading(true);

    // 기본 필터 설정 - 완료된 작업지시만 조회
    const searchFilter = {
      ...filter,
      state: filter.state || ['COMPLETED'],
      flagActive: filter.flagActive !== undefined ? filter.flagActive : true
    };

    // 현재 필터 상태 업데이트
    setCurrentFilter(searchFilter);

    return executeQuery({
      query: WORK_ORDERS_QUERY,
      variables: { filter: searchFilter }
    })
    .then(response => {
      if (response.data) {
        const formattedData = formatWorkOrderData(response.data);
        setWorkOrderList(formattedData);
      } else {
        setWorkOrderList([]);
      }
      setIsLoading(false);
      return response;
    })
    .catch(error => {
      console.error("Error fetching work orders:", error);
      Message.showError({ message: '데이터를 불러오는데 실패했습니다.' });
      setIsLoading(false);
      setWorkOrderList([]);
      throw error;
    });
  }, [executeQuery, formatWorkOrderData]);

  // 생산실적 목록 로드 함수
  const loadProductionResults = useCallback((workOrder) => {
    if (workOrder && workOrder.workOrderId) {
      executeQuery({
        query: PRODUCTION_RESULTS_BY_WORK_ORDER_QUERY,
        variables: { workOrderId: workOrder.workOrderId }
      })
      .then(response => {
        if (response.data && response.data.productionResultsByWorkOrderId) {
          const results = formatProductionResultData(response.data);
          setProductionResultList(results);
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
  }, [executeQuery, formatProductionResultData]);

  // 작업지시 선택 핸들러
  const handleWorkOrderSelect = useCallback((params) => {
    const workOrder = workOrderList.find(w => w.id === params.id);
    if (workOrder) {
      setSelectedWorkOrder(workOrder);
      loadProductionResults(workOrder);
    }
  }, [workOrderList, loadProductionResults]);

  // 검색 실행 함수
  const handleSearch = useCallback((data) => {
    // 선택 상태 초기화
    setSelectedWorkOrder(null);
    setProductionResultList([]);

    // 날짜 형식 변환과 필터 객체 생성
    const filter = {
      state: ['COMPLETED'], // 완료된 작업지시만 조회
      flagActive: true
    };

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

    // 작업지시 검색
    loadWorkOrders(filter);
  }, [loadWorkOrders]);

  // 출력 핸들러
  const handlePrint = useCallback(() => {
    printProductionResult(selectedWorkOrder, productionResultList, loginUser?.userName);
  }, [selectedWorkOrder, productionResultList, loginUser?.userName]);

  // 엑셀 내보내기 핸들러
  const handleExport = useCallback(() => {
    exportProductionResultToCSV(selectedWorkOrder, productionResultList);
  }, [productionResultList, selectedWorkOrder]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 첫 마운트 시 한 번만 실행하기 위한 플래그
    let isMounted = true;

    const init = () => {
      if (isMounted) {
        // 기본 날짜 범위 설정 (오늘부터 1주일)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        setValue('dateRange', {
          startDate,
          endDate
        });

        // 초기 데이터 로드 (완료된 작업지시만)
        loadWorkOrders({
          state: ['COMPLETED'],
          flagActive: true
        });
      }
    };

    // setTimeout을 사용해 렌더링 사이클과 분리
    const timeoutId = setTimeout(init, 100);

    // cleanup 함수
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 의존성 배열을 비워서 한 번만 실행되도록 설정

  // 도메인별 색상 설정 함수
  const getTextColor = useCallback(() => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
    }
    return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
  }, [domain, isDarkMode]);

  const getBgColor = useCallback(() => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(45, 30, 15, 0.5)' : 'rgba(252, 235, 212, 0.6)';
    }
    return isDarkMode ? 'rgba(0, 27, 63, 0.5)' : 'rgba(232, 244, 253, 0.6)';
  }, [domain, isDarkMode]);

  const getBorderColor = useCallback(() => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#1e3a5f' : '#e0e0e0';
  }, [domain, isDarkMode]);

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
    handlePrint,
    handleExport,

    // 색상 및 테마
    getTextColor,
    getBgColor,
    getBorderColor,

    // 설비 옵션
    equipmentOptions,

    // 리프레시 키
    refreshKey
  };
};

export default useProductionResultInquiry;