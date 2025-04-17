import { useCallback, useState } from 'react';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import { useWorkOrder } from './useWorkOrder';
import Message from '../../../../utils/message/Message';
import { WORK_ORDERS_QUERY } from './graphql-queries';

/**
 * 작업지시 관련 로직을 관리하는 커스텀 훅
 */
export const useProductionWorkOrder = () => {
  const { executeQuery } = useGraphQL();
  const [isLoading, setIsLoading] = useState(true);
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

  // 작업지시 목록 새로고침 함수
  const refreshWorkOrderList = useCallback((onRefreshed) => {
    setIsLoading(true);

    executeQuery({
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
      setIsLoading(false);
    })
    .catch(error => {
      console.error("Error refreshing work orders:", error);
      setIsLoading(false);

      if (onRefreshed) {
        onRefreshed();
      }
    });
  }, [executeQuery, formatWorkOrderGridData, setWorkOrderList, currentFilter]);

  // 작업지시 목록 로드 함수
  const loadWorkOrders = useCallback((filter = {}) => {
    setIsLoading(true);

    // 기본 필터 설정
    const searchFilter = {
      ...filter,
      state: filter.state || ['IN_PROGRESS'],
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
        const formattedData = formatWorkOrderGridData(response.data);
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
  }, [executeQuery, formatWorkOrderGridData, setWorkOrderList]);

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