/**
 * 작업지시 데이터 포맷 함수
 * 그리드 표시에 적합한 형태로 작업지시 데이터를 변환합니다.
 *
 * @param {Object} data - API로부터 받은 작업지시 데이터
 * @returns {Array} 포맷된 작업지시 배열
 */
export const formatWorkOrderData = (data) => {
  if (!data?.workOrders) {
    return [];
  }

  return data.workOrders.map((order) => ({
    ...order,
    id: order.workOrderId, // 그리드에서 고유 식별자로 사용
    orderQty: order.orderQty ? Number(order.orderQty) : 0,
    createDate: order.createDate ? new Date(order.createDate) : null,
    updateDate: order.updateDate ? new Date(order.updateDate) : null
  }));
};

/**
 * 생산실적 데이터 포맷 함수
 * 그리드 표시에 적합한 형태로 생산실적 데이터를 변환합니다.
 *
 * @param {Object} data - API로부터 받은 생산실적 데이터
 * @returns {Array} 포맷된 생산실적 배열
 */
export const formatProductionResultData = (data) => {
  if (!data?.productionResultsByWorkOrderId) {
    return [];
  }

  return data.productionResultsByWorkOrderId.map((result) => ({
    ...result,
    id: result.prodResultId || result.id, // 그리드에서 고유 식별자로 사용
    goodQty: result.goodQty ? Number(result.goodQty) : 0,
    defectQty: result.defectQty ? Number(result.defectQty) : 0,
    progressRate: result.progressRate ? Number(result.progressRate) : 0,
    defectRate: result.defectRate ? Number(result.defectRate) : 0,
    createDate: result.createDate ? new Date(result.createDate) : null,
    updateDate: result.updateDate ? new Date(result.updateDate) : null
  }));
};