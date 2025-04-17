import { useState, useCallback } from 'react';

/**
 * 작업지시 관련 상태와 로직을 관리하는 커스텀 훅
 *
 * @returns {Object} 작업지시 관련 상태와 함수
 */
export const useWorkOrder = () => {
  // 작업지시 목록 상태
  const [workOrderList, setWorkOrderListState] = useState([]);

  // setWorkOrderList 함수 최적화 - 동일한 데이터일 경우 상태 업데이트 스킵
  const setWorkOrderList = useCallback((newList) => {
    if (!newList) {
      setWorkOrderListState([]);
      return;
    }

    // 이전 목록과 ID 기준으로 동일한 경우 업데이트 스킵
    setWorkOrderListState(prevList => {
      // 배열 길이가 다르면 무조건 업데이트
      if (prevList.length !== newList.length) {
        return newList;
      }

      // ID 기준으로 동일한지 비교 (깊은 비교는 피함)
      const prevIds = new Set(prevList.map(item => item.id));
      const allIdsMatch = newList.every(item => prevIds.has(item.id));

      // 모든 ID가 일치하면 변경 없음으로 판단
      if (allIdsMatch) {
        return prevList;
      }

      return newList;
    });
  }, []);

  // 작업지시 데이터 포맷 함수 - 불필요한 변환 최소화
  const formatWorkOrderGridData = useCallback((data) => {
    if (!data?.workOrders) {
      console.log('작업지시 데이터가 없습니다.');
      return [];
    }

    const formattedData = data.workOrders.map((order) => {
      // 이미 변환된 데이터인 경우 다시 변환하지 않음
      if (order.id === order.workOrderId) {
        return order;
      }

      return {
        ...order,
        id: order.workOrderId,
        orderQty: order.orderQty ? Number(order.orderQty) : 0,
        createDate: order.createDate ? new Date(order.createDate) : null,
        updateDate: order.updateDate ? new Date(order.updateDate) : null
      };
    });

    return formattedData;
  }, []);

  return {
    workOrderList,
    setWorkOrderList,
    formatWorkOrderGridData
  };
};

export default useWorkOrder;