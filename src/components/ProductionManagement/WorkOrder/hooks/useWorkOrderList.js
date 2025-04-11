import { useCallback, useMemo } from 'react';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import { gql } from '@apollo/client';
import Message from '../../../../utils/message/Message';

/**
 * 작업지시 목록 관련 기능 제공 커스텀 훅
 *
 * @param {Function} setWorkOrderList - 작업지시 목록 상태 설정 함수
 * @param {Function} formatWorkOrderGridData - 작업지시 데이터 포맷 함수
 * @returns {Object} 작업지시 관련 함수들
 */
export const useWorkOrderList = (setWorkOrderList, formatWorkOrderGridData) => {
  const { executeQuery } = useGraphQL();

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

  const WORK_ORDERS_BY_PLAN_QUERY = gql`
      query getWorkOrdersByProdPlanId($prodPlanId: String!) {
          workOrdersByProdPlanId(prodPlanId: $prodPlanId) {
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

  // 작업지시 목록 조회 함수 - 생산계획ID로 조회
  const fetchWorkOrdersByPlan = useCallback((prodPlanId) => {
    if (!prodPlanId) {
      setWorkOrderList([]);
      return Promise.resolve([]);
    }

    return executeQuery(WORK_ORDERS_BY_PLAN_QUERY, { prodPlanId })
    .then(response => {
      if (response.data) {
        const formattedData = formatWorkOrderGridData(response.data);
        setWorkOrderList(formattedData);
        return formattedData;
      }
      return [];
    })
    .catch(error => {
      console.error("Error fetching work orders:", error);
      Message.showError({ message: '작업지시 데이터를 불러오는데 실패했습니다.' });
      setWorkOrderList([]);
      return [];
    });
  }, [executeQuery, WORK_ORDERS_BY_PLAN_QUERY, formatWorkOrderGridData, setWorkOrderList]);

  // 작업지시 목록 조회 함수 - 필터로 조회
  const fetchWorkOrders = useCallback((filterData = {}) => {
    return executeQuery(WORK_ORDERS_QUERY, { filter: filterData })
    .then(response => {
      if (response.data) {
        const formattedData = formatWorkOrderGridData(response.data);
        setWorkOrderList(formattedData);
        return formattedData;
      }
      return [];
    })
    .catch(error => {
      console.error("Error fetching work orders:", error);
      Message.showError({ message: '작업지시 데이터를 불러오는데 실패했습니다.' });
      setWorkOrderList([]);
      return [];
    });
  }, [executeQuery, WORK_ORDERS_QUERY, formatWorkOrderGridData, setWorkOrderList]);

  // 작업지시 목록 그리드 컬럼 정의
  const workOrderColumns = useMemo(() => {
    // 컬럼 정의는 components/WorkOrderList.js로 이동
    return [];
  }, []);

  return {
    fetchWorkOrdersByPlan,
    fetchWorkOrders,
    workOrderColumns,
    WORK_ORDERS_QUERY,
    WORK_ORDERS_BY_PLAN_QUERY
  };
};

export default useWorkOrderList;