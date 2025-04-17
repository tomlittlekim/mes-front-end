import { useCallback, useState, useRef } from 'react';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import { useWorkOrder } from './useWorkOrder';
import Message from '../../../../utils/message/Message';
import { WORK_ORDERS_QUERY } from './graphql-queries';

/**
 * 작업지시 관련 로직을 관리하는 커스텀 훅
 */
export const useProductionWorkOrder = () => {
  const { executeQuery } = useGraphQL();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [currentFilter, setCurrentFilter] = useState({
    state: ['IN_PROGRESS'],
    flagActive: true
  });

  const {
    workOrderList,
    setWorkOrderList,
    formatWorkOrderGridData
  } = useWorkOrder();

  // API 호출 중복 방지를 위한 ref
  const isLoadingRef = useRef(false);
  const lastFilterRef = useRef(null);

  // 작업지시 목록 새로고침 함수 - 중복 호출 방지
  const refreshWorkOrderList = useCallback((onRefreshed) => {
    // 이미 로딩 중인 경우 중복 호출 방지
    if (isLoadingRef.current) {
      if (onRefreshed) {
        onRefreshed();
      }
      return Promise.resolve();
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    return executeQuery({
      query: WORK_ORDERS_QUERY,
      variables: { filter: currentFilter }
    })
    .then(response => {
      if (response.data) {
        const formattedData = formatWorkOrderGridData(response.data);
        setWorkOrderList(formattedData);

        if (onRefreshed) {
          onRefreshed();
        }
      }
      return response;
    })
    .catch(error => {
      console.error("Error refreshing work orders:", error);
      if (onRefreshed) {
        onRefreshed();
      }
      return error;
    })
    .finally(() => {
      setIsLoading(false);
      isLoadingRef.current = false;
    });
  }, [executeQuery, formatWorkOrderGridData, setWorkOrderList, currentFilter]);

  // 작업지시 목록 로드 함수 - 중복 호출 및 동일 요청 방지
  const loadWorkOrders = useCallback((filter = {}) => {
    // 이미 로딩 중인 경우 중복 호출 방지
    if (isLoadingRef.current) {
      return Promise.resolve();
    }

    // 기본 필터 설정
    const searchFilter = {
      ...filter,
      state: filter.state || ['IN_PROGRESS'],
      flagActive: filter.flagActive !== undefined ? filter.flagActive : true
    };

    // 동일한 필터로 중복 요청인 경우 스킵
    if (
        lastFilterRef.current &&
        JSON.stringify(lastFilterRef.current) === JSON.stringify(searchFilter)
    ) {
      return Promise.resolve({ data: { workOrders: workOrderList } });
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    // 현재 필터 상태 업데이트
    setCurrentFilter(searchFilter);
    lastFilterRef.current = searchFilter;

    return executeQuery({
      query: WORK_ORDERS_QUERY,
      variables: { filter: searchFilter }
    })
    .then(response => {
      if (response.data) {
        const formattedData = formatWorkOrderGridData(response.data);
        setWorkOrderList(formattedData);
      } else {
        setWorkOrderList([]);
      }
      return response;
    })
    .catch(error => {
      console.error("Error fetching work orders:", error);
      Message.showError({ message: '데이터를 불러오는데 실패했습니다.' });
      setWorkOrderList([]);
      throw error;
    })
    .finally(() => {
      setIsLoading(false);
      isLoadingRef.current = false;
    });
  }, [executeQuery, formatWorkOrderGridData, setWorkOrderList, workOrderList]);

  return {
    workOrderList,
    selectedWorkOrder,
    setSelectedWorkOrder,
    isLoading,
    setIsLoading,
    refreshWorkOrderList,
    loadWorkOrders,
    currentFilter
  };
};