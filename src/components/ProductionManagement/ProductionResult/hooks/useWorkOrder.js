import { useState, useCallback } from 'react';

/**
 * 작업지시 관련 상태와 로직을 관리하는 커스텀 훅
 *
 * @returns {Object} 작업지시 관련 상태와 함수
 */
export const useWorkOrder = () => {
  // 작업지시 목록 상태
  const [workOrderList, setWorkOrderList] = useState([]);

  // 작업지시 데이터 포맷 함수
  const formatWorkOrderGridData = useCallback((data) => {
    if (!data?.workOrders) {
      return [];
    }

    return data.workOrders.map((order) => ({
      ...order,
      id: order.workOrderId,
      orderQty: order.orderQty ? Number(order.orderQty) : 0,
      createDate: order.createDate ? new Date(order.createDate) : null,
      updateDate: order.updateDate ? new Date(order.updateDate) : null
    }));
  }, []);

  return {
    workOrderList,
    setWorkOrderList,
    formatWorkOrderGridData
  };
};

export default useWorkOrder;